import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { startOfDay, endOfDay, parseISO, addHours } from 'date-fns';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class ExpensesService {
    constructor(
        private prisma: PrismaService,
        private cacheService: CacheService,
        private auditService: AuditService,
    ) { }

    async create(tenantId: string, userId: string, dto: CreateExpenseDto) {
        const expense = await this.prisma.expense.create({
            data: {
                amount: dto.amount,
                description: dto.description,
                category: dto.category,
                date: dto.date ? new Date(dto.date) : new Date(),
                supplierId: dto.supplierId,
                tenantId,
                createdById: userId,
            },
            include: {
                supplier: true,
                createdBy: {
                    select: { id: true, name: true }
                }
            }
        });

        // Invalidar cachés relacionados
        await this.cacheService.invalidatePattern(this.cacheService.generateKey(tenantId, 'analytics', '*'));
        await this.cacheService.invalidatePattern(this.cacheService.generateKey(tenantId, 'expenses', '*'));

        this.auditService.log({
            action: 'CREATE',
            entity: 'Expense',
            entityId: expense.id,
            newValue: expense,
            userId,
            tenantId,
        });

        return expense;
    }

    async findAll(tenantId: string, filters?: {
        startDate?: string;
        endDate?: string;
        category?: string;
        page?: number;
        limit?: number;
    }) {
        const page = filters?.page || 1;
        const limit = filters?.limit || 20;

        const cacheKey = this.cacheService.generateKey(
            tenantId,
            'expenses',
            'list',
            `p${page}-l${limit}-${filters?.startDate || 'all'}-${filters?.endDate || 'all'}-${filters?.category || 'all'}`
        );

        const cached = await this.cacheService.get<any>(cacheKey);
        if (cached) return cached;

        const where: any = { tenantId };
        const cashWhere: any = { type: 'EXPENSE', shift: { tenantId } };

        if (filters?.startDate || filters?.endDate) {
            where.date = {};
            cashWhere.createdAt = {};
            if (filters.startDate) {
                where.date.gte = startOfDay(parseISO(filters.startDate));
                cashWhere.createdAt.gte = startOfDay(parseISO(filters.startDate));
            }
            if (filters.endDate) {
                where.date.lte = endOfDay(parseISO(filters.endDate));
                cashWhere.createdAt.lte = endOfDay(parseISO(filters.endDate));
            }
        }

        const [generalExpenses, cashTransactions] = await Promise.all([
            this.prisma.expense.findMany({
                where: {
                    ...where,
                    // Si se filtra por una categoría específica y no es Caja, filtrar los generales
                    category: filters?.category && filters.category !== 'CASH_REGISTER' ? filters.category : where.category
                },
                orderBy: { date: 'desc' },
                include: {
                    supplier: true,
                    createdBy: {
                        select: { id: true, name: true }
                    }
                }
            }),
            // Solo buscar gastos de caja si no hay filtro de categoría o el filtro es Caja
            (!filters?.category || filters.category === 'CASH_REGISTER')
                ? this.prisma.cashTransaction.findMany({
                    where: cashWhere,
                    include: {
                        shift: {
                            include: {
                                seller: {
                                    select: { id: true, name: true }
                                }
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                })
                : Promise.resolve([])
        ]);

        // Mapear transacciones de caja al formato de Gasto
        const mappedCash = cashTransactions.map(ct => ({
            id: ct.id,
            amount: ct.amount,
            description: ct.reason,
            category: 'CASH_REGISTER',
            date: ct.createdAt,
            tenantId,
            supplierId: null,
            supplier: null,
            createdById: ct.shift.sellerId,
            createdBy: ct.shift.seller,
            createdAt: ct.createdAt,
            updatedAt: ct.createdAt,
            isCashTransaction: true // Flag para identificar que viene de caja (y no se puede borrar desde aquí tal vez?)
        }));

        const allExpenses = [...generalExpenses, ...mappedCash]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const total = allExpenses.length;
        const skip = (page - 1) * limit;
        const data = allExpenses.slice(skip, skip + limit);

        const result = {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };

        await this.cacheService.set(cacheKey, result, 60);

        return result;
    }

    async findOne(tenantId: string, id: string) {
        return this.prisma.expense.findFirst({
            where: { id, tenantId },
            include: {
                supplier: true,
                createdBy: {
                    select: { id: true, name: true }
                }
            }
        });
    }

    async update(tenantId: string, id: string, dto: UpdateExpenseDto) {
        const result = await this.prisma.expense.updateMany({
            where: { id, tenantId },
            data: {
                ...dto,
                date: dto.date ? new Date(dto.date) : undefined,
            },
        });

        await this.cacheService.invalidatePattern(this.cacheService.generateKey(tenantId, 'analytics', '*'));
        await this.cacheService.invalidatePattern(this.cacheService.generateKey(tenantId, 'expenses', '*'));

        this.auditService.log({
            action: 'UPDATE',
            entity: 'Expense',
            entityId: id,
            newValue: dto,
            tenantId,
        });

        return result;
    }

    async remove(tenantId: string, id: string) {
        const result = await this.prisma.expense.deleteMany({
            where: { id, tenantId },
        });

        await this.cacheService.invalidatePattern(this.cacheService.generateKey(tenantId, 'analytics', '*'));
        await this.cacheService.invalidatePattern(this.cacheService.generateKey(tenantId, 'expenses', '*'));

        this.auditService.log({
            action: 'DELETE',
            entity: 'Expense',
            entityId: id,
            tenantId,
        });

        return result;
    }

    async getSummary(tenantId: string, startDateStr: string, endDateStr: string) {
        const startDate = addHours(startOfDay(parseISO(startDateStr)), 5);
        const endDate = addHours(endOfDay(parseISO(endDateStr)), 5);

        // 1. Obtener gastos generales agrupados por categoría
        const generalExpenses = await this.prisma.expense.groupBy({
            by: ['category'],
            where: {
                tenantId,
                date: {
                    gte: startDate,
                    lte: endDate,
                }
            },
            _sum: {
                amount: true
            }
        });

        // 2. Obtener gastos de caja (CashTransaction type EXPENSE)
        const cashExpenses = await this.prisma.cashTransaction.findMany({
            where: {
                type: 'EXPENSE',
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
                shift: {
                    tenantId
                }
            },
            select: {
                amount: true
            }
        });

        const totalCashExpenses = cashExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

        const byCategory = generalExpenses.map(e => ({
            category: e.category,
            total: Number(e._sum.amount || 0)
        }));

        // Si hay gastos de caja, los agregamos como una "categoría" especial para que el frontend los muestre
        if (totalCashExpenses > 0) {
            byCategory.push({
                //@ts-ignore
                category: 'CASH_REGISTER',
                total: totalCashExpenses
            });
        }

        const totalExpenses = byCategory.reduce((sum, e) => sum + e.total, 0);

        return {
            byCategory,
            totalExpenses
        };
    }

    // Estado de Resultados (P&L)
    async getProfitAndLoss(tenantId: string, startDateStr: string, endDateStr: string) {
        const cacheKey = this.cacheService.generateKey(tenantId, 'expenses', 'profit-loss', startDateStr, endDateStr);

        const cached = await this.cacheService.get<any>(cacheKey);
        if (cached) return cached;

        const startDate = addHours(startOfDay(parseISO(startDateStr)), 5);
        const endDate = addHours(endOfDay(parseISO(endDateStr)), 5);

        // Total de ventas
        const salesResult = await this.prisma.invoice.aggregate({
            where: {
                tenantId,
                status: 'PAID',
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                }
            },
            _sum: {
                total: true
            },
            _count: true
        });

        const totalSales = Number(salesResult._sum.total || 0);
        const salesCount = salesResult._count;

        const [
            cashSalesResult,
            creditSalesResult,
            creditSalesCount,
            creditCollectionsResult,
            creditOutstandingResult,
            overdueCreditBalanceResult
        ] = await Promise.all([
            (this.prisma.invoice as any).aggregate({
                where: {
                    tenantId,
                    status: 'PAID',
                    isCreditSale: false,
                    createdAt: {
                        gte: startDate,
                        lte: endDate,
                    }
                },
                _sum: {
                    total: true
                }
            }),
            (this.prisma.invoice as any).aggregate({
                where: {
                    tenantId,
                    status: 'PAID',
                    isCreditSale: true,
                    createdAt: {
                        gte: startDate,
                        lte: endDate,
                    }
                },
                _sum: {
                    total: true
                }
            }),
            (this.prisma.invoice as any).count({
                where: {
                    tenantId,
                    status: 'PAID',
                    isCreditSale: true,
                    createdAt: {
                        gte: startDate,
                        lte: endDate,
                    }
                },
            }),
            (this.prisma as any).creditPayment.aggregate({
                where: {
                    tenantId,
                    paidAt: {
                        gte: startDate,
                        lte: endDate,
                    },
                    creditSale: {
                        status: {
                            not: 'CANCELLED',
                        },
                    },
                },
                _sum: {
                    amount: true,
                },
            }),
            (this.prisma as any).creditSale.aggregate({
                where: {
                    tenantId,
                    status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] },
                    invoice: {
                        createdAt: { lte: endDate },
                        status: { not: 'CANCELLED' },
                    },
                },
                _sum: {
                    balance: true,
                },
            }),
            (this.prisma as any).creditSale.aggregate({
                where: {
                    tenantId,
                    status: 'OVERDUE',
                    invoice: {
                        createdAt: { lte: endDate },
                        status: { not: 'CANCELLED' },
                    },
                },
                _sum: {
                    balance: true,
                },
            }),
        ]);

        const totalCashSales = Number(cashSalesResult?._sum?.total || 0);
        const totalCreditSales = Number(creditSalesResult?._sum?.total || 0);
        const totalCreditCollections = Number(creditCollectionsResult?._sum?.amount || 0);
        const outstandingCreditBalance = Number(creditOutstandingResult?._sum?.balance || 0);
        const overdueCreditBalance = Number(overdueCreditBalanceResult?._sum?.balance || 0);

        // Costo de ventas (basado en productos vendidos - PRIORIZA FIFO)
        const invoiceItems = await this.prisma.invoiceItem.findMany({
            where: {
                invoice: {
                    tenantId,
                    status: 'PAID',
                    createdAt: {
                        gte: startDate,
                        lte: endDate,
                    }
                }
            },
            include: {
                product: {
                    select: { costPrice: true }
                }
            }
        });

        const costOfGoodsSold = invoiceItems.reduce((sum, item) => {
            // @ts-ignore - totalCost existe en la DB pero podría no estar en el tipo si no se ha regenerado Prisma
            const cost = item.totalCost ? Number(item.totalCost) : (Number(item.product.costPrice || 0) * item.quantity);
            return sum + cost;
        }, 0);

        // Utilidad bruta
        const grossProfit = totalSales - costOfGoodsSold;
        const grossMargin = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;

        // Gastos operativos
        const expensesSummary = await this.getSummary(tenantId, startDateStr, endDateStr);

        // Utilidad neta
        const netProfit = grossProfit - expensesSummary.totalExpenses;
        const netMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;

        const result = {
            period: { startDate: startDateStr, endDate: endDateStr },
            revenue: {
                totalSales,
                salesCount,
                cashSales: totalCashSales,
                creditSales: totalCreditSales,
                creditSalesCount,
                creditCollections: totalCreditCollections,
                outstandingCreditBalance,
                overdueCreditBalance,
            },
            costOfGoodsSold,
            grossProfit,
            grossMargin: Math.round(grossMargin * 100) / 100,
            operatingExpenses: expensesSummary,
            netProfit,
            netMargin: Math.round(netMargin * 100) / 100
        };

        await this.cacheService.set(cacheKey, result, 120);
        return result;
    }
}

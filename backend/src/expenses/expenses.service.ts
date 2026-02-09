import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { startOfDay, endOfDay, parseISO, addHours } from 'date-fns';

@Injectable()
export class ExpensesService {
    constructor(
        private prisma: PrismaService,
        private cacheService: CacheService
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

        return expense;
    }

    async findAll(tenantId: string, filters?: {
        startDate?: string;
        endDate?: string;
        category?: string;
    }) {
        const where: any = { tenantId };

        if (filters?.startDate || filters?.endDate) {
            where.date = {};
            if (filters.startDate) where.date.gte = startOfDay(parseISO(filters.startDate));
            if (filters.endDate) where.date.lte = endOfDay(parseISO(filters.endDate));
        }

        if (filters?.category) {
            where.category = filters.category;
        }

        return this.prisma.expense.findMany({
            where,
            orderBy: { date: 'desc' },
            include: {
                supplier: true,
                createdBy: {
                    select: { id: true, name: true }
                }
            }
        });
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

        return result;
    }

    async remove(tenantId: string, id: string) {
        const result = await this.prisma.expense.deleteMany({
            where: { id, tenantId },
        });

        await this.cacheService.invalidatePattern(this.cacheService.generateKey(tenantId, 'analytics', '*'));
        await this.cacheService.invalidatePattern(this.cacheService.generateKey(tenantId, 'expenses', '*'));

        return result;
    }

    // Resumen para el P&L
    async getSummary(tenantId: string, startDateStr: string, endDateStr: string) {
        const startDate = addHours(startOfDay(parseISO(startDateStr)), 5);
        const endDate = addHours(endOfDay(parseISO(endDateStr)), 5);

        const expenses = await this.prisma.expense.groupBy({
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

        const totalExpenses = expenses.reduce((sum, e) => sum + Number(e._sum.amount || 0), 0);

        return {
            byCategory: expenses.map(e => ({
                category: e.category,
                total: Number(e._sum.amount || 0)
            })),
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
                salesCount
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

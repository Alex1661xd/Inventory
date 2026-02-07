import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesService {
    constructor(private prisma: PrismaService) { }

    async create(tenantId: string, userId: string, dto: CreateExpenseDto) {
        return this.prisma.expense.create({
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
    }

    async findAll(tenantId: string, filters?: {
        startDate?: string;
        endDate?: string;
        category?: string;
    }) {
        const where: any = { tenantId };

        if (filters?.startDate || filters?.endDate) {
            where.date = {};
            if (filters.startDate) where.date.gte = new Date(filters.startDate);
            if (filters.endDate) where.date.lte = new Date(filters.endDate);
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
        return this.prisma.expense.updateMany({
            where: { id, tenantId },
            data: {
                ...dto,
                date: dto.date ? new Date(dto.date) : undefined,
            },
        });
    }

    async remove(tenantId: string, id: string) {
        return this.prisma.expense.deleteMany({
            where: { id, tenantId },
        });
    }

    // Resumen para el P&L
    async getSummary(tenantId: string, startDate: string, endDate: string) {
        const expenses = await this.prisma.expense.groupBy({
            by: ['category'],
            where: {
                tenantId,
                date: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
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
    async getProfitAndLoss(tenantId: string, startDate: string, endDate: string) {
        // Total de ventas
        const salesResult = await this.prisma.invoice.aggregate({
            where: {
                tenantId,
                status: 'PAID',
                createdAt: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                }
            },
            _sum: {
                total: true
            },
            _count: true
        });

        const totalSales = Number(salesResult._sum.total || 0);
        const salesCount = salesResult._count;

        // Costo de ventas (basado en productos vendidos)
        const invoiceItems = await this.prisma.invoiceItem.findMany({
            where: {
                invoice: {
                    tenantId,
                    status: 'PAID',
                    createdAt: {
                        gte: new Date(startDate),
                        lte: new Date(endDate),
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
            return sum + (Number(item.product.costPrice || 0) * item.quantity);
        }, 0);

        // Utilidad bruta
        const grossProfit = totalSales - costOfGoodsSold;
        const grossMargin = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;

        // Gastos operativos
        const expensesSummary = await this.getSummary(tenantId, startDate, endDate);

        // Utilidad neta
        const netProfit = grossProfit - expensesSummary.totalExpenses;
        const netMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;

        return {
            period: { startDate, endDate },
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
    }
}

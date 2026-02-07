import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { startOfDay, subDays, differenceInDays, addDays, parseISO } from 'date-fns';

@Injectable()
export class AnalyticsService {
    constructor(
        private prisma: PrismaService,
        private cacheService: CacheService
    ) { }

    async getDashboardStats(tenantId: string, from?: string, to?: string) {
        const cacheKey = this.cacheService.generateKey(tenantId, 'analytics', 'dashboard', from || '30d', to || 'now');
        const cachedData = await this.cacheService.get<any>(cacheKey);
        if (cachedData) return cachedData;

        const startDate = from ? startOfDay(parseISO(from)) : startOfDay(subDays(new Date(), 30));
        const endDate = to ? startOfDay(parseISO(to)) : startOfDay(new Date());

        // 1. Obtener todas las facturas pagas del periodo
        const invoices = await this.prisma.invoice.findMany({
            where: {
                tenantId,
                status: 'PAID',
                createdAt: { gte: startDate, lte: addDays(endDate, 1) },
            },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                name: true,
                                costPrice: true,
                                category: {
                                    select: {
                                        name: true,
                                    }
                                }
                            },
                        },
                    },
                },
                seller: {
                    select: {
                        name: true,
                        warehouse: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    },
                },
                customer: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        // 2. Obtener gastos del periodo
        const expenses = await this.prisma.expense.findMany({
            where: {
                tenantId,
                date: { gte: startDate, lte: addDays(endDate, 1) },
            },
        });
        const totalExpenses = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);

        // 3. Obtener todos los productos para identificar "Productos Hueso"
        const allProducts = await this.prisma.product.findMany({
            where: { tenantId },
            select: {
                id: true,
                name: true,
                sku: true,
                costPrice: true,
                inventory: {
                    select: {
                        quantity: true
                    }
                }
            }
        });

        // 4. Procesar datos para gráficas

        // Ventas por día (Revenue over time)
        const salesByDayMap = new Map<string, { date: string, total: number, profit: number }>();

        // Inicializar el mapa de ventas con 0 para cada día del rango
        const days = differenceInDays(endDate, startDate);
        for (let i = 0; i <= days; i++) {
            const d = addDays(startDate, i);
            const dateStr = d.toISOString().split('T')[0];
            salesByDayMap.set(dateStr, { date: dateStr, total: 0, profit: 0 });
        }

        // Top Productos
        const productStatsMap = new Map<string, { name: string, quantity: number, revenue: number, profit: number }>();

        // Ventas por Vendedor
        const sellerStatsMap = new Map<string, { name: string, total: number, salesCount: number }>();

        // Ventas por Almacén
        const warehouseStatsMap = new Map<string, { name: string, total: number, salesCount: number }>();

        // Ventas por Categoría
        const categoryStatsMap = new Map<string, { name: string, total: number }>();

        // Ventas por Método de Pago
        const paymentMethodStatsMap = new Map<string, { name: string, total: number }>();

        const soldProductIds = new Set<string>();

        invoices.forEach(inv => {
            const dateKey = inv.createdAt.toISOString().split('T')[0];
            const dayStat = salesByDayMap.get(dateKey);

            let invoiceRevenue = Number(inv.total);
            let invoiceCost = 0;

            inv.items.forEach(item => {
                soldProductIds.add(item.productId);
                const itemRevenue = item.quantity * Number(item.unitPrice);
                const itemCost = item.quantity * Number(item.product.costPrice);
                invoiceCost += itemCost;

                const pStat = productStatsMap.get(item.productId) || { name: item.product.name, quantity: 0, revenue: 0, profit: 0 };
                pStat.quantity += item.quantity;
                pStat.revenue += itemRevenue;
                pStat.profit += (itemRevenue - itemCost);
                productStatsMap.set(item.productId, pStat);

                // Estadísticas por Categoría
                const catName = item.product.category?.name || 'Sin Categoría';
                const cStat = categoryStatsMap.get(catName) || { name: catName, total: 0 };
                cStat.total += itemRevenue;
                categoryStatsMap.set(catName, cStat);
            });

            if (dayStat) {
                dayStat.total += invoiceRevenue;
                dayStat.profit += (invoiceRevenue - invoiceCost);
            }

            const sStat = sellerStatsMap.get(inv.sellerId) || { name: inv.seller.name, total: 0, salesCount: 0 };
            sStat.total += invoiceRevenue;
            sStat.salesCount += 1;
            sellerStatsMap.set(inv.sellerId, sStat);

            const warehouse = inv.seller.warehouse;
            const wId = warehouse?.id || 'unassigned';
            const wName = warehouse?.name || 'Sin Almacén';

            const wStat = warehouseStatsMap.get(wId) || { name: wName, total: 0, salesCount: 0 };
            wStat.total += invoiceRevenue;
            wStat.salesCount += 1;
            warehouseStatsMap.set(wId, wStat);

            // Estadísticas por Método de Pago
            const pmName = inv.paymentMethod;
            const pmStat = paymentMethodStatsMap.get(pmName) || { name: pmName, total: 0 };
            pmStat.total += invoiceRevenue;
            paymentMethodStatsMap.set(pmName, pmStat);
        });

        // Convertir Maps a Arrays y ordenar
        const salesOverTime = Array.from(salesByDayMap.values()).sort((a, b) => a.date.localeCompare(b.date));

        const topProducts = Array.from(productStatsMap.values())
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        const topSellers = Array.from(sellerStatsMap.values())
            .sort((a, b) => b.total - a.total);

        const warehouseStats = Array.from(warehouseStatsMap.values())
            .sort((a, b) => b.total - a.total);

        const categoryStats = Array.from(categoryStatsMap.values())
            .sort((a, b) => b.total - a.total);

        const paymentMethodStats = Array.from(paymentMethodStatsMap.values())
            .sort((a, b) => b.total - a.total);

        // Identificar Productos Hueso (con stock > 0 pero 0 ventas en 30 días)
        const deadStock = allProducts
            .map(p => ({
                id: p.id,
                name: p.name,
                sku: p.sku,
                stock: p.inventory.reduce((acc, curr) => acc + curr.quantity, 0),
                value: p.inventory.reduce((acc, curr) => acc + curr.quantity, 0) * Number(p.costPrice)
            }))
            .filter(p => !soldProductIds.has(p.id) && p.stock > 0)
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        // Ventas totales y utilidad neta del periodo
        const totalRevenue = invoices.reduce((acc, curr) => acc + Number(curr.total), 0);
        const totalProfit = salesOverTime.reduce((acc, curr) => acc + curr.profit, 0);

        const result = {
            period: {
                start: startDate,
                end: endDate,
            },
            summary: {
                totalRevenue,
                totalProfit, // Bruta
                totalExpenses,
                netProfit: totalProfit - totalExpenses,
                salesCount: invoices.length,
                averageTicket: invoices.length > 0 ? totalRevenue / invoices.length : 0,
            },
            salesOverTime,
            topProducts,
            topSellers,
            warehouseStats,
            categoryStats,
            paymentMethodStats,
            deadStock,
        };

        // Guardar en caché por 2 minutos (120s) - Corto porque cambia frecuente pero ayuda en ráfagas
        await this.cacheService.set(cacheKey, result, 120);

        return result;
    }
}

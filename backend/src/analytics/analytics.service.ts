import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { startOfDay, endOfDay, subDays, differenceInDays, addDays, parseISO, subHours, addHours } from 'date-fns';

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

        // Ajuste de fechas para incluir el día completo (00:00:00 a 23:59:59)
        // Se aplica un offset de -5 horas (aprox) para alinear UTC con la hora local de LATAM
        const startDate = from ? addHours(startOfDay(parseISO(from)), 5) : startOfDay(subDays(new Date(), 30));
        const endDate = to ? addHours(endOfDay(parseISO(to)), 5) : endOfDay(new Date());

        // 1. Obtener todas las facturas pagas del periodo
        const invoices = await this.prisma.invoice.findMany({
            where: {
                tenantId,
                status: 'PAID',
                createdAt: { gte: startDate, lte: endDate },
            },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                category: true
                            }
                        }
                    }
                },
                seller: {
                    include: {
                        warehouse: true
                    }
                },
                customer: true,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        // 2. Obtener gastos del periodo (Gastos generales + Gastos registrados por caja)
        const [expenses, cashExpenses] = await Promise.all([
            this.prisma.expense.findMany({
                where: {
                    tenantId,
                    date: { gte: startDate, lte: addDays(endDate, 1) },
                },
            }),
            this.prisma.cashTransaction.findMany({
                where: {
                    type: 'EXPENSE',
                    createdAt: { gte: startDate, lte: endDate },
                    shift: { tenantId }
                }
            })
        ]);

        const totalGeneralExpenses = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
        const totalCashExpenses = cashExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
        const totalExpenses = totalGeneralExpenses + totalCashExpenses;

        // 3. Obtener todos los productos para identificar "Productos Hueso" con valoración FIFO
        const allProducts = await this.prisma.product.findMany({
            where: { tenantId, active: true },
            select: {
                id: true,
                name: true,
                sku: true,
                costPrice: true,
                inventory: {
                    select: {
                        quantity: true
                    }
                },
                // @ts-ignore
                stockBatches: {
                    where: { remainingQuantity: { gt: 0 } },
                    select: {
                        remainingQuantity: true,
                        costPrice: true
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
            const dateStr = subHours(d, 5).toISOString().split('T')[0];
            salesByDayMap.set(dateStr, { date: dateStr, total: 0, profit: 0 });
        }

        // Top Productos
        const productStatsMap = new Map<string, { name: string, quantity: number, revenue: number, profit: number }>();

        // Ventas por Vendedor
        const sellerStatsMap = new Map<string, { name: string, total: number, profit: number, salesCount: number }>();

        // Ventas por Almacén
        const warehouseStatsMap = new Map<string, { name: string, total: number, profit: number, salesCount: number }>();

        // Ventas por Categoría
        const categoryStatsMap = new Map<string, { name: string, total: number, profit: number }>();

        // Ventas por Método de Pago
        const paymentMethodStatsMap = new Map<string, { name: string, total: number }>();

        const soldProductIds = new Set<string>();

        invoices.forEach(inv => {
            // Ajustamos la fecha de la factura al "día local" para la agrupación en la gráfica
            const localDate = subHours(new Date(inv.createdAt), 5);
            const dateKey = localDate.toISOString().split('T')[0];
            const dayStat = salesByDayMap.get(dateKey);

            const totalItemsPrice = inv.items.reduce((acc, item) => acc + (item.quantity * Number(item.unitPrice)), 0);
            const discountFactor = totalItemsPrice > 0 ? (Number(inv.total) / totalItemsPrice) : 1;

            let invoiceRevenue = Number(inv.total);
            let invoiceCost = 0;

            inv.items.forEach(item => {
                soldProductIds.add(item.productId);
                // Aplicamos el factor de descuento real de la factura a cada ítem
                const itemRevenue = (item.quantity * Number(item.unitPrice)) * discountFactor;

                // Si la factura tiene totalCost (FIFO), usarlo. Si no, usar el costPrice actual (retrocompatibilidad)
                // @ts-ignore
                const itemCost = item.totalCost ? Number(item.totalCost) : (item.quantity * Number(item.product.costPrice));

                invoiceCost += itemCost;

                const pStat = productStatsMap.get(item.productId) || { name: item.product.name, quantity: 0, revenue: 0, profit: 0 };
                pStat.quantity += item.quantity;
                pStat.revenue += itemRevenue;
                pStat.profit += (itemRevenue - itemCost);
                productStatsMap.set(item.productId, pStat);

                // Estadísticas por Categoría
                const catName = item.product.category?.name || 'Sin Categoría';
                const cStat = categoryStatsMap.get(catName) || { name: catName, total: 0, profit: 0 };
                cStat.total += itemRevenue;
                cStat.profit += (itemRevenue - itemCost);
                categoryStatsMap.set(catName, cStat);
            });

            if (dayStat) {
                dayStat.total += invoiceRevenue;
                dayStat.profit += (invoiceRevenue - invoiceCost);
            }

            const sStat = sellerStatsMap.get(inv.sellerId) || { name: inv.seller.name, total: 0, profit: 0, salesCount: 0 };
            sStat.total += invoiceRevenue;
            sStat.profit += (invoiceRevenue - invoiceCost);
            sStat.salesCount += 1;
            sellerStatsMap.set(inv.sellerId, sStat);

            const warehouse = inv.seller.warehouse;
            const wId = warehouse?.id || 'unassigned';
            const wName = warehouse?.name || 'Sin Almacén';

            const wStat = warehouseStatsMap.get(wId) || { name: wName, total: 0, profit: 0, salesCount: 0 };
            wStat.total += invoiceRevenue;
            wStat.profit += (invoiceRevenue - invoiceCost);
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
            .map(p => {
                const totalStock = p.inventory.reduce((acc, curr) => acc + curr.quantity, 0);
                // Valoración FIFO: suma de (cantidad * costo) de cada lote
                // @ts-ignore
                const fifoValue = (p.stockBatches || []).reduce((acc, b) => acc + (b.remainingQuantity * Number(b.costPrice)), 0);

                // Fallback a costPrice actual si no hay lotes (para productos antiguos de antes de FIFO)
                const finalValue = fifoValue > 0 ? fifoValue : (totalStock * Number(p.costPrice));

                return {
                    id: p.id,
                    name: p.name,
                    sku: p.sku,
                    stock: totalStock,
                    value: finalValue
                };
            })
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

    async getProductStats(tenantId: string, productId: string, from?: string, to?: string) {
        const where: any = {
            productId,
            invoice: {
                tenantId,
                status: 'PAID',
            }
        };

        if (from || to) {
            where.invoice.createdAt = {};
            if (from) where.invoice.createdAt.gte = new Date(from);
            if (to) where.invoice.createdAt.lte = new Date(to);
        }

        // 1. Obtener items de facturas pagadas para este producto
        const invoiceItems = await this.prisma.invoiceItem.findMany({
            where,
            include: {
                invoice: true,
                product: {
                    select: { costPrice: true }
                }
            }
        });

        let totalSold = 0;
        let totalRevenue = 0;
        let totalCost = 0;

        invoiceItems.forEach(item => {
            totalSold += item.quantity;

            // Revenue: cantidad * precio unitario
            // Nota: No estamos aplicando el descuento global de la factura aquí para simplificar,
            // pero idealmente deberíamos prorratearlo.
            const itemRevenue = item.quantity * Number(item.unitPrice);
            totalRevenue += itemRevenue;

            // Cost: Usar snapshot (totalCost) si existe (FIFO), o fallback al costo actual del producto
            // @ts-ignore
            let itemCost = item.totalCost ? Number(item.totalCost) : 0;

            if (itemCost === 0 && item.product) {
                itemCost = item.quantity * Number(item.product.costPrice);
            }

            totalCost += itemCost;
        });

        const totalProfit = totalRevenue - totalCost;
        const margin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

        return {
            totalSold,
            totalRevenue,
            totalProfit,
            margin
        };
    }
}

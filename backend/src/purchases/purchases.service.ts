import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { CacheService } from '../cache/cache.service';
import { StockMovementType, ExpenseCategory } from '@prisma/client';

@Injectable()
export class PurchasesService {
    constructor(
        private prisma: PrismaService,
        private cacheService: CacheService
    ) { }

    async create(tenantId: string, userId: string, dto: CreatePurchaseDto) {
        // Calcular total de la compra
        const total = dto.items.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);

        const purchaseResult = await this.prisma.$transaction(async (tx) => {
            // 1. Crear la Compra
            const purchase = await tx.purchase.create({
                data: {
                    tenantId,
                    supplierId: dto.supplierId,
                    buyerId: userId,
                    warehouseId: dto.warehouseId,
                    total,
                    date: dto.date ? new Date(dto.date) : new Date(),
                    items: {
                        create: dto.items.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            costPrice: item.costPrice,
                        }))
                    }
                },
                include: {
                    items: true,
                    supplier: true,
                    buyer: { select: { name: true } }
                }
            });

            // 2. Procesar cada producto
            for (const item of purchase.items) {
                // A. Actualizar precio de costo referencial del producto (Último costo)
                await tx.product.update({
                    // @ts-ignore
                    where: { id: item.productId, tenantId },
                    data: { costPrice: item.costPrice }
                });

                // B. Actualizar Stock Global + Crear Lote (StockBatch) para FIFO
                if (purchase.warehouseId) {
                    // Actualizar el saldo global (para consultas rápidas)
                    const stock = await tx.stock.upsert({
                        where: {
                            productId_warehouseId: {
                                productId: item.productId,
                                warehouseId: purchase.warehouseId
                            }
                        },
                        update: {
                            quantity: { increment: item.quantity }
                        },
                        create: {
                            productId: item.productId,
                            warehouseId: purchase.warehouseId,
                            quantity: item.quantity
                        }
                    });

                    // CREAR LOTE PARA FIFO
                    await tx.stockBatch.create({
                        data: {
                            tenantId,
                            productId: item.productId,
                            warehouseId: purchase.warehouseId,
                            purchaseItemId: item.id,
                            initialQuantity: item.quantity,
                            remainingQuantity: item.quantity,
                            costPrice: item.costPrice,
                            // entryDate: purchase.date,
                            // FIX: Si la fecha es 'hoy', usamos new Date() para preservar la hora exacta y que salga de primero.
                            // Si es otra fecha, usamos esa fecha a las 00:00 pero le sumamos la hora actual para desempatar también.
                            entryDate: (() => {
                                const now = new Date();
                                const pDate = new Date(purchase.date);
                                // Verificar si es el mismo día (ignorando hora)
                                if (pDate.toISOString().split('T')[0] === now.toISOString().split('T')[0]) {
                                    return now;
                                }
                                // Si es fecha pasada/futura, le ponemos la hora actual para que quede al final del día
                                pDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
                                return pDate;
                            })()
                        }
                    });

                    // C. Registrar Movimiento (Kardex)
                    await tx.stockMovement.create({
                        data: {
                            productId: item.productId,
                            warehouseId: purchase.warehouseId,
                            quantity: item.quantity,
                            balanceAfter: stock.quantity,
                            type: StockMovementType.PURCHASE,
                            reference: `COMPRA #${purchase.purchaseNumber}`,
                            userId,
                            notes: `Compra a ${purchase.supplier.name} (Lote FIFO creado)`
                        }
                    });
                }
            }

            // 3. Crear Gasto Automático
            await tx.expense.create({
                data: {
                    tenantId,
                    amount: total,
                    description: `Reabastecimiento de inventario - Compra #${purchase.purchaseNumber}`,
                    category: ExpenseCategory.INVENTORY,
                    supplierId: dto.supplierId,
                    createdById: userId,
                    date: purchase.date
                }
            });

            return purchase;
        });

        // ==================== CACHE INVALIDATION (OUTSIDE TRANSACTION) ====================
        // Lo hacemos fuera para asegurar que el registro ya existe en DB y para no bloquear la Tx
        try {
            console.log(`🧹 [PurchasesService] Invalidando caché para tenant: ${tenantId}`);

            // Invalidar analytics, gastos e inventario
            await Promise.all([
                this.cacheService.invalidatePattern(this.cacheService.generateKey(tenantId, 'analytics', '*')),
                this.cacheService.invalidatePattern(this.cacheService.generateKey(tenantId, 'expenses', '*')),
                this.cacheService.invalidatePattern(this.cacheService.generateKey(tenantId, 'inventory', '*'))
            ]);

            // Invalidar todo lo relacionado con productos (lista y detalles)
            await this.cacheService.invalidatePattern(this.cacheService.generateKey(tenantId, 'products', '*'));

            // Fallback explícito para la lista de productos (Muy importante para la UI)
            const listKey = this.cacheService.generateKey(tenantId, 'products', 'list');
            await this.cacheService.invalidate(listKey);

            console.log('✅ [PurchasesService] Caché invalidado exitosamente');
        } catch (cacheError) {
            console.error('⚠️ [PurchasesService] Error al invalidar caché:', cacheError.message);
        }

        return purchaseResult;
    }

    async findAll(tenantId: string, from?: string, to?: string) {
        const where: any = { tenantId };

        if (from || to) {
            where.date = {};
            if (from) where.date.gte = new Date(from);
            if (to) where.date.lte = new Date(to);
        }

        return this.prisma.purchase.findMany({
            where,
            include: {
                supplier: { select: { name: true } },
                buyer: { select: { name: true } },
                _count: { select: { items: true } }
            },
            orderBy: { date: 'desc' }
        });
    }

    async findOne(tenantId: string, id: string) {
        return this.prisma.purchase.findFirst({
            where: { id, tenantId },
            include: {
                supplier: true,
                buyer: { select: { name: true } },
                items: {
                    include: {
                        product: {
                            select: { name: true, sku: true }
                        }
                    }
                }
            }
        });
    }
}

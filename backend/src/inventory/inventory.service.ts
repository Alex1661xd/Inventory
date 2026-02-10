import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransferStockDto } from './dto/transfer-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { QueryStockDto } from './dto/query-stock.dto';
import { CacheService } from '../cache/cache.service';
import { StockMovementType } from '@prisma/client';

@Injectable()
export class InventoryService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cacheService: CacheService
    ) { }

    async transferStock(tenantId: string, dto: TransferStockDto, userId?: string) {
        if (dto.fromWarehouseId === dto.toWarehouseId) {
            throw new BadRequestException('Source and destination warehouses must be different');
        }

        const [product, fromWarehouse, toWarehouse] = await Promise.all([
            this.prisma.product.findFirst({ where: { id: dto.productId, tenantId, active: true }, select: { id: true, name: true } }),
            this.prisma.warehouse.findFirst({ where: { id: dto.fromWarehouseId, tenantId }, select: { id: true, name: true } }),
            this.prisma.warehouse.findFirst({ where: { id: dto.toWarehouseId, tenantId }, select: { id: true, name: true } }),
        ]);

        if (!product) throw new NotFoundException('Product not found');
        if (!fromWarehouse) throw new NotFoundException('Source warehouse not found');
        if (!toWarehouse) throw new NotFoundException('Destination warehouse not found');

        return this.prisma.$transaction(async (tx) => {
            // Check source stock
            const sourceStock = await tx.stock.findUnique({
                where: {
                    productId_warehouseId: {
                        productId: dto.productId,
                        warehouseId: dto.fromWarehouseId,
                    },
                },
            });

            if (!sourceStock || sourceStock.quantity < dto.quantity) {
                throw new BadRequestException(`Insufficient stock in ${fromWarehouse.name}. Available: ${sourceStock?.quantity ?? 0}`);
            }

            // Decrement source
            const sourceUpdated = await tx.stock.update({
                where: {
                    productId_warehouseId: {
                        productId: dto.productId,
                        warehouseId: dto.fromWarehouseId,
                    },
                },
                data: {
                    quantity: sourceStock.quantity - dto.quantity,
                },
            });

            // Record Outgoing Movement
            await tx.stockMovement.create({
                data: {
                    type: StockMovementType.TRANSFER_OUT,
                    quantity: -dto.quantity,
                    balanceAfter: sourceUpdated.quantity,
                    productId: dto.productId,
                    warehouseId: dto.fromWarehouseId,
                    notes: `Transferencia a ${toWarehouse.name}`,
                    userId: userId || null,
                }
            });

            // Increment destination (or create if not exists)
            const destStock = await tx.stock.findUnique({
                where: {
                    productId_warehouseId: {
                        productId: dto.productId,
                        warehouseId: dto.toWarehouseId,
                    },
                },
            });

            let destUpdated;
            if (destStock) {
                destUpdated = await tx.stock.update({
                    where: {
                        productId_warehouseId: {
                            productId: dto.productId,
                            warehouseId: dto.toWarehouseId,
                        },
                    },
                    data: {
                        quantity: destStock.quantity + dto.quantity,
                    },
                });
            } else {
                destUpdated = await tx.stock.create({
                    data: {
                        productId: dto.productId,
                        warehouseId: dto.toWarehouseId,
                        quantity: dto.quantity,
                    },
                });
            }

            // --- LÓGICA FIFO PARA TRANSFERENCIAS ---
            let pendingToMove = dto.quantity;
            const batches = await tx.stockBatch.findMany({
                where: {
                    productId: dto.productId,
                    warehouseId: dto.fromWarehouseId,
                    remainingQuantity: { gt: 0 }
                },
                orderBy: { entryDate: 'asc' }
            });

            for (const batch of batches) {
                if (pendingToMove <= 0) break;
                const qtyFromBatch = Math.min(batch.remainingQuantity, pendingToMove);

                // 1. Restar del lote origen
                await tx.stockBatch.update({
                    where: { id: batch.id },
                    data: { remainingQuantity: { decrement: qtyFromBatch } }
                });

                // 2. Crear lote en destino (manteniendo costo y fecha original)
                // Usamos un nuevo lote para evitar mezclar fechas si ya hay lotes en destino
                await tx.stockBatch.create({
                    data: {
                        tenantId,
                        productId: dto.productId,
                        warehouseId: dto.toWarehouseId,
                        initialQuantity: qtyFromBatch,
                        remainingQuantity: qtyFromBatch,
                        costPrice: batch.costPrice,
                        entryDate: batch.entryDate,
                        // Si el lote original tenía una compra asociada, la mantenemos
                        purchaseItemId: batch.purchaseItemId
                    }
                });

                pendingToMove -= qtyFromBatch;
            }

            // Si después de recorrer lotes aún falta stock, hay un error de integridad
            if (pendingToMove > 0) {
                throw new BadRequestException(`Integridad FIFO: No se encontraron suficientes lotes para transferir en ${fromWarehouse.name}`);
            }

            // Record Incoming Movement
            await tx.stockMovement.create({
                data: {
                    type: StockMovementType.TRANSFER_IN,
                    quantity: dto.quantity,
                    balanceAfter: destUpdated.quantity,
                    productId: dto.productId,
                    warehouseId: dto.toWarehouseId,
                    notes: `Transferencia desde ${fromWarehouse.name} (Lotes FIFO movidos)`,
                    userId: userId || null,
                }
            });

            await this.cacheService.invalidatePattern(this.cacheService.generateKey(tenantId, 'products', '*'));
            await this.cacheService.invalidatePattern(this.cacheService.generateKey(tenantId, 'inventory', '*'));

            return { success: true, message: `Transferred ${dto.quantity} units of ${product.name}` };
        });
    }

    async updateStock(tenantId: string, dto: UpdateStockDto, userId?: string) {
        if (!Number.isInteger(dto.quantityDelta) || dto.quantityDelta === 0) {
            throw new BadRequestException('quantityDelta must be a non-zero integer');
        }

        const [product, warehouse] = await Promise.all([
            this.prisma.product.findFirst({ where: { id: dto.productId, tenantId, active: true }, select: { id: true } }),
            this.prisma.warehouse.findFirst({ where: { id: dto.warehouseId, tenantId }, select: { id: true } }),
        ]);

        if (!product) throw new NotFoundException('Product not found');
        if (!warehouse) throw new NotFoundException('Warehouse not found');

        const result = await this.prisma.$transaction(async (tx) => {
            const existing = await tx.stock.findUnique({
                where: {
                    productId_warehouseId: {
                        productId: dto.productId,
                        warehouseId: dto.warehouseId,
                    },
                },
            });

            let newStock;
            if (!existing) {
                if (dto.quantityDelta < 0) {
                    throw new BadRequestException('Cannot decrease stock below zero');
                }

                newStock = await tx.stock.create({
                    data: {
                        productId: dto.productId,
                        warehouseId: dto.warehouseId,
                        quantity: dto.quantityDelta,
                    },
                });
            } else {
                const newQuantity = existing.quantity + dto.quantityDelta;
                if (newQuantity < 0) {
                    throw new BadRequestException('Cannot decrease stock below zero');
                }

                newStock = await tx.stock.update({
                    where: {
                        productId_warehouseId: {
                            productId: dto.productId,
                            warehouseId: dto.warehouseId,
                        },
                    },
                    data: {
                        quantity: newQuantity,
                    },
                });
            }

            // --- LÓGICA FIFO PARA AJUSTES MANUALES ---
            if (dto.quantityDelta > 0) {
                // Si es un ajuste positivo, creamos un nuevo lote con el costo actual del producto
                const productData = await tx.product.findUnique({
                    where: { id: dto.productId },
                    select: { costPrice: true }
                });

                await tx.stockBatch.create({
                    data: {
                        tenantId,
                        productId: dto.productId,
                        warehouseId: dto.warehouseId,
                        initialQuantity: dto.quantityDelta,
                        remainingQuantity: dto.quantityDelta,
                        costPrice: productData?.costPrice ?? 0,
                        entryDate: new Date()
                    }
                });
            } else if (dto.quantityDelta < 0) {
                // Si es un ajuste negativo, consumimos lotes existentes (FIFO)
                let pendingToSubtract = Math.abs(dto.quantityDelta);

                const batches = await tx.stockBatch.findMany({
                    where: {
                        productId: dto.productId,
                        warehouseId: dto.warehouseId,
                        remainingQuantity: { gt: 0 }
                    },
                    orderBy: { entryDate: 'asc' }
                });

                for (const batch of batches) {
                    if (pendingToSubtract <= 0) break;
                    const qtyToTake = Math.min(batch.remainingQuantity, pendingToSubtract);

                    await tx.stockBatch.update({
                        where: { id: batch.id },
                        data: { remainingQuantity: { decrement: qtyToTake } }
                    });

                    pendingToSubtract -= qtyToTake;
                }
            }

            // Determine movement type and default notes
            const movementType = dto.type || StockMovementType.ADJUSTMENT;
            const defaultNotes = movementType === StockMovementType.DAMAGE ? 'Registro de daño/merma' :
                movementType === StockMovementType.RETURN ? 'Devolución de mercancía' :
                    'Ajuste manual de inventario';

            // Record Movement
            await tx.stockMovement.create({
                data: {
                    type: movementType,
                    quantity: dto.quantityDelta,
                    balanceAfter: newStock.quantity,
                    productId: dto.productId,
                    warehouseId: dto.warehouseId,
                    notes: defaultNotes,
                    userId: userId || null,
                }
            });

            return newStock;
        });

        // CACHE INVALIDATION (OUTSIDE TRANSACTION TO ENSURE DB COMMIT FIRST)
        try {
            console.log(`🧹 [InventoryService] Invalidando caché tras ajuste manual...`);
            await this.cacheService.invalidatePattern(this.cacheService.generateKey(tenantId, 'products', '*'));
            await this.cacheService.invalidatePattern(this.cacheService.generateKey(tenantId, 'inventory', '*'));

            // Invalidador explícito de la lista de productos
            await this.cacheService.invalidate(this.cacheService.generateKey(tenantId, 'products', 'list'));
        } catch (e) {
            console.error('Error invalidating cache in updateStock:', e);
        }

        return result;
    }

    async findStock(tenantId: string, query: QueryStockDto) {
        const where: any = {
            product: {
                tenantId,
                // @ts-ignore
                active: true
            }
        };

        if (query.productId) where.productId = query.productId;
        if (query.warehouseId) where.warehouseId = query.warehouseId;

        const stocks = await this.prisma.stock.findMany({
            where,
            include: {
                product: { select: { id: true, name: true, barcode: true, sku: true, costPrice: true, salePrice: true, categoryId: true } },
                warehouse: { select: { id: true, name: true } },
            },
            orderBy: { product: { name: 'asc' } },
        });

        return stocks.map(({ product, warehouse, ...rest }) => ({
            ...rest,
            product,
            warehouse,
        }));
    }

    async getKardex(tenantId: string, productId: string, warehouseId?: string) {
        const product = await this.prisma.product.findFirst({ where: { id: productId, tenantId } });
        if (!product) throw new NotFoundException('Product not found');

        return this.prisma.stockMovement.findMany({
            where: {
                productId,
                ...(warehouseId ? { warehouseId } : {})
            },
            include: {
                warehouse: { select: { id: true, name: true } },
                user: { select: { id: true, name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getValuation(tenantId: string) {
        // Obtenemos los lotes activos (con stock) para el cálculo FIFO
        const batches = await this.prisma.stockBatch.findMany({
            where: {
                tenantId,
                remainingQuantity: { gt: 0 },
                product: { active: true }
            },
            include: {
                product: {
                    select: {
                        salePrice: true
                    }
                },
                warehouse: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        let totalCost = 0;
        let totalValue = 0;
        let totalItems = 0;
        const warehouseMap = new Map<string, { name: string, cost: number, value: number, items: number }>();

        batches.forEach(b => {
            const cost = Number(b.remainingQuantity) * Number(b.costPrice);
            const value = Number(b.remainingQuantity) * Number(b.product.salePrice);
            const qty = Number(b.remainingQuantity);

            totalCost += cost;
            totalValue += value;
            totalItems += qty;

            const wh = warehouseMap.get(b.warehouseId) || { name: b.warehouse.name, cost: 0, value: 0, items: 0 };
            wh.cost += cost;
            wh.value += value;
            wh.items += qty;
            warehouseMap.set(b.warehouseId, wh);
        });

        const warehouseBreakdown = Array.from(warehouseMap.entries()).map(([id, data]) => ({
            id,
            ...data
        }));

        return {
            totalCost,
            totalValue,
            totalItems,
            potentialProfit: totalValue - totalCost,
            warehouseBreakdown
        };
    }
}

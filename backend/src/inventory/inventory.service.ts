import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransferStockDto } from './dto/transfer-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { QueryStockDto } from './dto/query-stock.dto';
import { StockMovementType } from '@prisma/client';

@Injectable()
export class InventoryService {
    constructor(private readonly prisma: PrismaService) { }

    async transferStock(tenantId: string, dto: TransferStockDto, userId?: string) {
        if (dto.fromWarehouseId === dto.toWarehouseId) {
            throw new BadRequestException('Source and destination warehouses must be different');
        }

        const [product, fromWarehouse, toWarehouse] = await Promise.all([
            this.prisma.product.findFirst({ where: { id: dto.productId, tenantId }, select: { id: true, name: true } }),
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

            // Record Incoming Movement
            await tx.stockMovement.create({
                data: {
                    type: StockMovementType.TRANSFER_IN,
                    quantity: dto.quantity,
                    balanceAfter: destUpdated.quantity,
                    productId: dto.productId,
                    warehouseId: dto.toWarehouseId,
                    notes: `Transferencia desde ${fromWarehouse.name}`,
                    userId: userId || null,
                }
            });

            return { success: true, message: `Transferred ${dto.quantity} units of ${product.name}` };
        });
    }

    async updateStock(tenantId: string, dto: UpdateStockDto, userId?: string) {
        if (!Number.isInteger(dto.quantityDelta) || dto.quantityDelta === 0) {
            throw new BadRequestException('quantityDelta must be a non-zero integer');
        }

        const [product, warehouse] = await Promise.all([
            this.prisma.product.findFirst({ where: { id: dto.productId, tenantId }, select: { id: true } }),
            this.prisma.warehouse.findFirst({ where: { id: dto.warehouseId, tenantId }, select: { id: true } }),
        ]);

        if (!product) throw new NotFoundException('Product not found');
        if (!warehouse) throw new NotFoundException('Warehouse not found');

        return this.prisma.$transaction(async (tx) => {
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
    }

    async findStock(tenantId: string, query: QueryStockDto) {
        const where: any = { product: { tenantId } };

        if (query.productId) where.productId = query.productId;
        if (query.warehouseId) where.warehouseId = query.warehouseId;

        const stocks = await this.prisma.stock.findMany({
            where,
            include: {
                product: { select: { id: true, name: true, barcode: true, sku: true, costPrice: true, categoryId: true } },
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
}

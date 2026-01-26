import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransferStockDto } from './dto/transfer-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { QueryStockDto } from './dto/query-stock.dto';

@Injectable()
export class InventoryService {
    constructor(private readonly prisma: PrismaService) { }

    async transferStock(tenantId: string, dto: TransferStockDto) {
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
            await tx.stock.update({
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

            // Increment destination (or create if not exists)
            const destStock = await tx.stock.findUnique({
                where: {
                    productId_warehouseId: {
                        productId: dto.productId,
                        warehouseId: dto.toWarehouseId,
                    },
                },
            });

            if (destStock) {
                await tx.stock.update({
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
                await tx.stock.create({
                    data: {
                        productId: dto.productId,
                        warehouseId: dto.toWarehouseId,
                        quantity: dto.quantity,
                    },
                });
            }

            return { success: true, message: `Transferred ${dto.quantity} units of ${product.name}` };
        });
    }

    async updateStock(tenantId: string, dto: UpdateStockDto) {
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

            if (!existing) {
                if (dto.quantityDelta < 0) {
                    throw new BadRequestException('Cannot decrease stock below zero');
                }

                return tx.stock.create({
                    data: {
                        productId: dto.productId,
                        warehouseId: dto.warehouseId,
                        quantity: dto.quantityDelta,
                    },
                });
            }

            const newQuantity = existing.quantity + dto.quantityDelta;
            if (newQuantity < 0) {
                throw new BadRequestException('Cannot decrease stock below zero');
            }

            return tx.stock.update({
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
}

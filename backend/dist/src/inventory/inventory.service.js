"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const cache_service_1 = require("../cache/cache.service");
const client_1 = require("@prisma/client");
let InventoryService = class InventoryService {
    prisma;
    cacheService;
    constructor(prisma, cacheService) {
        this.prisma = prisma;
        this.cacheService = cacheService;
    }
    async transferStock(tenantId, dto, userId) {
        if (dto.fromWarehouseId === dto.toWarehouseId) {
            throw new common_1.BadRequestException('Source and destination warehouses must be different');
        }
        const [product, fromWarehouse, toWarehouse] = await Promise.all([
            this.prisma.product.findFirst({ where: { id: dto.productId, tenantId, active: true }, select: { id: true, name: true } }),
            this.prisma.warehouse.findFirst({ where: { id: dto.fromWarehouseId, tenantId }, select: { id: true, name: true } }),
            this.prisma.warehouse.findFirst({ where: { id: dto.toWarehouseId, tenantId }, select: { id: true, name: true } }),
        ]);
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        if (!fromWarehouse)
            throw new common_1.NotFoundException('Source warehouse not found');
        if (!toWarehouse)
            throw new common_1.NotFoundException('Destination warehouse not found');
        return this.prisma.$transaction(async (tx) => {
            const sourceStock = await tx.stock.findUnique({
                where: {
                    productId_warehouseId: {
                        productId: dto.productId,
                        warehouseId: dto.fromWarehouseId,
                    },
                },
            });
            if (!sourceStock || sourceStock.quantity < dto.quantity) {
                throw new common_1.BadRequestException(`Insufficient stock in ${fromWarehouse.name}. Available: ${sourceStock?.quantity ?? 0}`);
            }
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
            await tx.stockMovement.create({
                data: {
                    type: client_1.StockMovementType.TRANSFER_OUT,
                    quantity: -dto.quantity,
                    balanceAfter: sourceUpdated.quantity,
                    productId: dto.productId,
                    warehouseId: dto.fromWarehouseId,
                    notes: `Transferencia a ${toWarehouse.name}`,
                    userId: userId || null,
                }
            });
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
            }
            else {
                destUpdated = await tx.stock.create({
                    data: {
                        productId: dto.productId,
                        warehouseId: dto.toWarehouseId,
                        quantity: dto.quantity,
                    },
                });
            }
            await tx.stockMovement.create({
                data: {
                    type: client_1.StockMovementType.TRANSFER_IN,
                    quantity: dto.quantity,
                    balanceAfter: destUpdated.quantity,
                    productId: dto.productId,
                    warehouseId: dto.toWarehouseId,
                    notes: `Transferencia desde ${fromWarehouse.name}`,
                    userId: userId || null,
                }
            });
            await this.cacheService.invalidatePattern(this.cacheService.generateKey(tenantId, 'products', '*'));
            await this.cacheService.invalidatePattern(this.cacheService.generateKey(tenantId, 'inventory', '*'));
            return { success: true, message: `Transferred ${dto.quantity} units of ${product.name}` };
        });
    }
    async updateStock(tenantId, dto, userId) {
        if (!Number.isInteger(dto.quantityDelta) || dto.quantityDelta === 0) {
            throw new common_1.BadRequestException('quantityDelta must be a non-zero integer');
        }
        const [product, warehouse] = await Promise.all([
            this.prisma.product.findFirst({ where: { id: dto.productId, tenantId, active: true }, select: { id: true } }),
            this.prisma.warehouse.findFirst({ where: { id: dto.warehouseId, tenantId }, select: { id: true } }),
        ]);
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        if (!warehouse)
            throw new common_1.NotFoundException('Warehouse not found');
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
                    throw new common_1.BadRequestException('Cannot decrease stock below zero');
                }
                newStock = await tx.stock.create({
                    data: {
                        productId: dto.productId,
                        warehouseId: dto.warehouseId,
                        quantity: dto.quantityDelta,
                    },
                });
            }
            else {
                const newQuantity = existing.quantity + dto.quantityDelta;
                if (newQuantity < 0) {
                    throw new common_1.BadRequestException('Cannot decrease stock below zero');
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
            if (dto.quantityDelta > 0) {
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
            }
            else if (dto.quantityDelta < 0) {
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
                    if (pendingToSubtract <= 0)
                        break;
                    const qtyToTake = Math.min(batch.remainingQuantity, pendingToSubtract);
                    await tx.stockBatch.update({
                        where: { id: batch.id },
                        data: { remainingQuantity: { decrement: qtyToTake } }
                    });
                    pendingToSubtract -= qtyToTake;
                }
            }
            const movementType = dto.type || client_1.StockMovementType.ADJUSTMENT;
            const defaultNotes = movementType === client_1.StockMovementType.DAMAGE ? 'Registro de daño/merma' :
                movementType === client_1.StockMovementType.RETURN ? 'Devolución de mercancía' :
                    'Ajuste manual de inventario';
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
        try {
            console.log(`🧹 [InventoryService] Invalidando caché tras ajuste manual...`);
            await this.cacheService.invalidatePattern(this.cacheService.generateKey(tenantId, 'products', '*'));
            await this.cacheService.invalidatePattern(this.cacheService.generateKey(tenantId, 'inventory', '*'));
            await this.cacheService.invalidate(this.cacheService.generateKey(tenantId, 'products', 'list'));
        }
        catch (e) {
            console.error('Error invalidating cache in updateStock:', e);
        }
        return result;
    }
    async findStock(tenantId, query) {
        const where = {
            product: {
                tenantId,
                active: true
            }
        };
        if (query.productId)
            where.productId = query.productId;
        if (query.warehouseId)
            where.warehouseId = query.warehouseId;
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
    async getKardex(tenantId, productId, warehouseId) {
        const product = await this.prisma.product.findFirst({ where: { id: productId, tenantId } });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
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
    async getValuation(tenantId) {
        const stocks = await this.prisma.stock.findMany({
            where: {
                product: {
                    tenantId,
                    active: true
                }
            },
            include: {
                product: {
                    select: {
                        costPrice: true,
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
        const warehouseMap = new Map();
        stocks.forEach(s => {
            const cost = s.quantity * Number(s.product.costPrice);
            const value = s.quantity * Number(s.product.salePrice);
            totalCost += cost;
            totalValue += value;
            totalItems += s.quantity;
            const wh = warehouseMap.get(s.warehouseId) || { name: s.warehouse.name, cost: 0, value: 0, items: 0 };
            wh.cost += cost;
            wh.value += value;
            wh.items += s.quantity;
            warehouseMap.set(s.warehouseId, wh);
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
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cache_service_1.CacheService])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map
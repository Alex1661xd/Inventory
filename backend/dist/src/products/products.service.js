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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto_1 = require("crypto");
let ProductsService = class ProductsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    generateBarcode() {
        return `MUE-${(0, crypto_1.randomBytes)(4).toString('hex').toUpperCase()}`;
    }
    async generateUniqueBarcode(tenantId) {
        for (let i = 0; i < 10; i++) {
            const barcode = this.generateBarcode();
            const exists = await this.prisma.product.findFirst({
                where: { tenantId, barcode },
                select: { id: true },
            });
            if (!exists)
                return barcode;
        }
        throw new common_1.BadRequestException('Could not generate a unique barcode');
    }
    async create(tenantId, dto) {
        const barcode = await this.generateUniqueBarcode(tenantId);
        const initialStock = dto.initialStock ?? 0;
        let initialWarehouseId = dto.initialWarehouseId;
        if (initialStock > 0 && !initialWarehouseId) {
            const firstWarehouse = await this.prisma.warehouse.findFirst({
                where: { tenantId },
                orderBy: { name: 'asc' },
                select: { id: true },
            });
            if (!firstWarehouse) {
                throw new common_1.BadRequestException('No warehouse found for this tenant');
            }
            initialWarehouseId = firstWarehouse.id;
        }
        if (initialStock > 0 && initialWarehouseId) {
            const warehouseExists = await this.prisma.warehouse.findFirst({
                where: { id: initialWarehouseId, tenantId },
                select: { id: true },
            });
            if (!warehouseExists) {
                throw new common_1.BadRequestException('initialWarehouseId is invalid');
            }
        }
        try {
            return await this.prisma.$transaction(async (tx) => {
                const product = await tx.product.create({
                    data: {
                        tenantId,
                        name: dto.name,
                        description: dto.description,
                        barcode,
                        sku: dto.sku,
                        imageUrl: dto.imageUrl,
                        costPrice: dto.costPrice ?? 0,
                        salePrice: dto.salePrice ?? 0,
                        isPublic: dto.isPublic ?? true,
                        categoryId: dto.categoryId,
                    },
                });
                if (initialStock > 0 && initialWarehouseId) {
                    await tx.stock.create({
                        data: {
                            productId: product.id,
                            warehouseId: initialWarehouseId,
                            quantity: initialStock,
                        },
                    });
                }
                return product;
            });
        }
        catch (error) {
            throw new common_1.BadRequestException(error?.message ?? 'Error creating product');
        }
    }
    async findAllWithTotalStock(tenantId) {
        const stockData = await this.prisma.stock.groupBy({
            by: ['productId'],
            _sum: {
                quantity: true,
            },
        });
        const stockMap = new Map();
        stockData.forEach(item => {
            stockMap.set(item.productId, item._sum.quantity ?? 0);
        });
        const products = await this.prisma.product.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
        });
        return products.map(product => ({
            ...product,
            totalStock: stockMap.get(product.id) ?? 0,
        }));
    }
    async findOne(tenantId, id) {
        const product = await this.prisma.product.findFirst({
            where: { id, tenantId },
            include: {
                inventory: { select: { quantity: true } },
            },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        const totalStock = product.inventory.reduce((acc, s) => acc + s.quantity, 0);
        const { inventory, ...rest } = product;
        return { ...rest, totalStock };
    }
    async findByBarcode(tenantId, barcode) {
        const normalized = (barcode ?? '').trim();
        if (!normalized)
            throw new common_1.BadRequestException('barcode is required');
        const product = await this.prisma.product.findFirst({
            where: { tenantId, barcode: normalized },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        const stockAggregate = await this.prisma.stock.aggregate({
            where: { productId: product.id },
            _sum: { quantity: true },
        });
        return {
            ...product,
            totalStock: stockAggregate._sum.quantity ?? 0,
        };
    }
    async update(tenantId, id, dto) {
        const exists = await this.prisma.product.findFirst({
            where: { id, tenantId },
            select: { id: true },
        });
        if (!exists)
            throw new common_1.NotFoundException('Product not found');
        try {
            return await this.prisma.product.update({
                where: { id },
                data: dto,
            });
        }
        catch (error) {
            throw new common_1.BadRequestException(error?.message ?? 'Error updating product');
        }
    }
    async remove(tenantId, id) {
        const exists = await this.prisma.product.findFirst({
            where: { id, tenantId },
            select: { id: true },
        });
        if (!exists)
            throw new common_1.NotFoundException('Product not found');
        try {
            return await this.prisma.product.delete({
                where: { id },
            });
        }
        catch (error) {
            throw new common_1.BadRequestException(error?.message ?? 'Error deleting product');
        }
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map
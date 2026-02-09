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
const cache_service_1 = require("../cache/cache.service");
const client_1 = require("@prisma/client");
const supabase_service_1 = require("../supabase/supabase.service");
let ProductsService = class ProductsService {
    prisma;
    cacheService;
    supabaseService;
    constructor(prisma, cacheService, supabaseService) {
        this.prisma = prisma;
        this.cacheService = cacheService;
        this.supabaseService = supabaseService;
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
    async create(tenantId, dto, userId) {
        const currentProductsCount = await this.prisma.product.count({
            where: { tenantId, active: true }
        });
        if (currentProductsCount >= 500) {
            throw new common_1.BadRequestException('Has alcanzado el límite máximo de 500 productos permitido en tu plan. Por favor, actualiza tu plan para agregar más inventario.');
        }
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
            const product = await this.prisma.$transaction(async (tx) => {
                const product = await tx.product.create({
                    data: {
                        tenantId,
                        name: dto.name,
                        description: dto.description,
                        barcode,
                        sku: dto.sku,
                        imageUrl: dto.imageUrl,
                        images: dto.images ?? [],
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
                    await tx.stockMovement.create({
                        data: {
                            type: client_1.StockMovementType.INITIAL,
                            quantity: initialStock,
                            balanceAfter: initialStock,
                            productId: product.id,
                            warehouseId: initialWarehouseId,
                            notes: 'Inventario inicial al crear el producto',
                            userId: userId || null,
                        }
                    });
                }
                return product;
            });
            await this.invalidateProductCache(tenantId);
            return product;
        }
        catch (error) {
            throw new common_1.BadRequestException(error?.message ?? 'Error creating product');
        }
    }
    async findAllWithTotalStock(tenantId) {
        if (!tenantId) {
            console.error('❌ [ProductsService] Intento de findAllWithTotalStock sin tenantId');
            return [];
        }
        const cacheKey = this.cacheService.generateKey(tenantId, 'products', 'list');
        try {
            const cached = await this.cacheService.get(cacheKey);
            if (cached) {
                console.log(`📦 [ProductsService] Cargando ${cached.length} productos desde CACHE (Tenant: ${tenantId})`);
                return cached;
            }
        }
        catch (e) {
            console.error('⚠️ [ProductsService] Error leyendo caché:', e.message);
        }
        console.log(`🔍 [ProductsService] Consultando DB para tenant: ${tenantId}`);
        const products = await this.prisma.product.findMany({
            where: { tenantId, active: true },
            orderBy: { createdAt: 'desc' },
        });
        if (products.length === 0) {
            console.log(`ℹ️ [ProductsService] El tenant ${tenantId} no tiene productos registrados.`);
            return [];
        }
        const productIds = products.map(p => p.id);
        const stockData = await this.prisma.stock.groupBy({
            by: ['productId'],
            where: {
                productId: { in: productIds }
            },
            _sum: {
                quantity: true,
            },
        });
        const stockMap = new Map();
        stockData.forEach(item => {
            stockMap.set(item.productId, item._sum.quantity ?? 0);
        });
        const result = products.map(product => ({
            ...product,
            costPrice: Number(product.costPrice),
            salePrice: Number(product.salePrice),
            totalStock: stockMap.get(product.id) ?? 0,
        }));
        console.log(`✅ [ProductsService] DB retornó ${result.length} productos procesados (Tenant: ${tenantId})`);
        try {
            await this.cacheService.set(cacheKey, result, 300);
        }
        catch (e) {
            console.error('⚠️ [ProductsService] Error guardando en caché:', e.message);
        }
        return result;
    }
    async findOne(tenantId, id, refresh = false) {
        const cacheKey = this.cacheService.generateKey(tenantId, 'products', 'detail', id);
        if (!refresh) {
            const cached = await this.cacheService.get(cacheKey);
            if (cached)
                return cached;
        }
        const product = await this.prisma.product.findFirst({
            where: { id, tenantId, active: true },
            include: {
                inventory: { select: { quantity: true } },
                stockBatches: {
                    where: { remainingQuantity: { gt: 0 } },
                    orderBy: { entryDate: 'desc' },
                    select: { id: true, costPrice: true, remainingQuantity: true, entryDate: true }
                }
            },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        const totalStock = (product.inventory || []).reduce((acc, s) => acc + s.quantity, 0);
        const { inventory, stockBatches, ...rest } = product;
        const groupedMap = new Map();
        let leftToShow = totalStock;
        if (stockBatches && stockBatches.length > 0) {
            const sortedBatches = (stockBatches || []).sort((a, b) => {
                const dateDiff = new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime();
                if (dateDiff !== 0)
                    return dateDiff;
                return b.id.localeCompare(a.id);
            });
            for (const batch of sortedBatches) {
                if (leftToShow <= 0)
                    break;
                const qtyInBatch = batch.remainingQuantity || 0;
                const qtyToShow = Math.min(qtyInBatch, leftToShow);
                if (qtyToShow > 0) {
                    const priceKey = Number(batch.costPrice).toString();
                    groupedMap.set(priceKey, (groupedMap.get(priceKey) || 0) + qtyToShow);
                    leftToShow -= qtyToShow;
                }
            }
        }
        const activeCosts = Array.from(groupedMap.entries()).map(([costStr, quantity]) => ({
            cost: Number(costStr),
            quantity
        })).sort((a, b) => b.cost - a.cost);
        const result = { ...rest, totalStock, activeCosts };
        await this.cacheService.set(cacheKey, result, 600);
        return result;
    }
    async findByBarcode(tenantId, barcode) {
        const normalized = (barcode ?? '').trim();
        if (!normalized)
            throw new common_1.BadRequestException('barcode is required');
        const cacheKey = this.cacheService.generateKey(tenantId, 'products', 'barcode', normalized);
        const cached = await this.cacheService.get(cacheKey);
        if (cached) {
            return cached;
        }
        const product = await this.prisma.product.findFirst({
            where: { tenantId, barcode: normalized, active: true },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        const stockAggregate = await this.prisma.stock.aggregate({
            where: { productId: product.id },
            _sum: { quantity: true },
        });
        const result = {
            ...product,
            totalStock: stockAggregate._sum.quantity ?? 0,
        };
        await this.cacheService.set(cacheKey, result, 180);
        return result;
    }
    async update(tenantId, id, dto) {
        const exists = await this.prisma.product.findFirst({
            where: { id, tenantId, active: true },
            select: { id: true },
        });
        if (!exists)
            throw new common_1.NotFoundException('Product not found');
        try {
            const result = await this.prisma.product.update({
                where: { id },
                data: dto,
            });
            await this.invalidateProductCache(tenantId, id);
            return result;
        }
        catch (error) {
            throw new common_1.BadRequestException(error?.message ?? 'Error updating product');
        }
    }
    async remove(tenantId, id) {
        const product = await this.prisma.product.findFirst({
            where: { id, tenantId },
            select: { id: true, images: true, imageUrl: true },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        try {
            const result = await this.prisma.product.update({
                where: { id },
                data: { active: false }
            });
            const imagesToDelete = product.images && product.images.length > 0
                ? product.images
                : (product.imageUrl ? [product.imageUrl] : []);
            if (imagesToDelete.length > 0) {
                await this.deleteImagesFromStorage(imagesToDelete);
            }
            await this.invalidateProductCache(tenantId, id);
            return result;
        }
        catch (error) {
            throw new common_1.BadRequestException(error?.message ?? 'Error in soft-deleting product');
        }
    }
    async deleteImagesFromStorage(images) {
        if (!images || images.length === 0)
            return;
        try {
            const supabase = this.supabaseService.getClient();
            const paths = images
                .filter(url => url && url.includes('supabase'))
                .map(url => {
                try {
                    const urlObj = new URL(url);
                    const parts = urlObj.pathname.split('/product-images/');
                    return parts.length > 1 ? parts[1] : null;
                }
                catch (e) {
                    return null;
                }
            })
                .filter(p => p !== null);
            if (paths.length > 0) {
                console.log(`🧹 [Storage] Eliminando ${paths.length} imágenes del storage para producto eliminado`);
                await supabase.storage.from('product-images').remove(paths);
            }
        }
        catch (error) {
            console.error('⚠️ [ProductsService] Error al eliminar imágenes del storage:', error.message);
        }
    }
    async invalidateProductCache(tenantId, productId) {
        const listKey = this.cacheService.generateKey(tenantId, 'products', 'list');
        await this.cacheService.invalidate(listKey);
        if (productId) {
            const detailKey = this.cacheService.generateKey(tenantId, 'products', 'detail', productId);
            await this.cacheService.invalidate(detailKey);
        }
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cache_service_1.CacheService,
        supabase_service_1.SupabaseService])
], ProductsService);
//# sourceMappingURL=products.service.js.map
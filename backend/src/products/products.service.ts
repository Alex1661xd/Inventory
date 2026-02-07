import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { randomBytes } from 'crypto';
import { CacheService } from '../cache/cache.service';
import { StockMovementType } from '@prisma/client';

@Injectable()
export class ProductsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cacheService: CacheService
    ) { }

    private generateBarcode() {
        return `MUE-${randomBytes(4).toString('hex').toUpperCase()}`;
    }

    private async generateUniqueBarcode(tenantId: string) {
        for (let i = 0; i < 10; i++) {
            const barcode = this.generateBarcode();
            const exists = await this.prisma.product.findFirst({
                where: { tenantId, barcode },
                select: { id: true },
            });

            if (!exists) return barcode;
        }

        throw new BadRequestException('Could not generate a unique barcode');
    }

    async create(tenantId: string, dto: CreateProductDto, userId?: string) {
        // 1. Validar límite de productos (Plan Básico: 500 productos)
        const currentProductsCount = await this.prisma.product.count({
            where: { tenantId }
        });

        if (currentProductsCount >= 500) {
            throw new BadRequestException(
                'Has alcanzado el límite máximo de 500 productos permitido en tu plan. Por favor, actualiza tu plan para agregar más inventario.'
            );
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
                throw new BadRequestException('No warehouse found for this tenant');
            }

            initialWarehouseId = firstWarehouse.id;
        }

        if (initialStock > 0 && initialWarehouseId) {
            const warehouseExists = await this.prisma.warehouse.findFirst({
                where: { id: initialWarehouseId, tenantId },
                select: { id: true },
            });

            if (!warehouseExists) {
                throw new BadRequestException('initialWarehouseId is invalid');
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

                    // Record initial stock in Kardex
                    await tx.stockMovement.create({
                        data: {
                            type: StockMovementType.INITIAL,
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

            // Invalidar caché de productos del tenant
            await this.invalidateProductCache(tenantId);

            return product;
        } catch (error: any) {
            throw new BadRequestException(error?.message ?? 'Error creating product');
        }
    }

    async findAllWithTotalStock(tenantId: string) {
        // Intentar obtener del caché
        const cacheKey = this.cacheService.generateKey(tenantId, 'products', 'list');
        const cached = await this.cacheService.get<any[]>(cacheKey);

        if (cached) {
            return cached;
        }

        // Si no está en caché, consultar la DB
        // Optimized query: Get all stock data in a single query
        const stockData = await this.prisma.stock.groupBy({
            by: ['productId'],
            _sum: {
                quantity: true,
            },
        });

        // Create a map for fast lookup
        const stockMap = new Map<string, number>();
        stockData.forEach(item => {
            stockMap.set(item.productId, item._sum.quantity ?? 0);
        });

        // Fetch all products in a single query
        const products = await this.prisma.product.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
        });

        // Combine products with their stock totals using the map
        const result = products.map(product => ({
            ...product,
            totalStock: stockMap.get(product.id) ?? 0,
        }));

        // Guardar en caché por 5 minutos (300 segundos)
        await this.cacheService.set(cacheKey, result, 300);

        return result;
    }

    async findOne(tenantId: string, id: string) {
        // Intentar obtener del caché
        const cacheKey = this.cacheService.generateKey(tenantId, 'products', 'detail', id);
        const cached = await this.cacheService.get<any>(cacheKey);

        if (cached) {
            return cached;
        }

        const product = await this.prisma.product.findFirst({
            where: { id, tenantId },
            include: {
                inventory: { select: { quantity: true } },
            },
        });

        if (!product) throw new NotFoundException('Product not found');

        const totalStock = product.inventory.reduce((acc, s) => acc + s.quantity, 0);
        const { inventory, ...rest } = product;
        const result = { ...rest, totalStock };

        // Guardar en caché por 10 minutos
        await this.cacheService.set(cacheKey, result, 600);

        return result;
    }

    async findByBarcode(tenantId: string, barcode: string) {
        const normalized = (barcode ?? '').trim();
        if (!normalized) throw new BadRequestException('barcode is required');

        // Caché por código de barras (crítico para vendedores)
        const cacheKey = this.cacheService.generateKey(tenantId, 'products', 'barcode', normalized);
        const cached = await this.cacheService.get<any>(cacheKey);

        if (cached) {
            return cached;
        }

        const product = await this.prisma.product.findFirst({
            where: { tenantId, barcode: normalized },
        });

        if (!product) throw new NotFoundException('Product not found');

        const stockAggregate = await this.prisma.stock.aggregate({
            where: { productId: product.id },
            _sum: { quantity: true },
        });

        const result = {
            ...product,
            totalStock: stockAggregate._sum.quantity ?? 0,
        };

        // Guardar en caché por 3 minutos (búsqueda frecuente)
        await this.cacheService.set(cacheKey, result, 180);

        return result;
    }

    async update(tenantId: string, id: string, dto: UpdateProductDto) {
        const exists = await this.prisma.product.findFirst({
            where: { id, tenantId },
            select: { id: true },
        });

        if (!exists) throw new NotFoundException('Product not found');

        try {
            const result = await this.prisma.product.update({
                where: { id },
                data: dto,
            });

            // Invalidar caché al actualizar
            await this.invalidateProductCache(tenantId, id);

            return result;
        } catch (error: any) {
            throw new BadRequestException(error?.message ?? 'Error updating product');
        }
    }


    async remove(tenantId: string, id: string) {
        const exists = await this.prisma.product.findFirst({
            where: { id, tenantId },
            select: { id: true },
        });

        if (!exists) throw new NotFoundException('Product not found');

        try {
            const result = await this.prisma.product.delete({
                where: { id },
            });

            // Invalidar caché
            await this.invalidateProductCache(tenantId, id);

            return result;
        } catch (error: any) {
            throw new BadRequestException(error?.message ?? 'Error deleting product');
        }
    }

    // ==================== CACHE HELPERS ====================

    /**
     * Invalida todo el caché de productos de un tenant
     */
    private async invalidateProductCache(tenantId: string, productId?: string) {
        // Invalidar lista general
        const listKey = this.cacheService.generateKey(tenantId, 'products', 'list');
        await this.cacheService.invalidate(listKey);

        // Si hay un productId, invalidar ese producto específico
        if (productId) {
            const detailKey = this.cacheService.generateKey(tenantId, 'products', 'detail', productId);
            await this.cacheService.invalidate(detailKey);
        }
    }
}

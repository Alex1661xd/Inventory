import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { randomBytes } from 'crypto';
import { CacheService } from '../cache/cache.service';
import { StockMovementType } from '@prisma/client';
import { SupabaseService } from '../supabase/supabase.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class ProductsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cacheService: CacheService,
        private readonly supabaseService: SupabaseService,
        private readonly auditService: AuditService,
    ) { }

    private generateBarcode() {
        return `PRD-${randomBytes(4).toString('hex').toUpperCase()}`;
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
            // @ts-ignore
            where: { tenantId, active: true }
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

                    // IMPORTANTE: Crear lote FIFO para el stock inicial
                    await tx.stockBatch.create({
                        data: {
                            tenantId,
                            productId: product.id,
                            warehouseId: initialWarehouseId,
                            initialQuantity: initialStock,
                            remainingQuantity: initialStock,
                            costPrice: dto.costPrice ?? 0,
                            entryDate: new Date(),
                        }
                    });

                    // Record initial stock in Kardex
                    await tx.stockMovement.create({
                        data: {
                            type: StockMovementType.INITIAL,
                            quantity: initialStock,
                            balanceAfter: initialStock,
                            productId: product.id,
                            warehouseId: initialWarehouseId,
                            notes: 'Inventario inicial al crear el producto (Lote FIFO created)',
                            userId: userId || null,
                        }
                    });
                }

                return product;
            });

            // Invalidar caché de productos del tenant
            await this.invalidateProductCache(tenantId);

            // Audit log
            this.auditService.log({
                action: 'CREATE',
                entity: 'Product',
                entityId: product.id,
                newValue: { name: dto.name, costPrice: dto.costPrice, salePrice: dto.salePrice },
                userId,
                tenantId,
            });

            return product;
        } catch (error: any) {
            throw new BadRequestException(error?.message ?? 'Error creating product');
        }
    }

    async findAllWithTotalStock(
        tenantId: string,
        page: number = 1,
        limit: number = 50,
        search?: string,
        filters?: {
            categoryId?: string;
            minPrice?: number;
            maxPrice?: number;
            stockStatus?: string;
            sellableOnly?: boolean;
        },
        refresh: boolean = false
    ) {
        if (!tenantId) {
            console.error('❌ [ProductsService] Intento de findAllWithTotalStock sin tenantId');
            return { data: [], total: 0, page, totalPages: 0 };
        }

        const skip = (page - 1) * limit;
        const cacheKey = this.cacheService.generateKey(
            tenantId,
            'products',
            'list',
            `p${page}-l${limit}-s${search || 'all'}-c${filters?.categoryId || 'all'}-min${filters?.minPrice || '0'}-max${filters?.maxPrice || 'inf'}-st${filters?.stockStatus || 'all'}-sell${filters?.sellableOnly || 'false'}`
        );

        if (!refresh) {
            try {
                const cached = await this.cacheService.get<any>(cacheKey);
                if (cached) {
                    return cached;
                }
            } catch (e) {
                console.error('⚠️ [ProductsService] Error leyendo caché:', e.message);
            }
        }

        const where: any = {
            tenantId,
            active: true
        };

        if (filters?.sellableOnly) {
            where.isSellable = true;
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
                { barcode: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (filters?.categoryId) {
            where.categoryId = filters.categoryId;
        }

        if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
            where.salePrice = {};
            if (filters.minPrice !== undefined) where.salePrice.gte = filters.minPrice;
            if (filters.maxPrice !== undefined) where.salePrice.lte = filters.maxPrice;
        }

        if (filters?.stockStatus === 'inStock') {
            where.inventory = {
                some: {
                    quantity: { gt: 0 }
                }
            };
        } else if (filters?.stockStatus === 'outOfStock') {
            where.inventory = {
                every: {
                    quantity: { lte: 0 }
                }
            };
        }

        const [products, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: { inventory: true }
            }),
            this.prisma.product.count({ where })
        ]);

        const productsWithStock = products.map(p => {
            const totalStock = (p.inventory || []).reduce((acc, s) => acc + s.quantity, 0);
            const { inventory, ...rest } = p;
            return {
                ...rest,
                costPrice: Number(p.costPrice),
                salePrice: Number(p.salePrice),
                totalStock
            };
        });

        const result = {
            data: productsWithStock,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };

        console.log(`✅ [ProductsService] DB retornó ${products.length} productos procesados (Tenant: ${tenantId})`);

        // 5. Guardar en caché
        try {
            await this.cacheService.set(cacheKey, result, 60);
        } catch (e) {
            console.error('⚠️ [ProductsService] Error guardando en caché:', e.message);
        }

        return result;
    }

    async findOne(tenantId: string, id: string, refresh = false) {
        // Intentar obtener del caché (a menos que se pida refrescar)
        const cacheKey = this.cacheService.generateKey(tenantId, 'products', 'detail', id);

        if (!refresh) {
            const cached = await this.cacheService.get<any>(cacheKey);
            if (cached) return cached;
        }

        const product = await this.prisma.product.findFirst({
            // @ts-ignore
            where: { id, tenantId, active: true },
            include: {
                inventory: { select: { quantity: true } },
                // @ts-ignore
                stockBatches: {
                    where: { remainingQuantity: { gt: 0 } },
                    orderBy: { entryDate: 'desc' },
                    select: { id: true, costPrice: true, remainingQuantity: true, entryDate: true }
                }
            },
        });

        if (!product) throw new NotFoundException('Product not found');

        // @ts-ignore
        const totalStock = (product.inventory || []).reduce((acc, s) => acc + s.quantity, 0);
        // @ts-ignore
        const { inventory, stockBatches, ...rest } = product;

        // Agrupamos por costo usando un String como clave para evitar duplicados por precisión
        const groupedMap = new Map<string, number>();
        let leftToShow = totalStock;

        if (stockBatches && stockBatches.length > 0) {
            // Refuerzo: Ordenamos también en memoria por fecha descendente
            // @ts-ignore
            // Refuerzo: Ordenamos también en memoria por fecha descendente y luego por ID descendente
            // @ts-ignore
            const sortedBatches = (stockBatches || []).sort((a, b) => {
                const dateDiff = new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime();
                if (dateDiff !== 0) return dateDiff;
                // Si tienen la misma fecha exacta, usamos el ID que suele ser UUID v4 o secuencial, pero al menos da determinismo
                // Aunque lo mejor sería 'createdAt', pero no lo estamos seleccionando. Asumimos que los nuevos entran después.
                return b.id.localeCompare(a.id);
            });

            for (const batch of sortedBatches) {
                if (leftToShow <= 0) break;

                const qtyInBatch = batch.remainingQuantity || 0;
                const qtyToShow = Math.min(qtyInBatch, leftToShow);

                if (qtyToShow > 0) {
                    // Usamos el valor numérico formateado como clave para agrupar
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
            // @ts-ignore
            where: { tenantId, barcode: normalized, active: true },
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
            where: { id, tenantId, active: true },
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

            // Audit log
            this.auditService.log({
                action: 'UPDATE',
                entity: 'Product',
                entityId: id,
                newValue: dto,
                tenantId,
            });

            return result;
        } catch (error: any) {
            throw new BadRequestException(error?.message ?? 'Error updating product');
        }
    }


    async remove(tenantId: string, id: string) {
        const product = await this.prisma.product.findFirst({
            where: { id, tenantId },
            select: { id: true, images: true, barcode: true },
        });

        if (!product) throw new NotFoundException('Product not found');

        try {
            await this.prisma.$transaction(async (tx) => {
                // Soft delete: marcamos como inactivo
                await tx.product.update({
                    where: { id },
                    // @ts-ignore
                    data: { active: false }
                });

                // ✅ Limpiar stock y lotes FIFO del producto eliminado
                // Poner stock en 0
                await tx.stock.updateMany({
                    where: { productId: id },
                    data: { quantity: 0 }
                });

                // Poner lotes FIFO en 0
                await tx.stockBatch.updateMany({
                    where: { productId: id, remainingQuantity: { gt: 0 } },
                    data: { remainingQuantity: 0 }
                });

                // Registrar ajuste en Kardex
                const stocks = await tx.stock.findMany({
                    where: { productId: id },
                    select: { warehouseId: true }
                });

                for (const s of stocks) {
                    await tx.stockMovement.create({
                        data: {
                            productId: id,
                            warehouseId: s.warehouseId,
                            type: 'ADJUSTMENT',
                            quantity: 0,
                            balanceAfter: 0,
                            notes: 'Producto eliminado (soft-delete) — stock ajustado a 0',
                        }
                    });
                }
            });

            // Borrado real de imágenes del storage
            const imagesToDelete = product.images && product.images.length > 0
                ? product.images
                : [];

            if (imagesToDelete.length > 0) {
                await this.deleteImagesFromStorage(imagesToDelete);
            }

            // Invalidar caché (incluyendo barcode)
            await this.invalidateProductCache(tenantId, id, product.barcode);

            // Audit log
            this.auditService.log({
                action: 'DELETE',
                entity: 'Product',
                entityId: id,
                tenantId,
            });

            return { success: true };
        } catch (error: any) {
            throw new BadRequestException(error?.message ?? 'Error in soft-deleting product');
        }
    }

    private async deleteImagesFromStorage(images: string[]) {
        if (!images || images.length === 0) return;

        try {
            const supabase = this.supabaseService.getClient();
            const paths = images
                .filter(url => url && url.includes('supabase'))
                .map(url => {
                    try {
                        const urlObj = new URL(url);
                        const parts = urlObj.pathname.split('/product-images/');
                        return parts.length > 1 ? parts[1] : null;
                    } catch (e) { return null; }
                })
                .filter(p => p !== null) as string[];

            if (paths.length > 0) {
                console.log(`🧹 [Storage] Eliminando ${paths.length} imágenes del storage para producto eliminado`);
                await supabase.storage.from('product-images').remove(paths);
            }
        } catch (error) {
            console.error('⚠️ [ProductsService] Error al eliminar imágenes del storage:', error.message);
            // No lanzamos excepción para no bloquear el borrado del producto si falla el storage
        }
    }

    // ==================== CACHE HELPERS ====================

    /**
     * Invalida todo el caché de productos de un tenant
     */
    private async invalidateProductCache(tenantId: string, productId?: string, barcode?: string | null) {
        // Invalidar lista general (todas las combinaciones de paginación/filtros)
        const listPattern = this.cacheService.generateKey(tenantId, 'products', 'list', '*');
        await this.cacheService.invalidatePattern(listPattern);

        // Invalidar estadísticas de BI (siempre deben refrescarse si cambia el catálogo)
        const analyticsPattern = this.cacheService.generateKey(tenantId, 'analytics', '*');
        await this.cacheService.invalidatePattern(analyticsPattern);

        // Si hay un productId, invalidar ese producto específico
        if (productId) {
            const detailKey = this.cacheService.generateKey(tenantId, 'products', 'detail', productId);
            await this.cacheService.invalidate(detailKey);
        }

        // ✅ Invalidar caché de barcode si se conoce
        if (barcode) {
            const barcodeKey = this.cacheService.generateKey(tenantId, 'products', 'barcode', barcode);
            await this.cacheService.invalidate(barcodeKey);
        }
    }
}

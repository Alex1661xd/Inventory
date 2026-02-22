import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { CacheService } from '../cache/cache.service';
import { PrismaService } from '../prisma/prisma.service';
import { ComboPricingTypeDto, CreateComboDto } from './dto/create-combo.dto';
import { UpdateComboDto } from './dto/update-combo.dto';

type ComboListOptions = {
    warehouseId?: string;
    includeInactive?: boolean;
    publicOnly?: boolean;
};

@Injectable()
export class CombosService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cacheService: CacheService,
        private readonly auditService: AuditService,
    ) { }

    private normalizeItems(items: Array<{ productId: string; quantity: number }>) {
        const map = new Map<string, number>();
        for (const item of items) {
            if (!item?.productId) continue;
            const qty = Math.max(0, Math.floor(Number(item.quantity || 0)));
            if (qty <= 0) continue;
            map.set(item.productId, (map.get(item.productId) || 0) + qty);
        }
        return Array.from(map.entries()).map(([productId, quantity]) => ({ productId, quantity }));
    }

    private validatePricing(pricingType: ComboPricingTypeDto, fixedPrice: number, discountPercent: number) {
        if (pricingType === ComboPricingTypeDto.FIXED) {
            if (!(fixedPrice > 0)) {
                throw new BadRequestException('Para combos de precio fijo, el precio debe ser mayor a 0.');
            }
            return;
        }

        if (!(discountPercent > 0 && discountPercent < 100)) {
            throw new BadRequestException('Para combos por porcentaje, el descuento debe ser mayor a 0 y menor a 100.');
        }
    }

    private computeComboPricing(
        pricingType: ComboPricingTypeDto,
        fixedPrice: number,
        discountPercent: number,
        baseUnitPrice: number,
    ) {
        const normalizedBase = Math.max(0, Number(baseUnitPrice || 0));
        let finalUnitPrice = normalizedBase;

        if (pricingType === ComboPricingTypeDto.FIXED) {
            finalUnitPrice = Math.max(0, Number(fixedPrice || 0));
        } else {
            const pct = Math.max(0, Math.min(100, Number(discountPercent || 0)));
            finalUnitPrice = normalizedBase * (1 - (pct / 100));
        }

        const discountPerUnit = Math.max(0, normalizedBase - finalUnitPrice);

        return {
            baseUnitPrice: Math.round(normalizedBase * 100) / 100,
            finalUnitPrice: Math.round(finalUnitPrice * 100) / 100,
            discountPerUnit: Math.round(discountPerUnit * 100) / 100,
        };
    }

    private async buildComboViews(tenantId: string, combos: any[], warehouseId?: string) {
        const productIds = Array.from(new Set(combos.flatMap(c => (c.items || []).map((i: any) => i.productId))));

        const [products, globalStocks, warehouseStocks] = await Promise.all([
            productIds.length > 0
                ? this.prisma.product.findMany({
                    where: { tenantId, id: { in: productIds } },
                    select: {
                        id: true,
                        name: true,
                        costPrice: true,
                        salePrice: true,
                        active: true,
                        isSellable: true,
                        isPublic: true,
                        images: true,
                    }
                })
                : Promise.resolve([]),
            productIds.length > 0
                ? this.prisma.stock.groupBy({
                    by: ['productId'],
                    where: { productId: { in: productIds } },
                    _sum: { quantity: true },
                })
                : Promise.resolve([] as any[]),
            warehouseId && productIds.length > 0
                ? this.prisma.stock.findMany({
                    where: { warehouseId, productId: { in: productIds } },
                    select: { productId: true, quantity: true },
                })
                : Promise.resolve([] as any[]),
        ]);

        const productMap = new Map<string, any>(products.map((p: any) => [p.id, p] as [string, any]));
        const globalStockMap = new Map<string, number>(
            globalStocks.map((s: any) => [s.productId, Number(s._sum?.quantity || 0)])
        );
        const warehouseStockMap = new Map<string, number>(
            warehouseStocks.map((s: any) => [s.productId, Number(s.quantity || 0)])
        );

        return combos.map((combo: any) => {
            const itemRows = (combo.items || []).map((item: any) => {
                const product = productMap.get(item.productId);
                const globalStock = globalStockMap.get(item.productId) || 0;
                const warehouseStock = warehouseId ? (warehouseStockMap.get(item.productId) || 0) : undefined;
                const salePrice = Number(product?.salePrice || 0);
                const costPrice = Number(product?.costPrice || 0);

                return {
                    productId: item.productId,
                    productName: product?.name || 'Producto eliminado',
                    quantity: Number(item.quantity || 0),
                    productSalePrice: salePrice,
                    productCostPrice: costPrice,
                    globalStock,
                    warehouseStock,
                    productActive: !!product?.active,
                    productSellable: !!product?.isSellable,
                    productPublic: !!product?.isPublic,
                    productImage: product?.images?.[0] || null,
                };
            });

            const baseUnitPrice = itemRows.reduce((sum, item) => sum + (item.productSalePrice * item.quantity), 0);
            const pricing = this.computeComboPricing(
                combo.pricingType,
                Number(combo.fixedPrice || 0),
                Number(combo.discountPercent || 0),
                baseUnitPrice,
            );

            const maxUnitsGlobal = itemRows.length > 0
                ? Math.min(...itemRows.map(item => Math.floor((item.globalStock || 0) / Math.max(1, item.quantity))))
                : 0;

            const maxUnitsInWarehouse = warehouseId
                ? (
                    itemRows.length > 0
                        ? Math.min(...itemRows.map(item => Math.floor(((item.warehouseStock || 0)) / Math.max(1, item.quantity))))
                        : 0
                )
                : null;

            const allProductsSellable = itemRows.every(item => item.productActive && item.productSellable);
            const available = (warehouseId ? Number(maxUnitsInWarehouse || 0) : Number(maxUnitsGlobal || 0)) > 0
                && combo.isActive
                && allProductsSellable;

            return {
                id: combo.id,
                name: combo.name,
                description: combo.description,
                image: combo.image,
                pricingType: combo.pricingType,
                fixedPrice: Number(combo.fixedPrice || 0),
                discountPercent: Number(combo.discountPercent || 0),
                isActive: combo.isActive,
                isPublic: combo.isPublic,
                createdAt: combo.createdAt,
                updatedAt: combo.updatedAt,
                items: itemRows.map(item => ({
                    productId: item.productId,
                    productName: item.productName,
                    quantity: item.quantity,
                    productSalePrice: item.productSalePrice,
                    productCostPrice: item.productCostPrice,
                    globalStock: item.globalStock,
                    warehouseStock: item.warehouseStock,
                    productImage: item.productImage,
                })),
                baseUnitPrice: pricing.baseUnitPrice,
                finalUnitPrice: pricing.finalUnitPrice,
                discountPerUnit: pricing.discountPerUnit,
                maxUnitsGlobal: Number.isFinite(maxUnitsGlobal) ? maxUnitsGlobal : 0,
                maxUnitsInWarehouse: warehouseId ? (Number.isFinite(Number(maxUnitsInWarehouse)) ? Number(maxUnitsInWarehouse) : 0) : null,
                available,
            };
        });
    }

    private async invalidateCache(tenantId: string) {
        await this.cacheService.invalidatePattern(this.cacheService.generateKey(tenantId, 'combos', '*'));
        await this.cacheService.invalidatePattern(this.cacheService.generateKey(tenantId, 'analytics', '*'));
    }

    async create(tenantId: string, dto: CreateComboDto, userId?: string) {
        const normalizedItems = this.normalizeItems(dto.items || []);
        if (normalizedItems.length === 0) {
            throw new BadRequestException('Debes agregar al menos un producto al combo.');
        }

        const productIds = normalizedItems.map(i => i.productId);
        const products = await this.prisma.product.findMany({
            where: { tenantId, id: { in: productIds }, active: true },
            select: { id: true, salePrice: true },
        });

        if (products.length !== productIds.length) {
            throw new BadRequestException('Uno o más productos no existen o están inactivos.');
        }

        const productMap = new Map<string, any>(products.map((p: any) => [p.id, p] as [string, any]));
        const baseUnitPrice = normalizedItems.reduce((sum, item) => {
            return sum + (Number(productMap.get(item.productId)?.salePrice || 0) * item.quantity);
        }, 0);

        const pricingType = dto.pricingType || ComboPricingTypeDto.FIXED;
        const fixedPrice = Number(dto.fixedPrice || 0);
        const discountPercent = Number(dto.discountPercent || 0);
        this.validatePricing(pricingType, fixedPrice, discountPercent);

        const pricing = this.computeComboPricing(pricingType, fixedPrice, discountPercent, baseUnitPrice);
        if (!(pricing.finalUnitPrice > 0)) {
            throw new BadRequestException('El precio final del combo debe ser mayor a 0.');
        }

        const result = await (this.prisma as any).combo.create({
            data: {
                tenantId,
                name: dto.name.trim(),
                description: dto.description?.trim(),
                image: dto.image?.trim(),
                pricingType,
                fixedPrice: fixedPrice || pricing.finalUnitPrice,
                discountPercent,
                isActive: dto.isActive ?? true,
                isPublic: dto.isPublic ?? true,
                items: {
                    create: normalizedItems.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                    }))
                }
            },
            include: { items: true }
        });

        await this.invalidateCache(tenantId);

        this.auditService.log({
            action: 'CREATE',
            entity: 'Combo',
            entityId: result.id,
            newValue: {
                name: result.name,
                pricingType: result.pricingType,
                fixedPrice: Number(result.fixedPrice),
                discountPercent: Number(result.discountPercent),
                items: normalizedItems,
            },
            userId,
            tenantId,
        });

        return this.findOne(tenantId, result.id);
    }

    async findAll(tenantId: string, options?: ComboListOptions) {
        const where: any = { tenantId };
        if (!options?.includeInactive) where.isActive = true;
        if (options?.publicOnly) where.isPublic = true;

        const combos = await (this.prisma as any).combo.findMany({
            where,
            include: {
                items: true,
            },
            orderBy: { name: 'asc' },
        });

        return this.buildComboViews(tenantId, combos, options?.warehouseId);
    }

    async findOne(tenantId: string, id: string, warehouseId?: string) {
        const combo = await (this.prisma as any).combo.findFirst({
            where: { tenantId, id },
            include: { items: true },
        });

        if (!combo) throw new NotFoundException('Combo no encontrado');

        const [view] = await this.buildComboViews(tenantId, [combo], warehouseId);
        return view;
    }

    async update(tenantId: string, id: string, dto: UpdateComboDto, userId?: string) {
        const existing = await (this.prisma as any).combo.findFirst({
            where: { tenantId, id },
            include: { items: true },
        });

        if (!existing) throw new NotFoundException('Combo no encontrado');

        const normalizedItems = dto.items ? this.normalizeItems(dto.items) : null;
        if (dto.items && (!normalizedItems || normalizedItems.length === 0)) {
            throw new BadRequestException('Debes agregar al menos un producto al combo.');
        }

        const finalPricingType = dto.pricingType || existing.pricingType;
        const finalFixedPrice = dto.fixedPrice !== undefined ? Number(dto.fixedPrice) : Number(existing.fixedPrice || 0);
        const finalDiscountPercent = dto.discountPercent !== undefined ? Number(dto.discountPercent) : Number(existing.discountPercent || 0);
        this.validatePricing(finalPricingType, finalFixedPrice, finalDiscountPercent);

        if (normalizedItems) {
            const productIds = normalizedItems.map(i => i.productId);
            const products = await this.prisma.product.findMany({
                where: { tenantId, id: { in: productIds }, active: true },
                select: { id: true },
            });

            if (products.length !== productIds.length) {
                throw new BadRequestException('Uno o más productos no existen o están inactivos.');
            }
        }

        await this.prisma.$transaction(async (tx) => {
            await (tx as any).combo.update({
                where: { id },
                data: {
                    name: dto.name?.trim(),
                    description: dto.description?.trim(),
                    image: dto.image?.trim(),
                    pricingType: finalPricingType,
                    fixedPrice: finalFixedPrice,
                    discountPercent: finalDiscountPercent,
                    isActive: dto.isActive,
                    isPublic: dto.isPublic,
                }
            });

            if (normalizedItems) {
                await (tx as any).comboItem.deleteMany({ where: { comboId: id } });
                await (tx as any).comboItem.createMany({
                    data: normalizedItems.map(item => ({
                        comboId: id,
                        productId: item.productId,
                        quantity: item.quantity,
                    }))
                });
            }
        });

        await this.invalidateCache(tenantId);

        this.auditService.log({
            action: 'UPDATE',
            entity: 'Combo',
            entityId: id,
            newValue: dto,
            userId,
            tenantId,
        });

        return this.findOne(tenantId, id);
    }

    async remove(tenantId: string, id: string, userId?: string) {
        const combo = await (this.prisma as any).combo.findFirst({
            where: { tenantId, id },
            select: { id: true, isActive: true },
        });

        if (!combo) throw new NotFoundException('Combo no encontrado');

        if (!combo.isActive) {
            return { success: true, message: 'El combo ya estaba desactivado.' };
        }

        await (this.prisma as any).combo.update({
            where: { id },
            data: { isActive: false },
        });

        await this.invalidateCache(tenantId);

        this.auditService.log({
            action: 'DELETE',
            entity: 'Combo',
            entityId: id,
            userId,
            tenantId,
        });

        return { success: true, message: 'Combo desactivado correctamente.' };
    }
}

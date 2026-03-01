'use strict';

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CatalogService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Obtiene el catalogo publico de un negocio por su slug
     */
    async getCatalogBySlug(slug: string) {
        const tenants: any[] = await this.prisma.$queryRawUnsafe(
            `SELECT * FROM "Tenant" WHERE "slug" = $1 LIMIT 1`,
            slug
        );
        const tenant = tenants[0];

        const isEnabled = tenant?.catalogEnabled ?? tenant?.catalogenabled ?? true;
        if (!tenant || !isEnabled) {
            return null;
        }

        const products = await (this.prisma.product as any).findMany({
            where: {
                tenantId: tenant.id,
                // @ts-ignore
                active: true,
                isPublic: true,
            },
            select: {
                id: true,
                name: true,
                description: true,
                images: true,
                salePrice: true,
                creditPrice: true,
                allowCreditSale: true,
                createdAt: true,
                category: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                inventory: {
                    select: {
                        quantity: true,
                    }
                },
                visualVariants: {
                    where: { isPublic: true },
                    select: {
                        image: true,
                        name: true,
                        sortOrder: true,
                    },
                    orderBy: { sortOrder: 'asc' }
                }
            },
            orderBy: [
                { category: { name: 'asc' } },
                { name: 'asc' }
            ]
        });

        const combos = await (this.prisma as any).combo.findMany({
            where: {
                tenantId: tenant.id,
                isActive: true,
                isPublic: true,
            },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                salePrice: true,
                                active: true,
                                isSellable: true,
                                images: true,
                                inventory: {
                                    select: { quantity: true }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { name: 'asc' }
        } as any);

        const categories = await this.prisma.category.findMany({
            where: {
                tenantId: tenant.id,
                products: {
                    some: {
                        // @ts-ignore
                        active: true,
                        isPublic: true,
                    }
                }
            },
            select: {
                id: true,
                name: true,
            },
            orderBy: { name: 'asc' }
        });

        const catalogProductItems = products.map(product => {
            const totalStock = product.inventory.reduce((sum, inv) => sum + inv.quantity, 0);

            return {
                id: product.id,
                name: product.name,
                description: product.description,
                images: [
                    ...(product.images || []),
                    ...((product.visualVariants || []).map(v => v.image).filter(Boolean)),
                ].filter((img, index, arr) => arr.indexOf(img) === index),
                price: Number(product.salePrice),
                creditPrice: Number(product.creditPrice || 0),
                allowCreditSale: !!product.allowCreditSale,
                categoryId: product.category?.id || null,
                categoryName: product.category?.name || 'Sin categoria',
                available: totalStock > 0,
                type: 'PRODUCT',
                createdAt: product.createdAt,
            };
        });

        const catalogComboItems = (combos || [])
            .map((combo: any) => {
                const validItems = (combo.items || []).filter((item: any) => item.product && item.product.active && item.product.isSellable);
                if (validItems.length === 0) return null;

                const baseUnitPrice = validItems.reduce((sum: number, item: any) => {
                    return sum + (Number(item.quantity || 0) * Number(item.product.salePrice || 0));
                }, 0);

                const finalUnitPrice = combo.pricingType === 'FIXED'
                    ? Number(combo.fixedPrice || 0)
                    : baseUnitPrice * (1 - (Number(combo.discountPercent || 0) / 100));

                const maxUnitsGlobal = Math.min(...validItems.map((item: any) => {
                    const stock = (item.product.inventory || []).reduce((sum: number, inv: any) => sum + Number(inv.quantity || 0), 0);
                    return Math.floor(stock / Math.max(1, Number(item.quantity || 0)));
                }));

                const comboDescription = combo.description && combo.description.trim().length > 0
                    ? combo.description
                    : `Incluye: ${validItems.map((item: any) => `${item.quantity}x ${item.product.name}`).join(', ')}`;

                const comboImages = [
                    ...validItems
                        .map((item: any) => item.product?.images?.[0])
                        .filter((img: any) => typeof img === 'string' && img.length > 0),
                    ...(combo.image ? [combo.image] : []),
                ].filter((img, index, arr) => arr.indexOf(img) === index);

                return {
                    id: combo.id,
                    name: combo.name,
                    description: comboDescription,
                    images: comboImages,
                    price: Number(finalUnitPrice || 0),
                    creditPrice: 0,
                    allowCreditSale: false,
                    originalPrice: Number(baseUnitPrice || 0),
                    discountAmount: Math.max(0, Number(baseUnitPrice || 0) - Number(finalUnitPrice || 0)),
                    discountPercent: baseUnitPrice > 0
                        ? Math.max(0, ((Number(baseUnitPrice || 0) - Number(finalUnitPrice || 0)) / Number(baseUnitPrice || 0)) * 100)
                        : 0,
                    categoryId: 'combos',
                    categoryName: 'Combos',
                    available: Number.isFinite(maxUnitsGlobal) ? maxUnitsGlobal > 0 : false,
                    type: 'COMBO',
                    createdAt: combo.createdAt,
                    comboItems: validItems.map((item: any) => ({
                        productId: item.productId,
                        productName: item.product.name,
                        quantity: Number(item.quantity || 0),
                    })),
                };
            })
            .filter(Boolean);

        const catalogProducts = [...catalogProductItems, ...catalogComboItems];
        const finalCategories = [...categories];
        if (catalogComboItems.length > 0) {
            finalCategories.push({ id: 'combos', name: 'Combos' } as any);
        }

        return {
            business: {
                name: tenant.name,
                slug: tenant.slug,
                description: tenant.catalogDescription || tenant.catalogdescription || '',
                bgColor: tenant.catalogBgColor || tenant.catalogbgcolor || '#f5f5f4',
                accentColor: tenant.catalogAccentColor || tenant.catalogaccentcolor || '#292524',
                whatsApp: tenant.catalogWhatsApp || tenant.catalogwhatsapp || '',
            },
            categories: finalCategories,
            products: catalogProducts,
            totalProducts: catalogProducts.length,
            availableProducts: catalogProducts.filter((p: any) => p.available).length,
        };
    }

    /**
     * Obtiene la configuracion actual del catalogo para el admin
     */
    async getCatalogSettings(tenantId: string) {
        const tenants: any[] = await this.prisma.$queryRawUnsafe(
            `SELECT * FROM "Tenant" WHERE "id" = $1 LIMIT 1`,
            tenantId
        );
        const tenant = tenants[0];

        if (!tenant) {
            return null;
        }

        return {
            name: tenant.name,
            slug: tenant.slug,
            catalogDescription: tenant.catalogDescription || tenant.catalogdescription || '',
            catalogBgColor: tenant.catalogBgColor || tenant.catalogbgcolor || '#f5f5f4',
            catalogAccentColor: tenant.catalogAccentColor || tenant.catalogaccentcolor || '#292524',
            catalogEnabled: tenant.catalogEnabled ?? tenant.catalogenabled ?? true,
            catalogWhatsApp: tenant.catalogWhatsApp || tenant.catalogwhatsapp || '',
            catalogUrl: `/catalogo/${tenant.slug}`,
        };
    }

    /**
     * Actualiza la configuracion del catalogo
     */
    async updateCatalogSettings(tenantId: string, dto: any) {
        const updates: string[] = [];
        const values: any[] = [];
        let index = 1;

        if (dto.catalogDescription !== undefined) {
            updates.push(`"catalogDescription" = $${index++}`);
            values.push(dto.catalogDescription);
        }
        if (dto.catalogBgColor !== undefined) {
            updates.push(`"catalogBgColor" = $${index++}`);
            values.push(dto.catalogBgColor);
        }
        if (dto.catalogAccentColor !== undefined) {
            updates.push(`"catalogAccentColor" = $${index++}`);
            values.push(dto.catalogAccentColor);
        }
        if (dto.catalogEnabled !== undefined) {
            updates.push(`"catalogEnabled" = $${index++}`);
            values.push(dto.catalogEnabled);
        }
        if (dto.catalogWhatsApp !== undefined) {
            updates.push(`"catalogWhatsApp" = $${index++}`);
            values.push(dto.catalogWhatsApp);
        }

        if (updates.length > 0) {
            values.push(tenantId);
            const query = `UPDATE "Tenant" SET ${updates.join(', ')} WHERE "id" = $${index} RETURNING "slug"`;
            const result: any[] = await this.prisma.$queryRawUnsafe(query, ...values);

            return {
                success: true,
                message: 'Configuracion del catalogo actualizada',
                catalogUrl: `/catalogo/${result[0]?.slug}`,
            };
        }

        return {
            success: false,
            message: 'No se enviaron cambios para actualizar',
        };
    }
}

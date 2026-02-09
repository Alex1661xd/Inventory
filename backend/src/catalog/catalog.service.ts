'use strict';

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CatalogService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Obtiene el catálogo público de un negocio por su slug
     */
    async getCatalogBySlug(slug: string) {
        // Buscar el tenant por slug usando SQL puro para obtener todos los campos (incluso los nuevos)
        const tenants: any[] = await this.prisma.$queryRawUnsafe(
            `SELECT * FROM "Tenant" WHERE "slug" = $1 LIMIT 1`,
            slug
        );
        const tenant = tenants[0];

        const isEnabled = tenant?.catalogEnabled ?? tenant?.catalogenabled ?? true;
        if (!tenant || !isEnabled) {
            return null;
        }

        // Obtener productos públicos con stock
        const products = await this.prisma.product.findMany({
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
                imageUrl: true,
                salePrice: true,
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
                }
            },
            orderBy: [
                { category: { name: 'asc' } },
                { name: 'asc' }
            ]
        });

        // Obtener categorías únicas
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

        // Transformar productos para el catálogo
        const catalogProducts = products.map(product => {
            const totalStock = product.inventory.reduce((sum, inv) => sum + inv.quantity, 0);

            // Combinar imágenes: array de imágenes + imageUrl si existe
            const allImages = [...product.images];
            if (product.imageUrl && !allImages.includes(product.imageUrl)) {
                allImages.push(product.imageUrl);
            }

            return {
                id: product.id,
                name: product.name,
                description: product.description,
                images: allImages,
                price: Number(product.salePrice),
                categoryId: product.category?.id || null,
                categoryName: product.category?.name || 'Sin categoría',
                available: totalStock > 0,
            };
        });

        return {
            business: {
                name: tenant.name,
                slug: tenant.slug,
                description: tenant.catalogDescription || tenant.catalogdescription || '',
                bgColor: tenant.catalogBgColor || tenant.catalogbgcolor || '#f5f5f4',
                accentColor: tenant.catalogAccentColor || tenant.catalogaccentcolor || '#292524',
                whatsApp: tenant.catalogWhatsApp || tenant.catalogwhatsapp || '',
            },
            categories,
            products: catalogProducts,
            totalProducts: catalogProducts.length,
            availableProducts: catalogProducts.filter(p => p.available).length,
        };
    }

    /**
     * Obtiene la configuración actual del catálogo para el admin
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
     * Actualiza la configuración del catálogo
     */
    async updateCatalogSettings(tenantId: string, dto: any) {
        // Usamos SQL puro para evitar errores de validación de Prisma si el cliente no se ha regenerado
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
                message: 'Configuración del catálogo actualizada',
                catalogUrl: `/catalogo/${result[0]?.slug}`,
            };
        }

        return {
            success: false,
            message: 'No se enviaron cambios para actualizar',
        };
    }
}

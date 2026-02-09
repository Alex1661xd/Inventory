'use strict';

import { Controller, Get, Patch, Param, Body, NotFoundException, UseGuards } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { UpdateCatalogSettingsDto } from './dto/update-catalog-settings.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetTenantId } from '../auth/decorators/get-tenant-id.decorator';
import { Role } from '@prisma/client';

@Controller('catalog')
export class CatalogController {
    constructor(private readonly catalogService: CatalogService) { }

    /**
     * Endpoint PÚBLICO para obtener el catálogo de un negocio por su slug
     * Ruta: GET /catalog/public/:slug
     * No requiere autenticación
     */
    @Get('public/:slug')
    @Public()
    async getCatalog(@Param('slug') slug: string) {
        const catalog = await this.catalogService.getCatalogBySlug(slug);

        if (!catalog) {
            throw new NotFoundException('Catálogo no encontrado');
        }

        return catalog;
    }

    /**
     * Endpoint para obtener la configuración actual del catálogo (Admin)
     * Ruta: GET /catalog/settings
     */
    @Get('settings')
    @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.SELLER)
    async getSettings(@GetTenantId() tenantId: string) {
        return this.catalogService.getCatalogSettings(tenantId);
    }

    /**
     * Endpoint para actualizar la configuración del catálogo (Admin)
     * Ruta: PATCH /catalog/settings
     */
    @Patch('settings')
    @Roles(Role.ADMIN, Role.SUPER_ADMIN)
    async updateSettings(
        @GetTenantId() tenantId: string,
        @Body() dto: UpdateCatalogSettingsDto
    ) {
        return this.catalogService.updateCatalogSettings(tenantId, dto);
    }
}

import { Controller, Get, Post, Delete, Body, Param, UseGuards, BadRequestException, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SuperAdminService } from './super-admin.service';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { GenerateCodesDto } from './dto/generate-codes.dto';
import { DeleteTenantDataDto } from './dto/delete-tenant-data.dto';
import { GenerateCatalogImageDto } from './dto/generate-catalog-image.dto';

@Controller('super-admin')
@UseGuards(SuperAdminGuard)
export class SuperAdminController {
    constructor(private readonly superAdminService: SuperAdminService) { }

    // ========== REGISTRATION CODES ==========

    @Post('codes/generate')
    generateCodes(@Body() dto: GenerateCodesDto) {
        return this.superAdminService.generateCodes(dto.count, dto.expiresInDays);
    }

    @Get('codes')
    listCodes() {
        return this.superAdminService.listCodes();
    }

    @Delete('codes/:id')
    deleteCode(@Param('id') id: string) {
        return this.superAdminService.deleteCode(id);
    }

    // ========== TENANT MANAGEMENT ==========

    @Get('tenants')
    listTenants() {
        return this.superAdminService.listTenants();
    }

    @Post('tenants/:id/ban')
    banTenant(@Param('id') id: string) {
        return this.superAdminService.banTenant(id);
    }

    @Post('tenants/:id/unban')
    unbanTenant(@Param('id') id: string) {
        return this.superAdminService.unbanTenant(id);
    }

    @Post('tenants/:id/delete-data')
    deleteTenantData(
        @Param('id') id: string,
        @Body() dto: DeleteTenantDataDto,
    ) {
        return this.superAdminService.deleteAllTenantData(id, dto.password, dto.confirmation);
    }

    // ========== CATALOG IMAGE GENERATOR ==========

    @Post('catalog-images/generate')
    @UseInterceptors(
        FileInterceptor('image', {
            limits: { fileSize: 15 * 1024 * 1024 },
        }),
    )
    generateCatalogImage(
        @UploadedFile() image: any,
        @Body() dto: GenerateCatalogImageDto,
    ) {
        if (!image) {
            throw new BadRequestException('Debes enviar una imagen en el campo "image"');
        }

        return this.superAdminService.generateCatalogImage(image, dto.description, dto.whatsapp, dto.count);
    }
}

import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { GenerateCodesDto } from './dto/generate-codes.dto';
import { DeleteTenantDataDto } from './dto/delete-tenant-data.dto';

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
}

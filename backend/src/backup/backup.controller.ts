import { Controller, Get, Post, Query, UseGuards, Req, Redirect } from '@nestjs/common';
import { BackupService } from './backup.service';
import { GetTenantGuard } from '../auth/guards/get-tenant.guard';
import { Public } from '../auth/decorators/public.decorator';
import { Tenant } from '@prisma/client';

@Controller('backup')
export class BackupController {
    constructor(private readonly backupService: BackupService) { }

    @Get('auth-url')
    @UseGuards(GetTenantGuard)
    async getAuthUrl(@Req() req) {
        // Obtenemos el ID del negocio del token
        const tenantId = req.user.tenantId;
        return { url: await this.backupService.getAuthUrl(tenantId) };
    }

    @Public()
    @Get('callback')
    @Redirect()
    async callback(@Query('code') code: string, @Query('state') tenantId: string) {
        await this.backupService.saveTokens(tenantId, code);

        // Redirigimos de vuelta al dashboard de respaldos en el frontend
        // TODO: En producción, extraer la URL base del frontend de una variable de entorno
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
        return { url: `${frontendUrl}/dashboard/backup?success=true` };
    }

    @Post('run')
    @UseGuards(GetTenantGuard)
    async runBackup(@Req() req) {
        const tenantId = req.user.tenantId;
        return await this.backupService.runBackup(tenantId);
    }

    @Get('status')
    @UseGuards(GetTenantGuard)
    async getStatus(@Req() req) {
        const tenantId = req.user.tenantId;
        return await this.backupService.getStatus(tenantId);
    }
}

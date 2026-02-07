import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetTenantId } from '../auth/decorators/get-tenant-id.decorator';

@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('dashboard')
    @Roles('ADMIN', 'SUPER_ADMIN')
    getDashboardStats(
        @GetTenantId() tenantId: string,
        @Query('from') from?: string,
        @Query('to') to?: string,
    ) {
        return this.analyticsService.getDashboardStats(tenantId, from, to);
    }
}

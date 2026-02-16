import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { GetTenantGuard } from '../auth/guards/get-tenant.guard';
import { GetTenantId } from '../auth/decorators/get-tenant-id.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('audit')
@UseGuards(GetTenantGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AuditController {
    constructor(private readonly auditService: AuditService) { }

    @Get()
    findAll(
        @GetTenantId() tenantId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('entity') entity?: string,
        @Query('action') action?: string,
        @Query('userId') userId?: string,
        @Query('from') from?: string,
        @Query('to') to?: string,
    ) {
        return this.auditService.findAll(tenantId, {
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 50,
            entity,
            action,
            userId,
            from,
            to,
        });
    }

    @Get('entity')
    findByEntity(
        @GetTenantId() tenantId: string,
        @Query('entity') entity: string,
        @Query('entityId') entityId: string,
    ) {
        return this.auditService.findByEntity(tenantId, entity, entityId);
    }
}

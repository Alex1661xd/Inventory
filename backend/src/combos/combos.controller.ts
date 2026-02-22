import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { GetTenantId } from '../auth/decorators/get-tenant-id.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetTenantGuard } from '../auth/guards/get-tenant.guard';
import { CombosService } from './combos.service';
import { CreateComboDto } from './dto/create-combo.dto';
import { UpdateComboDto } from './dto/update-combo.dto';

@Controller('combos')
@UseGuards(GetTenantGuard)
export class CombosController {
    constructor(private readonly combosService: CombosService) { }

    private isTruthy(value?: string) {
        return value === '1' || value === 'true';
    }

    @Post()
    @Roles(Role.ADMIN, Role.SUPER_ADMIN)
    create(
        @GetTenantId() tenantId: string,
        @Request() req: any,
        @Body() dto: CreateComboDto,
    ) {
        return this.combosService.create(tenantId, dto, req.user?.id);
    }

    @Get()
    @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.SELLER)
    findAll(
        @GetTenantId() tenantId: string,
        @Request() req: any,
        @Query('warehouseId') warehouseId?: string,
        @Query('includeInactive') includeInactive?: string,
        @Query('publicOnly') publicOnly?: string,
    ) {
        const role = req.user?.role as Role | undefined;
        const canIncludeInactive = role === Role.ADMIN || role === Role.SUPER_ADMIN;

        return this.combosService.findAll(tenantId, {
            warehouseId,
            includeInactive: canIncludeInactive ? this.isTruthy(includeInactive) : false,
            publicOnly: this.isTruthy(publicOnly),
        });
    }

    @Get(':id')
    @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.SELLER)
    findOne(
        @GetTenantId() tenantId: string,
        @Param('id') id: string,
        @Query('warehouseId') warehouseId?: string,
    ) {
        return this.combosService.findOne(tenantId, id, warehouseId);
    }

    @Patch(':id')
    @Roles(Role.ADMIN, Role.SUPER_ADMIN)
    update(
        @GetTenantId() tenantId: string,
        @Request() req: any,
        @Param('id') id: string,
        @Body() dto: UpdateComboDto,
    ) {
        return this.combosService.update(tenantId, id, dto, req.user?.id);
    }

    @Delete(':id')
    @Roles(Role.ADMIN, Role.SUPER_ADMIN)
    remove(
        @GetTenantId() tenantId: string,
        @Request() req: any,
        @Param('id') id: string,
    ) {
        return this.combosService.remove(tenantId, id, req.user?.id);
    }
}

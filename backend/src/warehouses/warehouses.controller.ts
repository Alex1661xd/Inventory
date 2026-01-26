import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { GetTenantGuard } from '../auth/guards/get-tenant.guard';
import { GetTenantId } from '../auth/decorators/get-tenant-id.decorator';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { WarehousesService } from './warehouses.service';

@UseGuards(GetTenantGuard)
@Controller('warehouses')
export class WarehousesController {
    constructor(private readonly warehousesService: WarehousesService) { }

    @Post()
    create(@GetTenantId() tenantId: string, @Body() dto: CreateWarehouseDto) {
        return this.warehousesService.create(tenantId, dto);
    }

    @Get()
    findAll(@GetTenantId() tenantId: string) {
        return this.warehousesService.findAll(tenantId);
    }

    @Patch(':id')
    update(@GetTenantId() tenantId: string, @Param('id') id: string, @Body() dto: UpdateWarehouseDto) {
        return this.warehousesService.update(tenantId, id, dto);
    }

    @Delete(':id')
    remove(@GetTenantId() tenantId: string, @Param('id') id: string) {
        return this.warehousesService.remove(tenantId, id);
    }
}

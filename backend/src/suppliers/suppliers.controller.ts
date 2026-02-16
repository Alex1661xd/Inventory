import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetTenantGuard } from '../auth/guards/get-tenant.guard';
import { GetTenantId } from '../auth/decorators/get-tenant-id.decorator';

@Controller('suppliers')
@UseGuards(GetTenantGuard, RolesGuard)
export class SuppliersController {
    constructor(private readonly suppliersService: SuppliersService) { }

    @Post()
    @Roles('ADMIN', 'SUPER_ADMIN')
    create(@GetTenantId() tenantId: string, @Body() createSupplierDto: CreateSupplierDto) {
        return this.suppliersService.create(tenantId, createSupplierDto);
    }

    @Get()
    @Roles('ADMIN', 'SUPER_ADMIN')
    findAll(
        @GetTenantId() tenantId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
    ) {
        return this.suppliersService.findAll(
            tenantId,
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 20,
            search
        );
    }

    @Get(':id')
    @Roles('ADMIN', 'SUPER_ADMIN')
    findOne(@GetTenantId() tenantId: string, @Param('id') id: string) {
        return this.suppliersService.findOne(tenantId, id);
    }

    @Patch(':id')
    @Roles('ADMIN', 'SUPER_ADMIN')
    update(@GetTenantId() tenantId: string, @Param('id') id: string, @Body() updateSupplierDto: UpdateSupplierDto) {
        return this.suppliersService.update(tenantId, id, updateSupplierDto);
    }

    @Delete(':id')
    @Roles('ADMIN', 'SUPER_ADMIN')
    remove(@GetTenantId() tenantId: string, @Param('id') id: string) {
        return this.suppliersService.remove(tenantId, id);
    }
}


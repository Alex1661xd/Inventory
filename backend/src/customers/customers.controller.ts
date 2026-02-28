import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { SetCustomerBanDto } from './dto/set-customer-ban.dto';
import { GetTenantGuard } from '../auth/guards/get-tenant.guard';
import { GetTenantId } from '../auth/decorators/get-tenant-id.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('customers')
@UseGuards(GetTenantGuard)
export class CustomersController {
    constructor(private readonly customersService: CustomersService) { }

    @Post()
    create(@GetTenantId() tenantId: string, @Body() createCustomerDto: CreateCustomerDto) {
        return this.customersService.create(tenantId, createCustomerDto);
    }

    @Get()
    findAll(
        @GetTenantId() tenantId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
        @Query('refresh') refresh?: string,
    ) {
        return this.customersService.findAll(
            tenantId,
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 20,
            search,
            refresh === '1' || refresh === 'true'
        );
    }

    @Get(':id')
    findOne(@GetTenantId() tenantId: string, @Param('id') id: string) {
        return this.customersService.findOne(tenantId, id);
    }

    @Patch(':id')
    update(@GetTenantId() tenantId: string, @Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
        return this.customersService.update(id, tenantId, updateCustomerDto);
    }

    @Patch(':id/ban')
    @Roles('ADMIN', 'SUPER_ADMIN')
    setBanStatus(@GetTenantId() tenantId: string, @Param('id') id: string, @Body() dto: SetCustomerBanDto) {
        return this.customersService.setBanStatus(id, tenantId, dto);
    }

    @Delete(':id')
    remove(@GetTenantId() tenantId: string, @Param('id') id: string) {
        return this.customersService.remove(id, tenantId);
    }
}

import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('customers')
@UseGuards(AuthGuard('jwt'))
export class CustomersController {
    constructor(private readonly customersService: CustomersService) { }

    @Post()
    create(@Request() req, @Body() createCustomerDto: CreateCustomerDto) {
        return this.customersService.create(req.user.tenantId, createCustomerDto);
    }

    @Get()
    findAll(@Request() req) {
        return this.customersService.findAll(req.user.tenantId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.customersService.findOne(id);
    }

    @Patch(':id')
    update(@Request() req, @Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
        return this.customersService.update(id, req.user.tenantId, updateCustomerDto);
    }

    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
        return this.customersService.remove(id, req.user.tenantId);
    }
}

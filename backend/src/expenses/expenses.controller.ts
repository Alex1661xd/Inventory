import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { GetTenantGuard } from '../auth/guards/get-tenant.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GetTenantId } from '../auth/decorators/get-tenant-id.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('expenses')
@UseGuards(GetTenantGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class ExpensesController {
    constructor(private readonly expensesService: ExpensesService) { }

    @Post()
    create(
        @GetTenantId() tenantId: string,
        @Request() req,
        @Body() dto: CreateExpenseDto
    ) {
        return this.expensesService.create(tenantId, req.user.id, dto);
    }

    @Get()
    findAll(
        @GetTenantId() tenantId: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('category') category?: string
    ) {
        return this.expensesService.findAll(tenantId, { startDate, endDate, category });
    }

    @Get('summary')
    getSummary(
        @GetTenantId() tenantId: string,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string
    ) {
        return this.expensesService.getSummary(tenantId, startDate, endDate);
    }

    @Get('profit-loss')
    getProfitAndLoss(
        @GetTenantId() tenantId: string,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string
    ) {
        return this.expensesService.getProfitAndLoss(tenantId, startDate, endDate);
    }

    @Get(':id')
    findOne(@GetTenantId() tenantId: string, @Param('id') id: string) {
        return this.expensesService.findOne(tenantId, id);
    }

    @Put(':id')
    update(
        @GetTenantId() tenantId: string,
        @Param('id') id: string,
        @Body() dto: UpdateExpenseDto
    ) {
        return this.expensesService.update(tenantId, id, dto);
    }

    @Delete(':id')
    remove(@GetTenantId() tenantId: string, @Param('id') id: string) {
        return this.expensesService.remove(tenantId, id);
    }
}

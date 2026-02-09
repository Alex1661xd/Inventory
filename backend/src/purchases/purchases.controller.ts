import { Controller, Get, Post, Body, UseGuards, Request, Query, Param, Patch } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { GetTenantGuard } from '../auth/guards/get-tenant.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GetTenantId } from '../auth/decorators/get-tenant-id.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('purchases')
@UseGuards(GetTenantGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class PurchasesController {
    constructor(private readonly purchasesService: PurchasesService) { }

    @Post()
    create(
        @GetTenantId() tenantId: string,
        @Request() req,
        @Body() dto: CreatePurchaseDto
    ) {
        return this.purchasesService.create(tenantId, req.user.id, dto);
    }

    @Get()
    findAll(
        @GetTenantId() tenantId: string,
        @Query('from') from?: string,
        @Query('to') to?: string,
    ) {
        return this.purchasesService.findAll(tenantId, from, to);
    }

    @Get(':id')
    findOne(@GetTenantId() tenantId: string, @Param('id') id: string) {
        return this.purchasesService.findOne(tenantId, id);
    }

    @Patch(':id/pay')
    markAsPaid(
        @GetTenantId() tenantId: string,
        @Request() req,
        @Param('id') id: string
    ) {
        return this.purchasesService.markAsPaid(tenantId, req.user.id, id);
    }

    @Post(':id/payments')
    async addPayment(
        @GetTenantId() tenantId: string,
        @Request() req,
        @Param('id') id: string,
        @Body() body: { amount: number; notes?: string }
    ) {
        return this.purchasesService.addPayment(tenantId, req.user.id, id, body.amount, body.notes);
    }
}

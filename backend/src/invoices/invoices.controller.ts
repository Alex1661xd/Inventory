import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { GetTenantGuard } from '../auth/guards/get-tenant.guard';
import { GetTenantId } from '../auth/decorators/get-tenant-id.decorator';

@Controller('invoices')
@UseGuards(GetTenantGuard)
export class InvoicesController {
    constructor(private readonly invoicesService: InvoicesService) { }

    @Post()
    create(@GetTenantId() tenantId: string, @Request() req, @Body() createInvoiceDto: CreateInvoiceDto) {
        return this.invoicesService.create(tenantId, req.user.id, createInvoiceDto);
    }

    @Get()
    findAll(@GetTenantId() tenantId: string, @Request() req: any) {
        const user = req.user;
        const sellerId = user.role === 'SELLER' ? user.id : undefined;
        return this.invoicesService.findAll(tenantId, sellerId);
    }

    @Get(':id')
    findOne(@GetTenantId() tenantId: string, @Param('id') id: string, @Request() req: any) {
        const user = req.user;
        const sellerId = user.role === 'SELLER' ? user.id : undefined;
        return this.invoicesService.findOne(tenantId, id, sellerId);
    }

    @Post(':id/cancel')
    cancel(@GetTenantId() tenantId: string, @Param('id') id: string, @Request() req: any) {
        const user = req.user;
        const sellerId = user.role === 'SELLER' ? user.id : undefined;
        return this.invoicesService.cancel(tenantId, id, sellerId);
    }
}

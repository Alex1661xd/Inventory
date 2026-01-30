import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('invoices')
@UseGuards(AuthGuard('jwt'))
export class InvoicesController {
    constructor(private readonly invoicesService: InvoicesService) { }

    @Post()
    create(@Request() req, @Body() createInvoiceDto: CreateInvoiceDto) {
        return this.invoicesService.create(req.user.tenantId, req.user.id, createInvoiceDto);
    }

    @Get()
    findAll(@Request() req) {
        return this.invoicesService.findAll(req.user.tenantId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.invoicesService.findOne(id);
    }

    @Post(':id/cancel')
    cancel(@Request() req, @Param('id') id: string) {
        return this.invoicesService.cancel(req.user.tenantId, id);
    }
}

import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { GetTenantGuard } from '../auth/guards/get-tenant.guard';
import { GetTenantId } from '../auth/decorators/get-tenant-id.decorator';
import { CreditsService } from './credits.service';
import { AddCreditPaymentDto } from './dto/add-credit-payment.dto';

@Controller('credits')
@UseGuards(GetTenantGuard)
export class CreditsController {
    constructor(private readonly creditsService: CreditsService) { }

    @Get()
    findAll(
        @GetTenantId() tenantId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
        @Query('status') status?: string,
        @Query('from') from?: string,
        @Query('to') to?: string,
    ) {
        return this.creditsService.findAll(
            tenantId,
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 20,
            search,
            status,
            from,
            to,
        );
    }

    @Get(':id')
    findOne(@GetTenantId() tenantId: string, @Param('id') id: string) {
        return this.creditsService.findOne(tenantId, id);
    }

    @Post(':id/payments')
    addPayment(
        @GetTenantId() tenantId: string,
        @Request() req: any,
        @Param('id') id: string,
        @Body() dto: AddCreditPaymentDto,
    ) {
        return this.creditsService.addPayment(tenantId, req.user.id, id, dto);
    }
}

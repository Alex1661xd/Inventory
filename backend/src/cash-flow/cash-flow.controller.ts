import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { CashFlowService } from './cash-flow.service';
import { OpenShiftDto } from './dto/open-shift.dto';
import { CloseShiftDto } from './dto/close-shift.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { GetTenantGuard } from '../auth/guards/get-tenant.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GetTenantId } from '../auth/decorators/get-tenant-id.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('cash-flow')
@UseGuards(GetTenantGuard, RolesGuard)
export class CashFlowController {
    constructor(private readonly cashFlowService: CashFlowService) { }

    @Post('open')
    open(@GetTenantId() tenantId: string, @Request() req, @Body() dto: OpenShiftDto) {
        return this.cashFlowService.openShift(tenantId, req.user.id, dto);
    }

    @Post('close')
    close(@GetTenantId() tenantId: string, @Request() req, @Body() dto: CloseShiftDto) {
        return this.cashFlowService.closeShift(tenantId, req.user.id, dto);
    }

    @Get('current')
    getCurrent(@GetTenantId() tenantId: string, @Request() req) {
        return this.cashFlowService.getCurrentShift(tenantId, req.user.id);
    }

    @Post('transaction')
    addTransaction(@GetTenantId() tenantId: string, @Request() req, @Body() dto: CreateTransactionDto) {
        return this.cashFlowService.addTransaction(tenantId, req.user.id, dto);
    }

    @Get('history')
    @Roles('ADMIN', 'SUPER_ADMIN')
    getHistory(@GetTenantId() tenantId: string) {
        return this.cashFlowService.getHistory(tenantId);
    }
}

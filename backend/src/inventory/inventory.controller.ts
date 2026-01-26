import { Body, Controller, ForbiddenException, Get, Patch, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { GetTenantGuard } from '../auth/guards/get-tenant.guard';
import { GetTenantId } from '../auth/decorators/get-tenant-id.decorator';
import { InventoryService } from './inventory.service';
import { UpdateStockDto } from './dto/update-stock.dto';
import { TransferStockDto } from './dto/transfer-stock.dto';
import { QueryStockDto } from './dto/query-stock.dto';

@UseGuards(GetTenantGuard)
@Controller('inventory')
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) { }

    @Patch('update-stock')
    updateStock(
        @GetTenantId() tenantId: string,
        @Body() dto: UpdateStockDto,
        @Req() req: Request,
    ) {
        const user: any = (req as any).user;
        const role = user?.role;
        if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
            throw new ForbiddenException('Only admins can update stock');
        }

        return this.inventoryService.updateStock(tenantId, dto);
    }

    @Patch('transfer')
    transferStock(
        @GetTenantId() tenantId: string,
        @Body() dto: TransferStockDto,
        @Req() req: Request,
    ) {
        const user: any = (req as any).user;
        const role = user?.role;
        if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
            throw new ForbiddenException('Only admins can transfer stock');
        }

        return this.inventoryService.transferStock(tenantId, dto);
    }

    @Get('stock')
    findStock(@GetTenantId() tenantId: string, @Query() query: QueryStockDto) {
        return this.inventoryService.findStock(tenantId, query);
    }
}

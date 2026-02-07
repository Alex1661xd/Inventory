import { Body, Controller, Get, Patch, Query, UseGuards } from '@nestjs/common';
import { GetTenantGuard } from '../auth/guards/get-tenant.guard';
import { GetTenantId } from '../auth/decorators/get-tenant-id.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { InventoryService } from './inventory.service';
import { UpdateStockDto } from './dto/update-stock.dto';
import { TransferStockDto } from './dto/transfer-stock.dto';
import { QueryStockDto } from './dto/query-stock.dto';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(GetTenantGuard)
@Controller('inventory')
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) { }

    @Patch('update-stock')
    @Roles('ADMIN', 'SUPER_ADMIN')
    updateStock(
        @GetTenantId() tenantId: string,
        @GetUser('id') userId: string,
        @Body() dto: UpdateStockDto,
    ) {
        return this.inventoryService.updateStock(tenantId, dto, userId);
    }

    @Patch('transfer')
    @Roles('ADMIN', 'SUPER_ADMIN', 'SELLER')
    transferStock(
        @GetTenantId() tenantId: string,
        @GetUser('id') userId: string,
        @Body() dto: TransferStockDto,
    ) {
        return this.inventoryService.transferStock(tenantId, dto, userId);
    }

    @Get('stock')
    findStock(@GetTenantId() tenantId: string, @Query() query: QueryStockDto) {
        return this.inventoryService.findStock(tenantId, query);
    }

    @Get('kardex')
    @Roles('ADMIN', 'SUPER_ADMIN')
    getKardex(
        @GetTenantId() tenantId: string,
        @Query('productId') productId: string,
        @Query('warehouseId') warehouseId?: string,
    ) {
        return this.inventoryService.getKardex(tenantId, productId, warehouseId);
    }

    @Get('valuation')
    @Roles('ADMIN', 'SUPER_ADMIN')
    getValuation(@GetTenantId() tenantId: string) {
        return this.inventoryService.getValuation(tenantId);
    }
}

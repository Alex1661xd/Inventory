import type { Request } from 'express';
import { InventoryService } from './inventory.service';
import { UpdateStockDto } from './dto/update-stock.dto';
import { TransferStockDto } from './dto/transfer-stock.dto';
import { QueryStockDto } from './dto/query-stock.dto';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    updateStock(tenantId: string, dto: UpdateStockDto, req: Request): Promise<{
        id: string;
        quantity: number;
        productId: string;
        warehouseId: string;
    }>;
    transferStock(tenantId: string, dto: TransferStockDto, req: Request): Promise<{
        success: boolean;
        message: string;
    }>;
    findStock(tenantId: string, query: QueryStockDto): Promise<{
        product: {
            id: string;
            name: string;
            barcode: string | null;
            sku: string | null;
            costPrice: import("@prisma/client/runtime/library").Decimal;
            categoryId: string | null;
        };
        warehouse: {
            id: string;
            name: string;
        };
        id: string;
        quantity: number;
        productId: string;
        warehouseId: string;
    }[]>;
}

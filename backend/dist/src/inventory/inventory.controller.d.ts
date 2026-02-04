import { InventoryService } from './inventory.service';
import { UpdateStockDto } from './dto/update-stock.dto';
import { TransferStockDto } from './dto/transfer-stock.dto';
import { QueryStockDto } from './dto/query-stock.dto';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    updateStock(tenantId: string, dto: UpdateStockDto): Promise<{
        id: string;
        warehouseId: string;
        quantity: number;
        productId: string;
    }>;
    transferStock(tenantId: string, dto: TransferStockDto): Promise<{
        success: boolean;
        message: string;
    }>;
    findStock(tenantId: string, query: QueryStockDto): Promise<{
        product: {
            name: string;
            id: string;
            barcode: string | null;
            sku: string | null;
            costPrice: import("@prisma/client/runtime/library").Decimal;
            categoryId: string | null;
        };
        warehouse: {
            name: string;
            id: string;
        };
        id: string;
        warehouseId: string;
        quantity: number;
        productId: string;
    }[]>;
}

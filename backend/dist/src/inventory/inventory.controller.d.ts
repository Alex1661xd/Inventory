import { InventoryService } from './inventory.service';
import { UpdateStockDto } from './dto/update-stock.dto';
import { TransferStockDto } from './dto/transfer-stock.dto';
import { QueryStockDto } from './dto/query-stock.dto';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    updateStock(tenantId: string, userId: string, dto: UpdateStockDto): Promise<any>;
    transferStock(tenantId: string, userId: string, dto: TransferStockDto): Promise<{
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
    getKardex(tenantId: string, productId: string, warehouseId?: string): Promise<({
        user: {
            id: string;
            name: string;
        } | null;
        warehouse: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        quantity: number;
        productId: string;
        warehouseId: string;
        balanceAfter: number;
        type: import("@prisma/client").$Enums.StockMovementType;
        reference: string | null;
        notes: string | null;
        userId: string | null;
    })[]>;
}

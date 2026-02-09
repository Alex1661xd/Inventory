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
            name: string;
            id: string;
            sku: string | null;
            costPrice: import("@prisma/client/runtime/library").Decimal;
            categoryId: string | null;
            barcode: string | null;
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
    getKardex(tenantId: string, productId: string, warehouseId?: string): Promise<({
        user: {
            name: string;
            id: string;
        } | null;
        warehouse: {
            name: string;
            id: string;
        };
    } & {
        id: string;
        warehouseId: string;
        createdAt: Date;
        quantity: number;
        productId: string;
        balanceAfter: number;
        type: import("@prisma/client").$Enums.StockMovementType;
        reference: string | null;
        notes: string | null;
        userId: string | null;
    })[]>;
    getValuation(tenantId: string): Promise<{
        totalCost: number;
        totalValue: number;
        totalItems: number;
        potentialProfit: number;
        warehouseBreakdown: {
            name: string;
            cost: number;
            value: number;
            items: number;
            id: string;
        }[];
    }>;
}

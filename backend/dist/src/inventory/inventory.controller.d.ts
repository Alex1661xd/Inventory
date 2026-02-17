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
            sku: string | null;
            costPrice: import("@prisma/client/runtime/library").Decimal;
            salePrice: import("@prisma/client/runtime/library").Decimal;
            categoryId: string | null;
            barcode: string | null;
        };
        warehouse: {
            id: string;
            name: string;
        };
        id: string;
        warehouseId: string;
        quantity: number;
        productId: string;
    }[] | {
        data: {
            product: {
                id: string;
                name: string;
                sku: string | null;
                costPrice: import("@prisma/client/runtime/library").Decimal;
                salePrice: import("@prisma/client/runtime/library").Decimal;
                categoryId: string | null;
                barcode: string | null;
            };
            warehouse: {
                id: string;
                name: string;
            };
            id: string;
            warehouseId: string;
            quantity: number;
            productId: string;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
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
        warehouseId: string;
        userId: string | null;
        quantity: number;
        productId: string;
        balanceAfter: number;
        type: import("@prisma/client").$Enums.StockMovementType;
        reference: string | null;
        notes: string | null;
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

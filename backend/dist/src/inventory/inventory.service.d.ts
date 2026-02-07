import { PrismaService } from '../prisma/prisma.service';
import { TransferStockDto } from './dto/transfer-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { QueryStockDto } from './dto/query-stock.dto';
export declare class InventoryService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    transferStock(tenantId: string, dto: TransferStockDto, userId?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    updateStock(tenantId: string, dto: UpdateStockDto, userId?: string): Promise<any>;
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

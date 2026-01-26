import { PrismaService } from '../prisma/prisma.service';
import { TransferStockDto } from './dto/transfer-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { QueryStockDto } from './dto/query-stock.dto';
export declare class InventoryService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    transferStock(tenantId: string, dto: TransferStockDto): Promise<{
        success: boolean;
        message: string;
    }>;
    updateStock(tenantId: string, dto: UpdateStockDto): Promise<{
        id: string;
        productId: string;
        quantity: number;
        warehouseId: string;
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
        productId: string;
        quantity: number;
        warehouseId: string;
    }[]>;
}

import { StockMovementType } from '@prisma/client';
export declare class UpdateStockDto {
    productId: string;
    warehouseId: string;
    quantityDelta: number;
    type?: StockMovementType;
}

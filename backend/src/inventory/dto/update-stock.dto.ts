import { IsUUID, IsInt, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { StockMovementType } from '@prisma/client';

export class UpdateStockDto {
    @IsUUID()
    @IsNotEmpty()
    productId!: string;

    @IsUUID()
    @IsNotEmpty()
    warehouseId!: string;

    @IsInt()
    @IsNotEmpty()
    quantityDelta!: number;

    @IsEnum(StockMovementType)
    @IsOptional()
    type?: StockMovementType;
}

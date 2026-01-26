import { IsUUID, IsInt, IsNotEmpty } from 'class-validator';

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
}

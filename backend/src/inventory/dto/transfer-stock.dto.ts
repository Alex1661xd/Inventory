import { IsInt, IsPositive, IsString, IsUUID } from 'class-validator';

export class TransferStockDto {
    @IsUUID()
    productId: string;

    @IsUUID()
    fromWarehouseId: string;

    @IsUUID()
    toWarehouseId: string;

    @IsInt()
    @IsPositive()
    quantity: number;
}

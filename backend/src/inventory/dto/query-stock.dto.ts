import { IsUUID, IsOptional } from 'class-validator';

export class QueryStockDto {
    @IsOptional()
    @IsUUID()
    productId?: string;

    @IsOptional()
    @IsUUID()
    warehouseId?: string;
}

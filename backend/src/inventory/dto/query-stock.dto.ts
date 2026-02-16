import { IsUUID, IsOptional, IsString, IsNumberString } from 'class-validator';

export class QueryStockDto {
    @IsOptional()
    @IsUUID()
    productId?: string;

    @IsOptional()
    @IsUUID()
    warehouseId?: string;

    @IsOptional()
    @IsNumberString()
    page?: string;

    @IsOptional()
    @IsNumberString()
    limit?: string;

    @IsOptional()
    @IsString()
    search?: string;
}

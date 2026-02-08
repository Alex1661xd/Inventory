import { IsNotEmpty, IsNumber, IsString, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class PurchaseItemDto {
    @IsNotEmpty()
    @IsString()
    productId: string;

    @IsNotEmpty()
    @IsNumber()
    quantity: number;

    @IsNotEmpty()
    @IsNumber()
    costPrice: number;
}

export class CreatePurchaseDto {
    @IsNotEmpty()
    @IsString()
    supplierId: string;

    @IsOptional()
    @IsString()
    warehouseId?: string;

    @IsOptional()
    @IsString()
    date?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PurchaseItemDto)
    items: PurchaseItemDto[];
}

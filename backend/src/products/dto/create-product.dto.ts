import { IsString, IsOptional, IsNumber, IsBoolean, IsUUID, Min, MaxLength, IsInt, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

class ProductVisualVariantDto {
    @IsString()
    @MaxLength(120)
    name!: string;

    @IsString()
    @MaxLength(1200)
    image!: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;

    @IsOptional()
    @IsBoolean()
    isPublic?: boolean;
}

export class CreateProductDto {
    @IsString()
    @MaxLength(200)
    name!: string;

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    description?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    sku?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    images?: string[];

    @IsNumber()
    @Min(0)
    costPrice!: number;

    @IsNumber()
    @Min(0)
    salePrice!: number;

    @IsOptional()
    @IsBoolean()
    isPublic?: boolean;

    @IsOptional()
    @IsBoolean()
    isSellable?: boolean;

    @IsUUID()
    categoryId!: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    initialStock?: number;

    @IsOptional()
    @IsUUID()
    initialWarehouseId?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductVisualVariantDto)
    visualVariants?: ProductVisualVariantDto[];
}

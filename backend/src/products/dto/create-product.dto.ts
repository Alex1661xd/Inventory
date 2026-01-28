import { IsString, IsOptional, IsNumber, IsBoolean, IsUUID, Min, MaxLength, IsInt, IsArray } from 'class-validator';

export class CreateProductDto {
    @IsString()
    @MaxLength(200)
    name!: string;

    @IsString()
    @MaxLength(1000)
    description!: string;

    @IsString()
    @MaxLength(100)
    sku!: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    imageUrl?: string;

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

    @IsUUID()
    categoryId!: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    initialStock?: number;

    @IsOptional()
    @IsUUID()
    initialWarehouseId?: string;
}

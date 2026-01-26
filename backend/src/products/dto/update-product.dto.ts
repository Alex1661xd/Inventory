import { IsString, IsOptional, IsNumber, IsBoolean, IsUUID, Min, MaxLength } from 'class-validator';

export class UpdateProductDto {
    @IsOptional()
    @IsString()
    @MaxLength(200)
    name?: string;

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    description?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    sku?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    imageUrl?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    costPrice?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    salePrice?: number;

    @IsOptional()
    @IsBoolean()
    isPublic?: boolean;

    @IsOptional()
    @IsUUID()
    categoryId?: string;
}

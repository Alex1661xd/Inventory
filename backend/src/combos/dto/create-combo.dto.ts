import { Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsBoolean,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    Max,
    Min,
    ValidateNested,
} from 'class-validator';

export enum ComboPricingTypeDto {
    FIXED = 'FIXED',
    PERCENT_OFF = 'PERCENT_OFF',
}

export class ComboItemInputDto {
    @IsUUID()
    productId: string;

    @IsInt()
    @Min(1)
    quantity: number;
}

export class CreateComboDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    image?: string;

    @IsOptional()
    @IsEnum(ComboPricingTypeDto)
    pricingType?: ComboPricingTypeDto = ComboPricingTypeDto.FIXED;

    @IsOptional()
    @IsNumber()
    @Min(0)
    fixedPrice?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    discountPercent?: number;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsBoolean()
    isPublic?: boolean;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => ComboItemInputDto)
    items: ComboItemInputDto[];
}

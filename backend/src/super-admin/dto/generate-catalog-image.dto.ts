import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class GenerateCatalogImageDto {
    @IsString()
    @IsOptional()
    @MaxLength(2000)
    description?: string;

    @IsString()
    @IsOptional()
    @MaxLength(50)
    whatsapp?: string;

    @IsInt()
    @Min(1)
    @Max(3)
    @IsOptional()
    count?: number = 3;

    @IsString()
    @IsOptional()
    @MaxLength(500)
    variant1?: string;

    @IsString()
    @IsOptional()
    @MaxLength(500)
    variant2?: string;

    @IsString()
    @IsOptional()
    @MaxLength(500)
    variant3?: string;
}

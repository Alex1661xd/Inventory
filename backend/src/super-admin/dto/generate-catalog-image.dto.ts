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
}

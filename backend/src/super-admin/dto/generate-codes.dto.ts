import { IsNumber, IsOptional } from 'class-validator';

export class GenerateCodesDto {
    @IsNumber()
    @IsOptional()
    count?: number = 1;

    @IsNumber()
    @IsOptional()
    expiresInDays?: number;
}

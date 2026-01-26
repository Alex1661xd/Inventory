import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateWarehouseDto {
    @IsString()
    @MaxLength(200)
    name!: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    address?: string;
}

import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCustomerDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value !== 'string') return value;
        const trimmed = value.trim();
        return trimmed === '' ? undefined : trimmed;
    })
    email?: string;

    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsString()
    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value !== 'string') return value;
        const trimmed = value.trim();
        return trimmed === '' ? undefined : trimmed;
    })
    address?: string;

    @IsString()
    @IsNotEmpty()
    docNumber: string;
}

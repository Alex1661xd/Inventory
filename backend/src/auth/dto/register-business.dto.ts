
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterBusinessDto {
    @IsEmail()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
    email!: string;

    @IsString()
    @MinLength(6)
    password!: string;

    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    userName!: string;

    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    businessName!: string;

    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
    registrationCode!: string; // CODIGO OBLIGATORIO PARA SUPERADMIN
}

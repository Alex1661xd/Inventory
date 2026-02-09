import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteTenantDataDto {
    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    confirmation: string; // Must be "confirmar"
}

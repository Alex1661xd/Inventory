import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class SetCustomerBanDto {
    @IsBoolean()
    isBanned: boolean;

    @IsString()
    @IsOptional()
    @MaxLength(500)
    @Transform(({ value }) => {
        if (typeof value !== 'string') return value;
        const trimmed = value.trim();
        return trimmed === '' ? undefined : trimmed;
    })
    banReason?: string;
}

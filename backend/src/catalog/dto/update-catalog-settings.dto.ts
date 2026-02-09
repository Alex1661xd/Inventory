'use strict';

import { IsString, IsOptional, IsBoolean, Matches } from 'class-validator';

export class UpdateCatalogSettingsDto {
    @IsOptional()
    @IsString()
    catalogDescription?: string;

    @IsOptional()
    @IsString()
    @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
        message: 'catalogBgColor debe ser un color hexadecimal válido (ej: #f5f5f4)'
    })
    catalogBgColor?: string;

    @IsOptional()
    @IsString()
    @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
        message: 'catalogAccentColor debe ser un color hexadecimal válido (ej: #292524)'
    })
    catalogAccentColor?: string;

    @IsOptional()
    @IsBoolean()
    catalogEnabled?: boolean;

    @IsOptional()
    @IsString()
    catalogWhatsApp?: string;
}

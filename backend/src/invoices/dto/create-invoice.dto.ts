import { Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsDateString,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
    ValidateNested,
} from 'class-validator';
import { InvoiceStatus, PaymentMethod } from '@prisma/client';

class InvoiceItemDto {
    @IsString()
    @IsNotEmpty()
    productId: string;

    @IsNumber()
    @IsNotEmpty()
    quantity: number;

    @IsNumber()
    @IsNotEmpty()
    unitPrice: number;
}

class InvoiceComboLineDto {
    @IsString()
    @IsNotEmpty()
    comboId: string;

    @IsNumber()
    @IsNotEmpty()
    quantity: number;
}

class CreditTermsDto {
    @IsNumber()
    @Min(0)
    downPayment: number;

    @IsNumber()
    @Min(1)
    installmentsCount: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    installmentAmount?: number;

    @IsOptional()
    @IsDateString()
    firstDueDate?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}

export class CreateInvoiceDto {
    @IsNumber()
    @IsNotEmpty()
    total: number;

    @IsNumber()
    @IsOptional()
    discount?: number;

    @IsEnum(InvoiceStatus)
    @IsOptional()
    status?: InvoiceStatus = InvoiceStatus.PAID;

    @IsEnum(PaymentMethod)
    @IsNotEmpty()
    paymentMethod: PaymentMethod;

    @IsOptional()
    @IsBoolean()
    isCreditSale?: boolean;

    @IsOptional()
    @ValidateNested()
    @Type(() => CreditTermsDto)
    credit?: CreditTermsDto;

    @IsString()
    @IsOptional()
    customerId?: string;

    @IsString()
    @IsNotEmpty()
    warehouseId: string; // Required to deduct stock

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => InvoiceItemDto)
    items: InvoiceItemDto[];

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => InvoiceComboLineDto)
    comboLines?: InvoiceComboLineDto[];

    @IsNumber()
    @IsOptional()
    amountReceived?: number;

    @IsNumber()
    @IsOptional()
    amountReturned?: number;
}

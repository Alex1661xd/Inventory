import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
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

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

export class CreateInvoiceDto {
    @IsNumber()
    @IsNotEmpty()
    total: number;

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

    @IsNumber()
    @IsOptional()
    amountReceived?: number;

    @IsNumber()
    @IsOptional()
    amountReturned?: number;
}

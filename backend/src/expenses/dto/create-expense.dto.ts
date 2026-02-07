import { IsNotEmpty, IsNumber, IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';

export enum ExpenseCategory {
    RENT = 'RENT',
    UTILITIES = 'UTILITIES',
    PAYROLL = 'PAYROLL',
    SUPPLIES = 'SUPPLIES',
    MAINTENANCE = 'MAINTENANCE',
    TRANSPORT = 'TRANSPORT',
    MARKETING = 'MARKETING',
    TAXES = 'TAXES',
    INSURANCE = 'INSURANCE',
    OTHER = 'OTHER',
}

export class CreateExpenseDto {
    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsEnum(ExpenseCategory)
    @IsNotEmpty()
    category: ExpenseCategory;

    @IsDateString()
    @IsOptional()
    date?: string;

    @IsString()
    @IsOptional()
    supplierId?: string;
}

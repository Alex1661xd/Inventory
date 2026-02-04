import { IsNumber, IsString, IsEnum } from 'class-validator';

export enum CashTransactionType {
    DEPOSIT = 'DEPOSIT',
    WITHDRAWAL = 'WITHDRAWAL',
    EXPENSE = 'EXPENSE'
}

export class CreateTransactionDto {
    @IsNumber()
    amount: number;

    @IsString()
    reason: string;

    @IsEnum(CashTransactionType)
    type: CashTransactionType;
}

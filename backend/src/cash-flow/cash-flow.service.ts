import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpenShiftDto } from './dto/open-shift.dto';
import { CloseShiftDto } from './dto/close-shift.dto';
import { CreateTransactionDto, CashTransactionType } from './dto/create-transaction.dto';

@Injectable()
export class CashFlowService {
    constructor(private readonly prisma: PrismaService) { }

    async openShift(tenantId: string, sellerId: string, dto: OpenShiftDto) {
        // Verificar si ya tiene turno abierto
        const existing = await this.prisma.cashShift.findFirst({
            where: { tenantId, sellerId, status: 'OPEN' }
        });

        if (existing) {
            throw new BadRequestException('Ya tienes un turno de caja abierto');
        }

        return this.prisma.cashShift.create({
            data: {
                tenantId,
                sellerId,
                initialAmount: dto.initialAmount,
                status: 'OPEN',
                openingTime: new Date(),
            }
        });
    }

    async getCurrentShift(tenantId: string, sellerId: string) {
        return this.prisma.cashShift.findFirst({
            where: { tenantId, sellerId, status: 'OPEN' },
            include: { transactions: true }
        });
    }

    async addTransaction(tenantId: string, sellerId: string, dto: CreateTransactionDto) {
        const shift = await this.getCurrentShift(tenantId, sellerId);
        if (!shift) throw new BadRequestException('No hay turno abierto');

        return this.prisma.cashTransaction.create({
            data: {
                shiftId: shift.id,
                amount: dto.amount,
                reason: dto.reason,
                type: dto.type as any,
            }
        });
    }

    async closeShift(tenantId: string, sellerId: string, dto: CloseShiftDto) {
        const shift = await this.getCurrentShift(tenantId, sellerId);
        if (!shift) throw new BadRequestException('No hay turno abierto para cerrar');

        const closingTime = new Date();

        // Calcular ventas en efectivo realizadas por este vendedor durante este turno
        const cashSales = await this.prisma.invoice.aggregate({
            where: {
                tenantId,
                sellerId,
                paymentMethod: 'CASH',
                status: 'PAID',
                createdAt: {
                    gte: shift.openingTime,
                    lte: closingTime
                }
            },
            _sum: {
                total: true
            }
        });

        const totalSales = Number(cashSales._sum.total || 0);

        // Calcular movimientos manuales
        // DEPOSIT suma, WITHDRAWAL resta, EXPENSE resta
        const transactions = await this.prisma.cashTransaction.findMany({
            where: { shiftId: shift.id }
        });

        let totalTransactions = 0;
        for (const tx of transactions) {
            const amount = Number(tx.amount);
            // Asumiendo que Prisma genera el enum como string 'DEPOSIT' etc.
            if (String(tx.type) === 'DEPOSIT') totalTransactions += amount;
            else totalTransactions -= amount; // WITHDRAWAL u EXPENSE
        }

        const initial = Number(shift.initialAmount);
        const systemAmount = initial + totalSales + totalTransactions; // Cuánto debería haber teóricamente
        const finalAmount = dto.finalAmount;
        const difference = finalAmount - systemAmount;

        return this.prisma.cashShift.update({
            where: { id: shift.id },
            data: {
                status: 'CLOSED',
                closingTime,
                finalAmount,
                systemAmount,
                difference
            }
        });
    }

    // Para Admin
    async getHistory(tenantId: string, limit = 50) {
        return this.prisma.cashShift.findMany({
            where: { tenantId },
            orderBy: { openingTime: 'desc' },
            take: limit,
            include: { seller: true }
        });
    }
}

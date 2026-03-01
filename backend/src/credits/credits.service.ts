import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { AuditService } from '../audit/audit.service';
import { AddCreditPaymentDto } from './dto/add-credit-payment.dto';

type CreditSaleStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED';
const CREDIT_STATUS = {
    PENDING: 'PENDING' as CreditSaleStatus,
    PARTIAL: 'PARTIAL' as CreditSaleStatus,
    PAID: 'PAID' as CreditSaleStatus,
    OVERDUE: 'OVERDUE' as CreditSaleStatus,
    CANCELLED: 'CANCELLED' as CreditSaleStatus,
};

@Injectable()
export class CreditsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cacheService: CacheService,
        private readonly auditService: AuditService,
    ) { }

    private roundMoney(value: number) {
        return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
    }

    private resolveCreditSaleStatus(params: {
        balance: number;
        paidAmount: number;
        nextDueDate?: Date | null;
    }): CreditSaleStatus {
        const balance = this.roundMoney(Number(params.balance || 0));
        const paidAmount = this.roundMoney(Number(params.paidAmount || 0));
        const nextDueDate = params.nextDueDate || null;

        if (balance <= 0) return CREDIT_STATUS.PAID;
        if (nextDueDate && nextDueDate.getTime() < Date.now()) return CREDIT_STATUS.OVERDUE;
        if (paidAmount > 0) return CREDIT_STATUS.PARTIAL;
        return CREDIT_STATUS.PENDING;
    }

    private async invalidateCreditsCache(tenantId: string, creditSaleId?: string) {
        await this.cacheService.invalidatePattern(this.cacheService.generateKey(tenantId, 'credits', '*'));
        await this.cacheService.invalidatePattern(this.cacheService.generateKey(tenantId, 'cash-flow', '*'));
        await this.cacheService.invalidatePattern(this.cacheService.generateKey(tenantId, 'analytics', '*'));
        await this.cacheService.invalidatePattern(this.cacheService.generateKey(tenantId, 'expenses', '*'));

        if (creditSaleId) {
            await this.cacheService.invalidate(this.cacheService.generateKey(tenantId, 'credits', 'detail', creditSaleId));
        }
    }

    private async refreshOverdueFlags(tenantId: string) {
        await (this.prisma as any).creditSale.updateMany({
            where: {
                tenantId,
                status: { in: [CREDIT_STATUS.PENDING, CREDIT_STATUS.PARTIAL] },
                balance: { gt: 0 },
                nextDueDate: { lt: new Date() },
            },
            data: { status: CREDIT_STATUS.OVERDUE },
        });
    }

    async findAll(
        tenantId: string,
        page: number = 1,
        limit: number = 20,
        search?: string,
        status?: string,
        from?: string,
        to?: string,
    ) {
        await this.refreshOverdueFlags(tenantId);

        const skip = (page - 1) * limit;
        const cacheKey = this.cacheService.generateKey(
            tenantId,
            'credits',
            'list',
            `p${page}-l${limit}-s${search || 'all'}-st${status || 'all'}-f${from || 'all'}-t${to || 'all'}`,
        );
        const cached = await this.cacheService.get<any>(cacheKey);
        if (cached) return cached;

        const where: any = { tenantId };

        if (status && Object.values(CREDIT_STATUS).includes(status as CreditSaleStatus)) {
            where.status = status;
        }

        if (from || to) {
            where.createdAt = {};
            if (from) where.createdAt.gte = new Date(from);
            if (to) where.createdAt.lte = new Date(to);
        }

        if (search) {
            const invoiceNumber = parseInt(search, 10);
            const orConditions: any[] = [
                { customer: { name: { contains: search, mode: 'insensitive' } } },
                { customer: { docNumber: { contains: search, mode: 'insensitive' } } },
                { customer: { phone: { contains: search, mode: 'insensitive' } } },
            ];

            if (!Number.isNaN(invoiceNumber)) {
                orConditions.push({ invoice: { invoiceNumber } });
            }

            where.OR = orConditions;
        }

        const [data, total] = await Promise.all([
            (this.prisma as any).creditSale.findMany({
                where,
                include: {
                    customer: true,
                    invoice: {
                        select: {
                            id: true,
                            invoiceNumber: true,
                            total: true,
                            createdAt: true,
                            paymentMethod: true,
                            seller: {
                                select: { id: true, name: true },
                            },
                        },
                    },
                    payments: {
                        orderBy: { paidAt: 'desc' },
                        take: 5,
                        include: {
                            createdBy: {
                                select: { id: true, name: true },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            (this.prisma as any).creditSale.count({ where }),
        ]);

        const result = {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };

        await this.cacheService.set(cacheKey, result, 60);
        return result;
    }

    async findOne(tenantId: string, id: string) {
        await this.refreshOverdueFlags(tenantId);

        const cacheKey = this.cacheService.generateKey(tenantId, 'credits', 'detail', id);
        const cached = await this.cacheService.get<any>(cacheKey);
        if (cached) return cached;

        const creditSale = await (this.prisma as any).creditSale.findFirst({
            where: { id, tenantId },
            include: {
                customer: true,
                invoice: {
                    include: {
                        seller: {
                            select: { id: true, name: true },
                        },
                        warehouse: {
                            select: { id: true, name: true },
                        },
                        items: {
                            include: {
                                product: {
                                    select: { id: true, name: true },
                                },
                            },
                        },
                        comboLines: true,
                    },
                },
                payments: {
                    orderBy: { paidAt: 'desc' },
                    include: {
                        createdBy: {
                            select: { id: true, name: true },
                        },
                    },
                },
            },
        });

        if (!creditSale) {
            throw new NotFoundException('Credito no encontrado');
        }

        await this.cacheService.set(cacheKey, creditSale, 120);
        return creditSale;
    }

    async addPayment(tenantId: string, userId: string, id: string, dto: AddCreditPaymentDto) {
        const creditSale = await (this.prisma as any).creditSale.findFirst({
            where: { id, tenantId },
            include: {
                invoice: {
                    select: { invoiceNumber: true, customerId: true },
                },
                customer: {
                    select: { id: true, name: true },
                },
            },
        });

        if (!creditSale) {
            throw new NotFoundException('Credito no encontrado');
        }

        if (creditSale.status === CREDIT_STATUS.CANCELLED) {
            throw new BadRequestException('No puedes registrar pagos en un credito cancelado.');
        }

        const currentBalance = this.roundMoney(Number(creditSale.balance || 0));
        if (currentBalance <= 0 || creditSale.status === CREDIT_STATUS.PAID) {
            throw new BadRequestException('Este credito ya se encuentra pagado.');
        }

        const amount = this.roundMoney(Number(dto.amount || 0));
        if (amount <= 0) {
            throw new BadRequestException('El monto del abono debe ser mayor a cero.');
        }

        if (amount > currentBalance + 0.01) {
            throw new BadRequestException(`El abono excede el saldo pendiente ($${currentBalance.toFixed(2)}).`);
        }

        const paidAt = dto.paidAt ? new Date(dto.paidAt) : new Date();
        if (Number.isNaN(paidAt.getTime())) {
            throw new BadRequestException('La fecha del abono es invalida.');
        }

        const result = await this.prisma.$transaction(async (tx) => {
            const payment = await (tx as any).creditPayment.create({
                data: {
                    tenantId,
                    creditSaleId: id,
                    createdById: userId,
                    amount,
                    paymentMethod: dto.paymentMethod,
                    notes: dto.notes?.trim() || undefined,
                    paidAt,
                },
            });

            const newPaidAmount = this.roundMoney(Number(creditSale.paidAmount || 0) + amount);
            const totalAmount = this.roundMoney(Number(creditSale.totalAmount || 0));
            const newBalance = this.roundMoney(totalAmount - newPaidAmount);
            const nextDueDate = creditSale.nextDueDate ? new Date(creditSale.nextDueDate) : null;
            const nextStatus = this.resolveCreditSaleStatus({
                balance: newBalance,
                paidAmount: newPaidAmount,
                nextDueDate,
            });

            const updatedCredit = await (tx as any).creditSale.update({
                where: { id },
                data: {
                    paidAmount: newPaidAmount,
                    balance: newBalance,
                    status: nextStatus,
                    nextDueDate: nextStatus === CREDIT_STATUS.PAID ? null : nextDueDate,
                },
                include: {
                    customer: true,
                    invoice: {
                        select: {
                            id: true,
                            invoiceNumber: true,
                            createdAt: true,
                            sellerId: true,
                        },
                    },
                    payments: {
                        orderBy: { paidAt: 'desc' },
                        include: {
                            createdBy: {
                                select: { id: true, name: true },
                            },
                        },
                    },
                },
            });

            return { payment, updatedCredit };
        });

        await this.invalidateCreditsCache(tenantId, id);

        this.auditService.log({
            action: 'PAYMENT',
            entity: 'CreditSale',
            entityId: id,
            newValue: {
                invoiceNumber: creditSale.invoice?.invoiceNumber,
                customer: creditSale.customer?.name,
                amount,
                paymentMethod: dto.paymentMethod,
                newBalance: result.updatedCredit.balance,
                newStatus: result.updatedCredit.status,
            },
            userId,
            tenantId,
        });

        return result.updatedCredit;
    }
}

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Injectable()
export class InvoicesService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cacheService: CacheService,
    ) { }

    private async invalidateInvoicesCache(tenantId: string, invoiceId?: string) {
        const listKey = this.cacheService.generateKey(tenantId, 'invoices', 'list');
        await this.cacheService.invalidate(listKey);

        if (invoiceId) {
            const detailKey = this.cacheService.generateKey(tenantId, 'invoices', 'detail', invoiceId);
            await this.cacheService.invalidate(detailKey);
        }
    }

    async create(tenantId: string, sellerId: string, dto: CreateInvoiceDto) {
        const result = await this.prisma.$transaction(async (tx) => {
            // 1. Validate stock availability BEFORE creating invoice
            if (dto.status === 'PAID') {
                for (const item of dto.items) {
                    const stockRecord = await tx.stock.findUnique({
                        where: {
                            productId_warehouseId: {
                                productId: item.productId,
                                warehouseId: dto.warehouseId
                            }
                        },
                        include: {
                            product: {
                                select: { name: true }
                            }
                        }
                    });

                    if (!stockRecord) {
                        throw new BadRequestException(
                            `El producto con ID "${item.productId}" no tiene stock registrado en este almacén.`
                        );
                    }

                    if (stockRecord.quantity < item.quantity) {
                        throw new BadRequestException(
                            `Stock insuficiente para "${stockRecord.product.name}". Disponible: ${stockRecord.quantity}, Solicitado: ${item.quantity}`
                        );
                    }
                }
            }

            // 2. Create Invoice
            const invoice = await tx.invoice.create({
                data: {
                    total: dto.total,
                    status: dto.status,
                    paymentMethod: dto.paymentMethod,
                    tenantId,
                    sellerId,
                    customerId: dto.customerId,
                    items: {
                        create: dto.items.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice
                        }))
                    }
                },
                include: { items: true }
            });

            // 3. Decrement Stock if status is PAID
            if (dto.status === 'PAID') {
                for (const item of dto.items) {
                    await tx.stock.update({
                        where: {
                            productId_warehouseId: {
                                productId: item.productId,
                                warehouseId: dto.warehouseId
                            }
                        },
                        data: { quantity: { decrement: item.quantity } }
                    });
                }
            }

            return invoice;
        });

        await this.invalidateInvoicesCache(tenantId, result.id);

        return result;
    }

    async findAll(tenantId: string) {
        const cacheKey = this.cacheService.generateKey(tenantId, 'invoices', 'list');
        const cached = await this.cacheService.get<any[]>(cacheKey);
        if (cached) return cached;

        const result = await this.prisma.invoice.findMany({
            where: { tenantId },
            include: { customer: true, seller: true },
            orderBy: { createdAt: 'desc' }
        });

        await this.cacheService.set(cacheKey, result, 120);

        return result;
    }

    async findOne(tenantId: string, id: string) {
        const cacheKey = this.cacheService.generateKey(tenantId, 'invoices', 'detail', id);
        const cached = await this.cacheService.get<any>(cacheKey);
        if (cached) return cached;

        const invoice = await this.prisma.invoice.findFirst({
            where: { id, tenantId },
            include: { items: { include: { product: true } }, customer: true },
        });

        if (!invoice) throw new NotFoundException('Invoice not found');

        await this.cacheService.set(cacheKey, invoice, 300);

        return invoice;
    }

    async cancel(tenantId: string, id: string) {
        const exists = await this.prisma.invoice.findFirst({
            where: { id, tenantId },
            select: { id: true },
        });

        if (!exists) throw new NotFoundException('Invoice not found');

        const result = await this.prisma.invoice.update({
            where: { id },
            data: { status: 'CANCELLED' },
        });

        await this.invalidateInvoicesCache(tenantId, id);

        return result;
    }
}

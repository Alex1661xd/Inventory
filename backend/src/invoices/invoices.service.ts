import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Injectable()
export class InvoicesService {
    constructor(private readonly prisma: PrismaService) { }

    async create(tenantId: string, sellerId: string, dto: CreateInvoiceDto) {
        return this.prisma.$transaction(async (tx) => {
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
    }

    async findAll(tenantId: string) {
        return this.prisma.invoice.findMany({
            where: { tenantId },
            include: { customer: true, seller: true },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findOne(id: string) {
        return this.prisma.invoice.findUniqueOrThrow({
            where: { id },
            include: { items: { include: { product: true } }, customer: true }
        });
    }

    async cancel(tenantId: string, id: string) {
        return this.prisma.invoice.update({
            where: { id, tenantId },
            data: { status: 'CANCELLED' }
        });
    }
}

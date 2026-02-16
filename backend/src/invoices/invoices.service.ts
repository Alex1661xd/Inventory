import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StockMovementType } from '@prisma/client';
import { CacheService } from '../cache/cache.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { AuditService } from '../audit/audit.service';
import { SequenceService } from '../sequences/sequence.service';

@Injectable()
export class InvoicesService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cacheService: CacheService,
        private readonly auditService: AuditService,
        private readonly sequenceService: SequenceService,
    ) { }

    private async invalidateInvoicesCache(tenantId: string, invoiceId?: string, sellerId?: string) {
        // Invalidate all variants of paginated lists (all sellers, filters, etc)
        const listPattern = this.cacheService.generateKey(tenantId, 'invoices', 'list', '*');
        await this.cacheService.invalidatePattern(listPattern);

        if (invoiceId) {
            const detailKey = this.cacheService.generateKey(tenantId, 'invoices', 'detail', invoiceId);
            await this.cacheService.invalidate(detailKey);
        }

        // TAMBIÉN INVALIDAR ANALYTICS, PRODUCTOS E INVENTARIO
        await this.cacheService.invalidatePattern(this.cacheService.generateKey(tenantId, 'analytics', '*'));
        await this.cacheService.invalidatePattern(this.cacheService.generateKey(tenantId, 'expenses', '*'));
        await this.cacheService.invalidatePattern(this.cacheService.generateKey(tenantId, 'products', '*'));
        await this.cacheService.invalidatePattern(this.cacheService.generateKey(tenantId, 'inventory', '*'));

        // Fallback explícito para la lista de productos (importante para stock real-time)
        await this.cacheService.invalidate(this.cacheService.generateKey(tenantId, 'products', 'list'));
    }

    async create(tenantId: string, sellerId: string, dto: CreateInvoiceDto) {
        // ✅ VALIDACIÓN: Recalcular el total desde los ítems para prevenir fraude
        const calculatedSubtotal = dto.items.reduce(
            (sum, item) => sum + (item.quantity * item.unitPrice), 0
        );
        const calculatedTotal = calculatedSubtotal - (dto.discount || 0);

        if (Math.abs(calculatedTotal - dto.total) > 0.01) {
            throw new BadRequestException(
                `El total enviado ($${dto.total}) no coincide con el cálculo de los ítems ($${calculatedTotal.toFixed(2)}). Verifica los datos.`
            );
        }

        const result = await this.prisma.$transaction(async (tx) => {
            // 0. Calcular el siguiente número de factura POR TENANT (ATÓMICO)
            const nextInvoiceNumber = await this.sequenceService.nextVal(tenantId, 'invoice', tx);

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
                                select: { name: true, active: true }
                            }
                        }
                    });

                    if (!stockRecord || !stockRecord.product || !stockRecord.product.active) {
                        throw new BadRequestException(
                            `El producto con ID "${item.productId}" no existe o está desactivado.`
                        );
                    }

                    if (stockRecord.quantity < item.quantity) {
                        throw new BadRequestException(
                            `Stock insuficiente para "${stockRecord.product.name}". Disponible: ${stockRecord.quantity}, Solicitado: ${item.quantity}`
                        );
                    }
                }
            }

            // 2. Create Invoice — ✅ ahora guarda warehouseId
            const invoice = await tx.invoice.create({
                data: {
                    invoiceNumber: nextInvoiceNumber,
                    total: calculatedTotal,
                    status: dto.status,
                    paymentMethod: dto.paymentMethod,
                    tenantId,
                    sellerId,
                    customerId: dto.customerId,
                    warehouseId: dto.warehouseId, // ✅ Persistir para reversión al cancelar
                    amountReceived: dto.amountReceived,
                    amountReturned: dto.amountReturned,
                    discount: dto.discount || 0,
                    items: {
                        create: dto.items.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice
                        }))
                    }
                },
                include: { items: true }
            } as any);

            // 3. Decrement Stock (FIFO Logic) + Kardex
            if (dto.status === 'PAID') {
                for (const invoiceItem of (invoice as any).items) {
                    let pendingToSubtract = invoiceItem.quantity;
                    let calculatedTotalCost = 0;

                    // A. Buscar lotes disponibles ordenados por fecha (FIFO)
                    const batches = await tx.stockBatch.findMany({
                        where: {
                            productId: invoiceItem.productId,
                            warehouseId: dto.warehouseId,
                            remainingQuantity: { gt: 0 }
                        },
                        orderBy: { entryDate: 'asc' }
                    });

                    // B. Consumir lotes
                    for (const batch of batches) {
                        if (pendingToSubtract <= 0) break;

                        const qtyToTake = Math.min(batch.remainingQuantity, pendingToSubtract);

                        await tx.stockBatch.update({
                            where: { id: batch.id },
                            data: { remainingQuantity: { decrement: qtyToTake } }
                        });

                        calculatedTotalCost += qtyToTake * Number(batch.costPrice);
                        pendingToSubtract -= qtyToTake;
                    }

                    // C. Si aún queda pendiente, hubo un error de sincronización
                    if (pendingToSubtract > 0) {
                        throw new BadRequestException(`Error interno de FIFO: Stock insuficiente en lotes para ${invoiceItem.productId}`);
                    }

                    // D. Actualizar el costo real en el ítem de la factura
                    await tx.invoiceItem.update({
                        where: { id: invoiceItem.id },
                        data: { totalCost: calculatedTotalCost }
                    });

                    // E. Actualizar el saldo global (Stock table)
                    const updatedStock = await tx.stock.update({
                        where: {
                            productId_warehouseId: {
                                productId: invoiceItem.productId,
                                warehouseId: dto.warehouseId
                            }
                        },
                        data: { quantity: { decrement: invoiceItem.quantity } }
                    });

                    // F. Registro en Kardex (SALE)
                    await tx.stockMovement.create({
                        data: {
                            productId: invoiceItem.productId,
                            warehouseId: dto.warehouseId,
                            type: StockMovementType.SALE,
                            quantity: -invoiceItem.quantity,
                            balanceAfter: updatedStock.quantity,
                            reference: `Invoice #${invoice.invoiceNumber}`,
                            notes: `Venta #${invoice.invoiceNumber} (Consumido FIFO)`,
                            userId: sellerId,
                        }
                    });
                }
            }

            return invoice;
        });

        await this.invalidateInvoicesCache(tenantId, result.id, sellerId);

        // Audit log
        this.auditService.log({
            action: 'CREATE',
            entity: 'Invoice',
            entityId: result.id,
            newValue: { invoiceNumber: result.invoiceNumber, total: dto.total, items: dto.items.length },
            userId: sellerId,
            tenantId,
        });

        return result;
    }

    async findAll(tenantId: string, page: number = 1, limit: number = 20, sellerId?: string, search?: string, from?: string, to?: string, status?: string) {
        const skip = (page - 1) * limit;
        const cacheKey = this.cacheService.generateKey(
            tenantId,
            'invoices',
            'list',
            `${sellerId || 'all'}-p${page}-l${limit}-s${search || 'all'}-f${from || 'all'}-t${to || 'all'}-st${status || 'all'}`
        );

        const cached = await this.cacheService.get<any>(cacheKey);
        if (cached) return cached;

        const where: any = {
            tenantId,
            ...(sellerId && { sellerId }),
            ...(status && { status })
        };

        if (from || to) {
            where.createdAt = {};
            if (from) where.createdAt.gte = new Date(from);
            if (to) where.createdAt.lte = new Date(to);
        }

        if (search) {
            const searchInt = parseInt(search);
            const searchConditions: any[] = [
                { customer: { name: { contains: search, mode: 'insensitive' } } }
            ];

            if (!isNaN(searchInt)) {
                searchConditions.push({ invoiceNumber: searchInt });
            }

            where.OR = searchConditions;
        }

        const [data, total] = await Promise.all([
            this.prisma.invoice.findMany({
                where,
                include: {
                    customer: true,
                    seller: true,
                    items: {
                        include: {
                            product: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.invoice.count({ where })
        ]);

        const result = {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };

        await this.cacheService.set(cacheKey, result, 60);

        return result;
    }

    async findOne(tenantId: string, id: string, sellerId?: string) {
        const cacheKey = this.cacheService.generateKey(tenantId, 'invoices', 'detail', id);
        const cached = await this.cacheService.get<any>(cacheKey);

        if (cached && (!sellerId || cached.sellerId === sellerId)) return cached;

        const invoice = await this.prisma.invoice.findFirst({
            where: {
                id,
                tenantId,
                ...(sellerId && { sellerId })
            },
            include: { items: { include: { product: true } }, customer: true, seller: true },
        });

        if (!invoice) throw new NotFoundException('Invoice not found');

        await this.cacheService.set(cacheKey, invoice, 300);

        return invoice;
    }

    // ✅ CANCEL ahora REVIERTE el stock y los lotes FIFO
    async cancel(tenantId: string, id: string, sellerId?: string) {
        const invoice = await this.prisma.invoice.findFirst({
            where: {
                id,
                tenantId,
                ...(sellerId && { sellerId })
            },
            include: {
                items: {
                    include: {
                        product: { select: { id: true, name: true, costPrice: true } }
                    }
                }
            },
        });

        if (!invoice) throw new NotFoundException('Invoice not found');

        if (invoice.status === 'CANCELLED') {
            throw new BadRequestException('Esta factura ya fue cancelada');
        }

        const result = await this.prisma.$transaction(async (tx) => {
            // Solo revertir stock si la factura fue PAGADA (se descontó stock)
            if (invoice.status === 'PAID' && (invoice as any).warehouseId) {
                const warehouseId = (invoice as any).warehouseId;

                for (const item of invoice.items) {
                    // A. Incrementar el Stock global
                    const updatedStock = await tx.stock.upsert({
                        where: {
                            productId_warehouseId: {
                                productId: item.productId,
                                warehouseId,
                            }
                        },
                        update: { quantity: { increment: item.quantity } },
                        create: {
                            productId: item.productId,
                            warehouseId,
                            quantity: item.quantity,
                        }
                    });

                    // B. Re-crear un lote FIFO con el costo de la venta original
                    const costPrice = item.totalCost
                        ? Number(item.totalCost) / item.quantity
                        : Number(item.product.costPrice);

                    await tx.stockBatch.create({
                        data: {
                            tenantId,
                            productId: item.productId,
                            warehouseId,
                            initialQuantity: item.quantity,
                            remainingQuantity: item.quantity,
                            costPrice,
                            entryDate: new Date(),
                        }
                    });

                    // C. Registrar movimiento RETURN en Kardex
                    await tx.stockMovement.create({
                        data: {
                            productId: item.productId,
                            warehouseId,
                            type: StockMovementType.RETURN,
                            quantity: item.quantity,
                            balanceAfter: updatedStock.quantity,
                            reference: `Cancelación Factura #${invoice.invoiceNumber}`,
                            notes: `Devolución por cancelación de venta #${invoice.invoiceNumber}`,
                            userId: sellerId || invoice.sellerId,
                        }
                    });
                }
            }

            // D. Marcar factura como cancelada
            return tx.invoice.update({
                where: { id },
                data: { status: 'CANCELLED' },
            });
        });

        // Invalidate all related caches
        await this.invalidateInvoicesCache(tenantId, id, invoice.sellerId);

        // Audit log
        this.auditService.log({
            action: 'CANCEL',
            entity: 'Invoice',
            entityId: id,
            oldValue: { invoiceNumber: invoice.invoiceNumber, status: invoice.status },
            userId: sellerId,
            tenantId,
        });

        return result;
    }
}

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { StockMovementType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { AuditService } from '../audit/audit.service';
import { SequenceService } from '../sequences/sequence.service';

type CreditSaleStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED';
const CREDIT_STATUS = {
    PENDING: 'PENDING' as CreditSaleStatus,
    PARTIAL: 'PARTIAL' as CreditSaleStatus,
    PAID: 'PAID' as CreditSaleStatus,
    OVERDUE: 'OVERDUE' as CreditSaleStatus,
    CANCELLED: 'CANCELLED' as CreditSaleStatus,
};

@Injectable()
export class InvoicesService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cacheService: CacheService,
        private readonly auditService: AuditService,
        private readonly sequenceService: SequenceService,
    ) { }

    private async invalidateInvoicesCache(tenantId: string, invoiceId?: string, sellerId?: string) {
        const listPattern = this.cacheService.generateKey(tenantId, 'invoices', 'list', '*');
        await this.cacheService.invalidatePattern(listPattern);

        if (invoiceId) {
            const detailKey = this.cacheService.generateKey(tenantId, 'invoices', 'detail', invoiceId);
            await this.cacheService.invalidate(detailKey);
        }

        await this.cacheService.invalidatePattern(this.cacheService.generateKey(tenantId, 'analytics', '*'));
        await this.cacheService.invalidatePattern(this.cacheService.generateKey(tenantId, 'expenses', '*'));
        await this.cacheService.invalidatePattern(this.cacheService.generateKey(tenantId, 'products', '*'));
        await this.cacheService.invalidatePattern(this.cacheService.generateKey(tenantId, 'inventory', '*'));
        await this.cacheService.invalidatePattern(this.cacheService.generateKey(tenantId, 'credits', '*'));
        await this.cacheService.invalidatePattern(this.cacheService.generateKey(tenantId, 'cash-flow', '*'));

        await this.cacheService.invalidate(this.cacheService.generateKey(tenantId, 'products', 'list'));
    }

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

    private computeComboPricing(pricingType: string, fixedPrice: number, discountPercent: number, baseUnitPrice: number) {
        const base = Math.max(0, Number(baseUnitPrice || 0));
        let final = base;

        if (pricingType === 'FIXED') {
            final = Math.max(0, Number(fixedPrice || 0));
        } else {
            const pct = Math.max(0, Math.min(100, Number(discountPercent || 0)));
            final = base * (1 - pct / 100);
        }

        return {
            baseUnitPrice: this.roundMoney(base),
            finalUnitPrice: this.roundMoney(final),
            discountPerUnit: this.roundMoney(base - final),
        };
    }

    async create(tenantId: string, sellerId: string, dto: CreateInvoiceDto) {
        const isCreditSale = !!dto.isCreditSale;

        const seller = await this.prisma.user.findFirst({
            where: { id: sellerId, tenantId },
            select: { id: true, role: true, warehouseId: true },
        });

        if (!seller) throw new NotFoundException('Vendedor no encontrado');

        if (seller.role === 'SELLER' && !seller.warehouseId) {
            throw new BadRequestException('No tienes una sede asignada para vender.');
        }

        if (seller.role === 'SELLER' && seller.warehouseId !== dto.warehouseId) {
            throw new BadRequestException('No puedes vender fuera de tu sede asignada.');
        }

        let selectedCustomer: { id: string; name: string; isBanned: boolean; banReason: string | null } | null = null;
        if (dto.customerId) {
            selectedCustomer = await (this.prisma as any).customer.findFirst({
                where: {
                    id: dto.customerId,
                    tenantId,
                },
                select: {
                    id: true,
                    name: true,
                    isBanned: true,
                    banReason: true,
                }
            });

            if (!selectedCustomer) {
                throw new BadRequestException('El cliente seleccionado no existe en este negocio.');
            }

            if (selectedCustomer.isBanned) {
                const reason = selectedCustomer.banReason?.trim();
                const reasonSuffix = reason ? ` Motivo: ${reason}` : '';
                throw new BadRequestException(
                    `No se puede vender al cliente "${selectedCustomer.name}" porque está vetado.${reasonSuffix}`
                );
            }
        }

        if (isCreditSale && !selectedCustomer) {
            throw new BadRequestException('Las ventas a credito requieren un cliente seleccionado.');
        }

        const normalizedDirectItems = (dto.items || [])
            .map((item) => ({
                productId: item.productId,
                quantity: Math.floor(Number(item.quantity || 0)),
                unitPrice: Number(item.unitPrice || 0),
            }))
            .filter(item => item.quantity > 0);

        if (normalizedDirectItems.some(item => !item.productId || item.unitPrice < 0)) {
            throw new BadRequestException('Hay productos directos invalidos en la venta.');
        }

        const comboLineMap = new Map<string, number>();
        for (const comboLine of (dto.comboLines || [])) {
            const comboId = comboLine?.comboId;
            const quantity = Math.floor(Number(comboLine?.quantity || 0));
            if (!comboId || quantity <= 0) continue;
            comboLineMap.set(comboId, (comboLineMap.get(comboId) || 0) + quantity);
        }

        const comboIds = Array.from(comboLineMap.keys());
        const comboSnapshots: Array<{
            comboId: string;
            comboName: string;
            quantity: number;
            baseUnitPrice: number;
            finalUnitPrice: number;
            discountPerUnit: number;
        }> = [];

        const expandedComboItems: Array<{
            productId: string;
            quantity: number;
            unitPrice: number;
            comboId: string;
            comboName: string;
        }> = [];

        if (isCreditSale && comboIds.length > 0) {
            throw new BadRequestException('Las ventas a credito no permiten combos por ahora.');
        }

        if (comboIds.length > 0) {
            const combos = await (this.prisma as any).combo.findMany({
                where: {
                    tenantId,
                    id: { in: comboIds },
                    isActive: true,
                },
                include: {
                    items: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    salePrice: true,
                                    active: true,
                                    isSellable: true,
                                }
                            }
                        }
                    }
                }
            });

            if (combos.length !== comboIds.length) {
                throw new BadRequestException('Uno o mas combos no existen o estan desactivados.');
            }

            const comboById = new Map(combos.map(combo => [combo.id, combo]));

            for (const [comboId, comboQty] of comboLineMap.entries()) {
                const combo: any = comboById.get(comboId);
                if (!combo) throw new BadRequestException(`Combo invalido: ${comboId}`);
                if (!combo.items?.length) throw new BadRequestException(`El combo "${combo.name}" no tiene productos.`);

                for (const comboItem of combo.items) {
                    if (!comboItem.product?.active || !comboItem.product?.isSellable) {
                        throw new BadRequestException(
                            `El combo "${combo.name}" contiene productos inactivos o no vendibles.`
                        );
                    }
                }

                const baseUnitPrice = combo.items.reduce((sum: number, item: any) => {
                    return sum + (Number(item.quantity) * Number(item.product.salePrice));
                }, 0);

                const pricing = this.computeComboPricing(
                    String(combo.pricingType),
                    Number(combo.fixedPrice || 0),
                    Number(combo.discountPercent || 0),
                    baseUnitPrice,
                );

                if (!(pricing.finalUnitPrice > 0)) {
                    throw new BadRequestException(`El precio final del combo "${combo.name}" es invalido.`);
                }

                comboSnapshots.push({
                    comboId: combo.id,
                    comboName: combo.name,
                    quantity: comboQty,
                    baseUnitPrice: pricing.baseUnitPrice,
                    finalUnitPrice: pricing.finalUnitPrice,
                    discountPerUnit: pricing.discountPerUnit,
                });

                const comboTotalRevenue = pricing.finalUnitPrice * comboQty;
                const componentBases = combo.items.map((item: any) => ({
                    productId: item.productId,
                    productQtyPerCombo: Number(item.quantity),
                    baseRevenuePerCombo: Number(item.quantity) * Number(item.product.salePrice),
                }));

                let assignedRevenue = 0;
                componentBases.forEach((component, index) => {
                    const expandedQty = component.productQtyPerCombo * comboQty;
                    if (expandedQty <= 0) return;

                    let componentRevenue = 0;
                    if (index === componentBases.length - 1) {
                        componentRevenue = comboTotalRevenue - assignedRevenue;
                    } else {
                        const ratio = baseUnitPrice > 0 ? (component.baseRevenuePerCombo / baseUnitPrice) : 0;
                        componentRevenue = comboTotalRevenue * ratio;
                        assignedRevenue += componentRevenue;
                    }

                    expandedComboItems.push({
                        productId: component.productId,
                        quantity: expandedQty,
                        unitPrice: componentRevenue / expandedQty,
                        comboId: combo.id,
                        comboName: combo.name,
                    });
                });
            }
        }

        const expandedItems = [
            ...normalizedDirectItems.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                comboId: null as string | null,
                comboName: null as string | null,
            })),
            ...expandedComboItems.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                comboId: item.comboId,
                comboName: item.comboName,
            })),
        ];

        if (expandedItems.length === 0) {
            throw new BadRequestException('La venta no tiene productos validos para procesar.');
        }

        const allProductIds = Array.from(new Set(expandedItems.map(item => item.productId)));
        const productRecords: Array<{
            id: string;
            name: string;
            active: boolean;
            isSellable: boolean;
            allowCreditSale: boolean;
        }> = await (this.prisma as any).product.findMany({
            where: { tenantId, id: { in: allProductIds } },
            select: { id: true, name: true, active: true, isSellable: true, allowCreditSale: true },
        });
        const productMap = new Map<string, (typeof productRecords)[number]>(productRecords.map(p => [p.id, p]));

        for (const item of expandedItems) {
            const product: any = productMap.get(item.productId);
            if (!product || !product.active || !product.isSellable) {
                throw new BadRequestException(
                    `El producto con ID "${item.productId}" no existe, esta desactivado o no esta habilitado para venta.`
                );
            }

            if (isCreditSale && !product.allowCreditSale) {
                throw new BadRequestException(`El producto "${product.name}" no esta habilitado para venta a credito.`);
            }
        }

        const discount = Number(dto.discount || 0);
        if (discount < 0) throw new BadRequestException('El descuento no puede ser negativo.');

        const calculatedSubtotal = expandedItems.reduce((sum, item) => sum + (item.quantity * Number(item.unitPrice)), 0);
        const calculatedTotal = calculatedSubtotal - discount;

        if (Math.abs(this.roundMoney(calculatedTotal) - this.roundMoney(Number(dto.total))) > 0.05) {
            throw new BadRequestException(
                `El total enviado ($${dto.total}) no coincide con el calculo de la venta ($${this.roundMoney(calculatedTotal).toFixed(2)}). Verifica descuentos y combos.`
            );
        }

        const stockNeededMap = new Map<string, number>();
        for (const item of expandedItems) {
            stockNeededMap.set(item.productId, (stockNeededMap.get(item.productId) || 0) + item.quantity);
        }

        const invoiceStatus = dto.status || 'PAID';
        if (isCreditSale && invoiceStatus !== 'PAID') {
            throw new BadRequestException('Una venta a credito no puede guardarse como pendiente.');
        }

        let creditTerms: {
            totalAmount: number;
            downPayment: number;
            paidAmount: number;
            balance: number;
            installmentsCount: number;
            installmentAmount: number;
            nextDueDate: Date | null;
            status: CreditSaleStatus;
            notes?: string;
        } | null = null;

        if (isCreditSale) {
            if (!dto.credit) {
                throw new BadRequestException('Debes enviar las condiciones del credito.');
            }

            const downPayment = this.roundMoney(Number(dto.credit.downPayment || 0));
            const installmentsCount = Math.floor(Number(dto.credit.installmentsCount || 0));
            const nextDueDate = dto.credit.firstDueDate ? new Date(dto.credit.firstDueDate) : null;

            if (downPayment < 0) {
                throw new BadRequestException('La cuota inicial no puede ser negativa.');
            }

            if (downPayment > this.roundMoney(calculatedTotal) + 0.01) {
                throw new BadRequestException('La cuota inicial no puede ser mayor al total de la venta.');
            }

            if (!Number.isFinite(installmentsCount) || installmentsCount < 1) {
                throw new BadRequestException('La cantidad de cuotas debe ser mayor o igual a 1.');
            }

            if (nextDueDate && Number.isNaN(nextDueDate.getTime())) {
                throw new BadRequestException('La fecha de primera cuota es invalida.');
            }

            const balance = this.roundMoney(calculatedTotal - downPayment);
            if (balance <= 0) {
                throw new BadRequestException('Para crear un credito debe existir saldo pendiente.');
            }

            const requestedInstallment = this.roundMoney(Number(dto.credit.installmentAmount || 0));
            const installmentAmount = requestedInstallment > 0
                ? requestedInstallment
                : this.roundMoney(balance / installmentsCount);

            if (installmentAmount <= 0) {
                throw new BadRequestException('El valor de la cuota debe ser mayor que cero.');
            }

            creditTerms = {
                totalAmount: this.roundMoney(calculatedTotal),
                downPayment,
                paidAmount: downPayment,
                balance,
                installmentsCount,
                installmentAmount,
                nextDueDate,
                status: this.resolveCreditSaleStatus({
                    balance,
                    paidAmount: downPayment,
                    nextDueDate,
                }),
                notes: dto.credit.notes?.trim() || undefined,
            };
        }

        const result = await this.prisma.$transaction(async (tx) => {
            const nextInvoiceNumber = await this.sequenceService.nextVal(tenantId, 'invoice', tx);
            const stockAfterByProduct = new Map<string, number>();

            if (invoiceStatus === 'PAID') {
                const orderedStockNeeds = Array.from(stockNeededMap.entries())
                    .sort((a, b) => a[0].localeCompare(b[0]));

                for (const [productId, requiredQty] of orderedStockNeeds) {
                    // Atomic guard: only one concurrent transaction can reserve available stock.
                    const updatedRows: any[] = await (tx as any).$queryRawUnsafe(
                        `UPDATE "Stock"
                         SET "quantity" = "quantity" - $1
                         WHERE "productId" = $2
                           AND "warehouseId" = $3
                           AND "quantity" >= $1
                         RETURNING "quantity"`,
                        requiredQty,
                        productId,
                        dto.warehouseId
                    );

                    if (!updatedRows || updatedRows.length === 0) {
                        const currentStock: any = await tx.stock.findUnique({
                            where: {
                                productId_warehouseId: {
                                    productId,
                                    warehouseId: dto.warehouseId,
                                }
                            }
                        });

                        const availableQty = Number(currentStock?.quantity || 0);
                        const productName = productMap.get(productId)?.name || productId;

                        throw new BadRequestException(
                            `Stock insuficiente para "${productName}". Disponible: ${availableQty}, Solicitado: ${requiredQty}`
                        );
                    }

                    stockAfterByProduct.set(productId, Number(updatedRows[0].quantity || 0));
                }
            }

            const invoice = await tx.invoice.create({
                data: {
                    invoiceNumber: nextInvoiceNumber,
                    total: this.roundMoney(calculatedTotal),
                    status: invoiceStatus as any,
                    paymentMethod: dto.paymentMethod,
                    isCreditSale,
                    tenantId,
                    sellerId,
                    customerId: selectedCustomer?.id,
                    warehouseId: dto.warehouseId,
                    amountReceived: dto.amountReceived,
                    amountReturned: dto.amountReturned,
                    discount,
                    items: {
                        create: expandedItems.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            comboId: item.comboId,
                            comboName: item.comboName,
                        }))
                    }
                },
                include: { items: true }
            } as any);

            if (comboSnapshots.length > 0) {
                await (tx as any).invoiceCombo.createMany({
                    data: comboSnapshots.map(comboLine => ({
                        invoiceId: invoice.id,
                        comboId: comboLine.comboId,
                        comboName: comboLine.comboName,
                        quantity: comboLine.quantity,
                        baseUnitPrice: comboLine.baseUnitPrice,
                        finalUnitPrice: comboLine.finalUnitPrice,
                        discountPerUnit: comboLine.discountPerUnit,
                        tenantId,
                    }))
                });
            }

            if (isCreditSale && creditTerms && selectedCustomer) {
                const createdCreditSale = await (tx as any).creditSale.create({
                    data: {
                        tenantId,
                        invoiceId: invoice.id,
                        customerId: selectedCustomer.id,
                        totalAmount: creditTerms.totalAmount,
                        downPayment: creditTerms.downPayment,
                        paidAmount: creditTerms.paidAmount,
                        balance: creditTerms.balance,
                        installmentsCount: creditTerms.installmentsCount,
                        installmentAmount: creditTerms.installmentAmount,
                        nextDueDate: creditTerms.nextDueDate,
                        status: creditTerms.status,
                        notes: creditTerms.notes,
                    },
                });

                if (creditTerms.downPayment > 0) {
                    await (tx as any).creditPayment.create({
                        data: {
                            tenantId,
                            creditSaleId: createdCreditSale.id,
                            createdById: sellerId,
                            amount: creditTerms.downPayment,
                            paymentMethod: dto.paymentMethod,
                            notes: 'Abono inicial de venta a credito',
                            paidAt: invoice.createdAt,
                        },
                    });
                }
            }

            if (invoiceStatus === 'PAID') {
                const runningStockByProduct = new Map<string, number>();
                for (const [productId, requiredQty] of stockNeededMap.entries()) {
                    const stockAfter = Number(stockAfterByProduct.get(productId) || 0);
                    runningStockByProduct.set(productId, stockAfter + requiredQty);
                }

                for (const invoiceItem of (invoice as any).items) {
                    let pendingToSubtract = Number(invoiceItem.quantity || 0);
                    let calculatedTotalCost = 0;

                    const batches: any[] = await (tx as any).$queryRawUnsafe(
                        // Lock FIFO rows to avoid concurrent consumption races between sellers.
                        `SELECT "id", "remainingQuantity", "costPrice"
                         FROM "StockBatch"
                         WHERE "productId" = $1
                           AND "warehouseId" = $2
                           AND "remainingQuantity" > 0
                         ORDER BY "entryDate" ASC, "id" ASC
                         FOR UPDATE`,
                        invoiceItem.productId,
                        dto.warehouseId
                    );

                    for (const batch of batches) {
                        if (pendingToSubtract <= 0) break;

                        const qtyToTake = Math.min(Number(batch.remainingQuantity || 0), pendingToSubtract);

                        await tx.stockBatch.update({
                            where: { id: batch.id },
                            data: { remainingQuantity: { decrement: qtyToTake } }
                        });

                        calculatedTotalCost += qtyToTake * Number(batch.costPrice);
                        pendingToSubtract -= qtyToTake;
                    }

                    if (pendingToSubtract > 0) {
                        throw new BadRequestException(`Error interno de FIFO: Stock insuficiente en lotes para ${invoiceItem.productId}`);
                    }

                    await tx.invoiceItem.update({
                        where: { id: invoiceItem.id },
                        data: { totalCost: calculatedTotalCost }
                    });

                    const currentBalance = Number(runningStockByProduct.get(invoiceItem.productId) || 0);
                    const nextBalance = currentBalance - Number(invoiceItem.quantity || 0);
                    runningStockByProduct.set(invoiceItem.productId, nextBalance);

                    await tx.stockMovement.create({
                        data: {
                            productId: invoiceItem.productId,
                            warehouseId: dto.warehouseId,
                            type: StockMovementType.SALE,
                            quantity: -invoiceItem.quantity,
                            balanceAfter: nextBalance,
                            reference: `Invoice #${invoice.invoiceNumber}`,
                            notes: invoiceItem.comboName
                                ? `Venta #${invoice.invoiceNumber} (Consumido FIFO) - Combo: ${invoiceItem.comboName}`
                                : `Venta #${invoice.invoiceNumber} (Consumido FIFO)`,
                            userId: sellerId,
                        }
                    });
                }
            }

            return invoice;
        });

        await this.invalidateInvoicesCache(tenantId, result.id, sellerId);

        this.auditService.log({
            action: 'CREATE',
            entity: 'Invoice',
            entityId: result.id,
            newValue: {
                invoiceNumber: result.invoiceNumber,
                total: dto.total,
                directItems: normalizedDirectItems.length,
                comboLines: comboSnapshots.length,
                isCreditSale,
                downPayment: creditTerms?.downPayment || 0,
            },
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
            (this.prisma.invoice as any).findMany({
                where,
                include: {
                    customer: true,
                    seller: true,
                    warehouse: true,
                    creditSale: {
                        select: {
                            id: true,
                            status: true,
                            balance: true,
                            paidAmount: true,
                            installmentsCount: true,
                            nextDueDate: true,
                        }
                    },
                    comboLines: true,
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

        const invoice = await (this.prisma.invoice as any).findFirst({
            where: {
                id,
                tenantId,
                ...(sellerId && { sellerId })
            },
            include: {
                items: { include: { product: true } },
                comboLines: true,
                warehouse: true,
                customer: true,
                seller: true,
                creditSale: {
                    include: {
                        payments: {
                            orderBy: { paidAt: 'desc' },
                            include: {
                                createdBy: {
                                    select: { id: true, name: true }
                                }
                            }
                        }
                    }
                },
            },
        });

        if (!invoice) throw new NotFoundException('Invoice not found');

        await this.cacheService.set(cacheKey, invoice, 300);

        return invoice;
    }

    async cancel(tenantId: string, id: string, sellerId?: string) {
        const invoice = await (this.prisma.invoice as any).findFirst({
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
            if (invoice.status === 'PAID' && (invoice as any).warehouseId) {
                const warehouseId = (invoice as any).warehouseId;

                for (const item of invoice.items) {
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

                    await tx.stockMovement.create({
                        data: {
                            productId: item.productId,
                            warehouseId,
                            type: StockMovementType.RETURN,
                            quantity: item.quantity,
                            balanceAfter: updatedStock.quantity,
                            reference: `Cancelacion Factura #${invoice.invoiceNumber}`,
                            notes: `Devolucion por cancelacion de venta #${invoice.invoiceNumber}`,
                            userId: sellerId || invoice.sellerId,
                        }
                    });
                }
            }

            if ((invoice as any).isCreditSale) {
                await (tx as any).creditSale.updateMany({
                    where: { tenantId, invoiceId: id },
                    data: { status: CREDIT_STATUS.CANCELLED },
                });
            }

            return tx.invoice.update({
                where: { id },
                data: { status: 'CANCELLED' },
            });
        });

        await this.invalidateInvoicesCache(tenantId, id, invoice.sellerId);

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

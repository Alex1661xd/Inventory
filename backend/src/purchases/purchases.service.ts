import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { CacheService } from '../cache/cache.service';
import { StockMovementType, ExpenseCategory } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { SequenceService } from '../sequences/sequence.service';

@Injectable()
export class PurchasesService {
    constructor(
        private prisma: PrismaService,
        private cacheService: CacheService,
        private auditService: AuditService,
        private sequenceService: SequenceService,
    ) { }

    async create(tenantId: string, userId: string, dto: CreatePurchaseDto) {
        // Calcular total de la compra y validar productos activos
        const subtotal = dto.items.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);
        const additionalCosts = dto.additionalCosts || 0;
        const total = subtotal + additionalCosts;
        const isPaid = dto.isPaid ?? true;

        // Validar que los productos existan y estén activos
        const productIds = dto.items.map(item => item.productId);
        const activeProducts = await this.prisma.product.count({
            where: {
                id: { in: productIds },
                tenantId,
                active: true
            }
        });

        if (activeProducts !== productIds.length) {
            throw new BadRequestException('Uno o más productos no existen o están inactivos');
        }

        const purchaseResult = await this.prisma.$transaction(async (tx) => {
            // 0. Calcular el siguiente número de compra POR TENANT (ATÓMICO)
            const nextPurchaseNumber = await this.sequenceService.nextVal(tenantId, 'purchase', tx);

            // 1. Crear la Compra
            const purchase = await tx.purchase.create({
                data: {
                    purchaseNumber: nextPurchaseNumber,
                    tenantId,
                    supplierId: dto.supplierId,
                    buyerId: userId,
                    warehouseId: dto.warehouseId,
                    subtotal,
                    additionalCosts,
                    total,
                    amountPaid: isPaid ? total : 0,
                    isPaid,
                    notes: dto.notes,
                    date: dto.date ? new Date(dto.date) : new Date(),
                    items: {
                        create: dto.items.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            costPrice: item.costPrice,
                        }))
                    }
                } as any,
                include: {
                    items: true,
                    supplier: true,
                    buyer: { select: { name: true } }
                }
            });

            // Si es de contado, registrar el pago inicial
            if (isPaid) {
                await tx.purchasePayment.create({
                    data: {
                        tenantId,
                        purchaseId: purchase.id,
                        amount: total,
                        createdById: userId,
                        notes: 'Pago inicial (Contado)',
                        date: purchase.date
                    }
                });
            }

            // 2. Procesar cada producto
            for (const item of purchase.items) {
                // A. Actualizar precio de costo referencial del producto (Último costo)
                await tx.product.update({
                    // @ts-ignore
                    where: { id: item.productId, tenantId },
                    data: { costPrice: item.costPrice }
                });

                // B. Actualizar Stock Global + Crear Lote (StockBatch) para FIFO
                if (purchase.warehouseId) {
                    const stock = await tx.stock.upsert({
                        where: {
                            productId_warehouseId: {
                                productId: item.productId,
                                warehouseId: purchase.warehouseId
                            }
                        },
                        update: {
                            quantity: { increment: item.quantity }
                        },
                        create: {
                            productId: item.productId,
                            warehouseId: purchase.warehouseId,
                            quantity: item.quantity
                        }
                    });

                    await tx.stockBatch.create({
                        data: {
                            tenantId,
                            productId: item.productId,
                            warehouseId: purchase.warehouseId,
                            purchaseItemId: item.id,
                            initialQuantity: item.quantity,
                            remainingQuantity: item.quantity,
                            costPrice: item.costPrice,
                            entryDate: (() => {
                                const now = new Date();
                                const pDate = new Date(purchase.date);
                                if (pDate.toISOString().split('T')[0] === now.toISOString().split('T')[0]) {
                                    return now;
                                }
                                pDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
                                return pDate;
                            })()
                        }
                    });

                    await tx.stockMovement.create({
                        data: {
                            productId: item.productId,
                            warehouseId: purchase.warehouseId,
                            quantity: item.quantity,
                            balanceAfter: stock.quantity,
                            type: StockMovementType.PURCHASE,
                            reference: `COMPRA #${purchase.purchaseNumber}`,
                            userId,
                            notes: `Compra a ${purchase.supplier.name} (Lote FIFO creado)`
                        }
                    });
                }
            }

            // 3. Crear Gasto Automático (SOLO SI ES DE CONTADO)
            if (isPaid) {
                let description = `Reabastecimiento de inventario - Compra #${purchase.purchaseNumber}`;
                if (additionalCosts > 0) {
                    description += ` (Costo Base: ${subtotal} + Gastos Adicionales/Flete: ${additionalCosts})`;
                }

                await tx.expense.create({
                    data: {
                        tenantId,
                        amount: total,
                        description,
                        category: ExpenseCategory.INVENTORY,
                        supplierId: dto.supplierId,
                        createdById: userId,
                        date: purchase.date
                    }
                });
            }

            return purchase;
        });

        // ==================== CACHE INVALIDATION (OUTSIDE TRANSACTION) ====================
        // Lo hacemos fuera para asegurar que el registro ya existe en DB y para no bloquear la Tx
        try {
            console.log(`🧹 [PurchasesService] Invalidando caché para tenant: ${tenantId}`);

            // Invalidar analytics, gastos e inventario
            await Promise.all([
                this.cacheService.invalidatePattern(this.cacheService.generateKey(tenantId, 'analytics', '*')),
                this.cacheService.invalidatePattern(this.cacheService.generateKey(tenantId, 'expenses', '*')),
                this.cacheService.invalidatePattern(this.cacheService.generateKey(tenantId, 'inventory', '*'))
            ]);

            // Invalidar todo lo relacionado con productos (lista y detalles)
            await this.cacheService.invalidatePattern(this.cacheService.generateKey(tenantId, 'products', '*'));

            // Fallback explícito para la lista de productos (Muy importante para la UI)
            const listKey = this.cacheService.generateKey(tenantId, 'products', 'list');
            await this.cacheService.invalidate(listKey);

            console.log('✅ [PurchasesService] Caché invalidado exitosamente');
        } catch (cacheError) {
            console.error('⚠️ [PurchasesService] Error al invalidar caché:', cacheError.message);
        }

        // Audit log
        this.auditService.log({
            action: 'CREATE',
            entity: 'Purchase',
            entityId: purchaseResult.id,
            newValue: { purchaseNumber: purchaseResult.purchaseNumber, total, items: dto.items.length },
            userId,
            tenantId,
        });

        return purchaseResult;
    }

    async findAll(tenantId: string, page: number = 1, limit: number = 20, from?: string, to?: string, search?: string) {
        const skip = (page - 1) * limit;
        const where: any = { tenantId };

        if (from || to) {
            where.date = {};
            if (from) where.date.gte = new Date(from);
            if (to) where.date.lte = new Date(to);
        }

        if (search) {
            const searchInt = parseInt(search);
            const searchConditions: any[] = [
                { supplier: { name: { contains: search, mode: 'insensitive' } } }
            ];

            if (!isNaN(searchInt)) {
                searchConditions.push({ purchaseNumber: searchInt });
            }

            where.OR = searchConditions;
        }

        const [data, total] = await Promise.all([
            this.prisma.purchase.findMany({
                where,
                include: {
                    supplier: { select: { name: true } },
                    buyer: { select: { name: true } },
                    _count: { select: { items: true } }
                },
                orderBy: { date: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.purchase.count({ where })
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    async findOne(tenantId: string, id: string) {
        return this.prisma.purchase.findFirst({
            where: { id, tenantId },
            include: {
                supplier: true,
                buyer: { select: { name: true } },
                items: {
                    include: {
                        product: {
                            select: { name: true, sku: true }
                        }
                    }
                },
                payments: {
                    orderBy: { date: 'desc' },
                    include: { createdBy: { select: { name: true } } }
                }
            }
        });
    }

    async addPayment(tenantId: string, userId: string, id: string, amount: number, notes?: string) {
        const purchase = await this.prisma.purchase.findFirst({
            where: { id, tenantId },
            include: { supplier: true }
        });

        if (!purchase) throw new BadRequestException('Compra no encontrada');

        const currentPaid = Number(purchase.amountPaid || 0);
        const total = Number(purchase.total);
        if (currentPaid + amount > total + 0.01) {
            throw new BadRequestException(`El pago ($${amount}) excede el saldo pendiente ($${(total - currentPaid).toFixed(2)})`);
        }

        return this.prisma.$transaction(async (tx) => {
            // 1. Crear el registro de pago
            const payment = await tx.purchasePayment.create({
                data: {
                    tenantId,
                    purchaseId: id,
                    amount,
                    createdById: userId,
                    notes: notes || 'Abono a compra',
                    date: new Date()
                }
            });

            // 2. Actualizar la compra
            const newAmountPaid = currentPaid + amount;
            const isFullyPaid = newAmountPaid >= total - 0.01;

            await tx.purchase.update({
                where: { id },
                data: {
                    amountPaid: newAmountPaid,
                    isPaid: isFullyPaid
                }
            });

            // 3. Crear Gasto
            await tx.expense.create({
                data: {
                    tenantId,
                    amount,
                    description: `Pago a Proveedor: ${purchase.supplier.name} - Compra #${purchase.purchaseNumber} ${isFullyPaid ? '(Total)' : '(Abono)'}`,
                    category: ExpenseCategory.INVENTORY,
                    supplierId: purchase.supplierId,
                    createdById: userId,
                    date: new Date()
                }
            });

            await this.cacheService.invalidatePattern(this.cacheService.generateKey(tenantId, 'expenses', '*'));
            await this.cacheService.invalidatePattern(this.cacheService.generateKey(tenantId, 'analytics', '*'));

            return payment;
        });
    }

    async markAsPaid(tenantId: string, userId: string, id: string) {
        const purchase = await this.prisma.purchase.findFirst({
            where: { id, tenantId }
        });

        if (!purchase) throw new BadRequestException('Compra no encontrada');
        const pending = Number(purchase.total) - Number(purchase.amountPaid || 0);

        if (pending <= 0) throw new BadRequestException('La compra ya está totalmente pagada');

        return this.addPayment(tenantId, userId, id, pending, 'Pago total de saldo pendiente');
    }
}

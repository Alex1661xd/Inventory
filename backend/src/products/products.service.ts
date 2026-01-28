import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class ProductsService {
    constructor(private readonly prisma: PrismaService) { }

    private generateBarcode() {
        return `MUE-${randomBytes(4).toString('hex').toUpperCase()}`;
    }

    private async generateUniqueBarcode(tenantId: string) {
        for (let i = 0; i < 10; i++) {
            const barcode = this.generateBarcode();
            const exists = await this.prisma.product.findFirst({
                where: { tenantId, barcode },
                select: { id: true },
            });

            if (!exists) return barcode;
        }

        throw new BadRequestException('Could not generate a unique barcode');
    }

    async create(tenantId: string, dto: CreateProductDto) {
        const barcode = await this.generateUniqueBarcode(tenantId);

        const initialStock = dto.initialStock ?? 0;
        let initialWarehouseId = dto.initialWarehouseId;

        if (initialStock > 0 && !initialWarehouseId) {
            const firstWarehouse = await this.prisma.warehouse.findFirst({
                where: { tenantId },
                orderBy: { name: 'asc' },
                select: { id: true },
            });

            if (!firstWarehouse) {
                throw new BadRequestException('No warehouse found for this tenant');
            }

            initialWarehouseId = firstWarehouse.id;
        }

        if (initialStock > 0 && initialWarehouseId) {
            const warehouseExists = await this.prisma.warehouse.findFirst({
                where: { id: initialWarehouseId, tenantId },
                select: { id: true },
            });

            if (!warehouseExists) {
                throw new BadRequestException('initialWarehouseId is invalid');
            }
        }

        try {
            return await this.prisma.$transaction(async (tx) => {
                const product = await tx.product.create({
                    data: {
                        tenantId,
                        name: dto.name,
                        description: dto.description,
                        barcode,
                        sku: dto.sku,
                        imageUrl: dto.imageUrl,
                        images: dto.images ?? [],
                        costPrice: dto.costPrice ?? 0,
                        salePrice: dto.salePrice ?? 0,
                        isPublic: dto.isPublic ?? true,
                        categoryId: dto.categoryId,
                    },
                });

                if (initialStock > 0 && initialWarehouseId) {
                    await tx.stock.create({
                        data: {
                            productId: product.id,
                            warehouseId: initialWarehouseId,
                            quantity: initialStock,
                        },
                    });
                }

                return product;
            });
        } catch (error: any) {
            throw new BadRequestException(error?.message ?? 'Error creating product');
        }
    }

    async findAllWithTotalStock(tenantId: string) {
        // Optimized query: Get all stock data in a single query
        const stockData = await this.prisma.stock.groupBy({
            by: ['productId'],
            _sum: {
                quantity: true,
            },
        });

        // Create a map for fast lookup
        const stockMap = new Map<string, number>();
        stockData.forEach(item => {
            stockMap.set(item.productId, item._sum.quantity ?? 0);
        });

        // Fetch all products in a single query
        const products = await this.prisma.product.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
        });

        // Combine products with their stock totals using the map
        return products.map(product => ({
            ...product,
            totalStock: stockMap.get(product.id) ?? 0,
        }));
    }

    async findOne(tenantId: string, id: string) {
        const product = await this.prisma.product.findFirst({
            where: { id, tenantId },
            include: {
                inventory: { select: { quantity: true } },
            },
        });

        if (!product) throw new NotFoundException('Product not found');

        const totalStock = product.inventory.reduce((acc, s) => acc + s.quantity, 0);
        const { inventory, ...rest } = product;
        return { ...rest, totalStock };
    }

    async findByBarcode(tenantId: string, barcode: string) {
        const normalized = (barcode ?? '').trim();
        if (!normalized) throw new BadRequestException('barcode is required');

        const product = await this.prisma.product.findFirst({
            where: { tenantId, barcode: normalized },
        });

        if (!product) throw new NotFoundException('Product not found');

        const stockAggregate = await this.prisma.stock.aggregate({
            where: { productId: product.id },
            _sum: { quantity: true },
        });

        return {
            ...product,
            totalStock: stockAggregate._sum.quantity ?? 0,
        };
    }

    async update(tenantId: string, id: string, dto: UpdateProductDto) {
        const exists = await this.prisma.product.findFirst({
            where: { id, tenantId },
            select: { id: true },
        });

        if (!exists) throw new NotFoundException('Product not found');

        try {
            return await this.prisma.product.update({
                where: { id },
                data: dto,
            });
        } catch (error: any) {
            throw new BadRequestException(error?.message ?? 'Error updating product');
        }
    }

    async remove(tenantId: string, id: string) {
        const exists = await this.prisma.product.findFirst({
            where: { id, tenantId },
            select: { id: true },
        });

        if (!exists) throw new NotFoundException('Product not found');

        try {
            return await this.prisma.product.delete({
                where: { id },
            });
        } catch (error: any) {
            throw new BadRequestException(error?.message ?? 'Error deleting product');
        }
    }
}

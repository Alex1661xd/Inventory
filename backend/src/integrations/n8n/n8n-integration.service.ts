import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class N8nIntegrationService {
  constructor(private readonly prisma: PrismaService) {}

  async findProductsForBot(
    tenantId: string,
    query?: string,
    barcode?: string,
    categoryId?: string,
    onlyAvailable: boolean = true,
    limit: number = 10,
  ) {
    if (!tenantId) {
      throw new BadRequestException('x-tenant-id header is required');
    }

    const safeLimit = Math.max(1, Math.min(limit, 50));

    const where: any = {
      tenantId,
      active: true,
      isPublic: true,
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (barcode) {
      where.barcode = barcode.trim();
    } else if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { sku: { contains: query, mode: 'insensitive' } },
        { barcode: { contains: query, mode: 'insensitive' } },
      ];
    }

    const products = await this.prisma.product.findMany({
      where,
      take: safeLimit,
      orderBy: { createdAt: 'desc' },
      include: {
        inventory: { select: { quantity: true } },
        category: { select: { id: true, name: true } },
      },
    });

    const normalized = products
      .map((product) => {
        const totalStock = (product.inventory || []).reduce((sum, row) => sum + row.quantity, 0);
        const available = totalStock > 0;

        return {
          id: product.id,
          name: product.name,
          description: product.description,
          barcode: product.barcode,
          sku: product.sku,
          images: product.images || [],
          price: Number(product.salePrice),
          stock: totalStock,
          available,
          category: {
            id: product.category?.id ?? null,
            name: product.category?.name ?? null,
          },
        };
      })
      .filter((product) => (onlyAvailable ? product.available : true));

    return {
      tenantId,
      count: normalized.length,
      products: normalized,
    };
  }
}

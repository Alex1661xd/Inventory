import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Category } from '@prisma/client';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService
  ) { }

  async findAll(tenantId: string): Promise<Category[]> {
    // Intentar obtener del caché
    const cacheKey = this.cacheService.generateKey(tenantId, 'categories', 'list');
    const cached = await this.cacheService.get<Category[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const categories = await this.prisma.category.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });

    // Guardar en caché por 15 minutos (raramente cambian)
    await this.cacheService.set(cacheKey, categories, 900);

    return categories;
  }

  async findOne(id: string, tenantId: string): Promise<Category> {
    const category = await this.prisma.category.findFirst({
      where: {
        id,
        tenantId
      },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    return category;
  }

  async create(data: { name: string; description?: string }, tenantId: string): Promise<Category> {
    const category = await this.prisma.category.create({
      data: {
        ...data,
        tenantId,
      },
    });

    // Invalidar caché de lista de categorías
    await this.invalidateCategoryCache(tenantId);

    return category;
  }

  async update(
    id: string,
    data: { name?: string; description?: string },
    tenantId: string
  ): Promise<Category> {
    // Verify category exists and belongs to tenant
    await this.findOne(id, tenantId);

    const updated = await this.prisma.category.update({
      where: { id },
      data,
    });

    // Invalidar caché
    await this.invalidateCategoryCache(tenantId);

    return updated;
  }

  async remove(id: string, tenantId: string): Promise<void> {
    // Verify category exists and belongs to tenant
    await this.findOne(id, tenantId);

    // Check if category has products
    const productCount = await this.prisma.product.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      throw new Error('Cannot delete category with associated products');
    }

    await this.prisma.category.delete({
      where: { id },
    });

    // Invalidar caché
    await this.invalidateCategoryCache(tenantId);
  }

  private async invalidateCategoryCache(tenantId: string) {
    const cacheKey = this.cacheService.generateKey(tenantId, 'categories', 'list');
    await this.cacheService.invalidate(cacheKey);
  }
}

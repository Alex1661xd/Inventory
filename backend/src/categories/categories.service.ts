import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Category } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
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
    return this.prisma.category.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  async update(
    id: string, 
    data: { name?: string; description?: string }, 
    tenantId: string
  ): Promise<Category> {
    // Verify category exists and belongs to tenant
    await this.findOne(id, tenantId);

    return this.prisma.category.update({
      where: { id },
      data,
    });
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
  }
}

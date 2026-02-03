import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cacheService: CacheService,
    ) { }

    private async invalidateCustomersCache(tenantId: string, customerId?: string) {
        const listKey = this.cacheService.generateKey(tenantId, 'customers', 'list');
        await this.cacheService.invalidate(listKey);

        if (customerId) {
            const detailKey = this.cacheService.generateKey(tenantId, 'customers', 'detail', customerId);
            await this.cacheService.invalidate(detailKey);
        }
    }

    async create(tenantId: string, createCustomerDto: CreateCustomerDto) {
        const result = await this.prisma.customer.create({
            data: {
                ...createCustomerDto,
                tenantId,
            },
        });

        await this.invalidateCustomersCache(tenantId, result.id);

        return result;
    }

    async findAll(tenantId: string) {
        const cacheKey = this.cacheService.generateKey(tenantId, 'customers', 'list');
        const cached = await this.cacheService.get<any[]>(cacheKey);
        if (cached) return cached;

        const result = await this.prisma.customer.findMany({
            where: { tenantId },
            orderBy: { name: 'asc' },
        });

        await this.cacheService.set(cacheKey, result, 300);

        return result;
    }

    async findOne(tenantId: string, id: string) {
        const cacheKey = this.cacheService.generateKey(tenantId, 'customers', 'detail', id);
        const cached = await this.cacheService.get<any>(cacheKey);
        if (cached) return cached;

        const customer = await this.prisma.customer.findFirst({
            where: { id, tenantId },
        });

        if (!customer) {
            throw new NotFoundException('Cliente no encontrado');
        }

        await this.cacheService.set(cacheKey, customer, 600);

        return customer;
    }

    async update(id: string, tenantId: string, updateCustomerDto: UpdateCustomerDto) {
        // Verify ownership before updating
        const customer = await this.prisma.customer.findFirst({
            where: { id, tenantId },
            select: { id: true }
        });

        if (!customer) {
            throw new NotFoundException('Cliente no encontrado');
        }

        const result = await this.prisma.customer.update({
            where: { id },
            data: updateCustomerDto,
        });

        await this.invalidateCustomersCache(tenantId, id);

        return result;
    }

    async remove(id: string, tenantId: string) {
        // Verify ownership before deleting
        const customer = await this.prisma.customer.findFirst({
            where: { id, tenantId },
            select: { id: true }
        });

        if (!customer) {
            throw new NotFoundException('Cliente no encontrado');
        }

        const result = await this.prisma.customer.delete({
            where: { id },
        });

        await this.invalidateCustomersCache(tenantId, id);

        return result;
    }
}

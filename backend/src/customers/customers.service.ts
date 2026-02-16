import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class CustomersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cacheService: CacheService,
        private readonly auditService: AuditService,
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
        // Validate unique docNumber
        const existing = await this.prisma.customer.findFirst({
            where: {
                tenantId,
                docNumber: createCustomerDto.docNumber
            }
        });

        if (existing) {
            throw new ConflictException('Ya existe un cliente con este número de documento');
        }

        const result = await this.prisma.customer.create({
            data: {
                ...createCustomerDto,
                tenantId,
            },
        });

        await this.invalidateCustomersCache(tenantId, result.id);

        this.auditService.log({
            action: 'CREATE',
            entity: 'Customer',
            entityId: result.id,
            newValue: result,
            tenantId,
        });

        return result;
    }

    async findAll(tenantId: string, page: number = 1, limit: number = 20, search?: string) {
        const skip = (page - 1) * limit;
        const cacheKey = this.cacheService.generateKey(tenantId, 'customers', 'list', `p${page}-l${limit}-s${search || 'all'}`);

        const cached = await this.cacheService.get<any>(cacheKey);
        if (cached) return cached;

        const where: any = { tenantId };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { docNumber: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [data, total] = await Promise.all([
            this.prisma.customer.findMany({
                where,
                orderBy: { name: 'asc' },
                skip,
                take: limit,
            }),
            this.prisma.customer.count({ where }),
        ]);

        const result = {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };

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

        this.auditService.log({
            action: 'UPDATE',
            entity: 'Customer',
            entityId: id,
            newValue: updateCustomerDto,
            tenantId,
        });

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

        this.auditService.log({
            action: 'DELETE',
            entity: 'Customer',
            entityId: id,
            tenantId,
        });

        return result;
    }
}

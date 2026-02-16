import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class SuppliersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly auditService: AuditService,
    ) { }

    async create(tenantId: string, createSupplierDto: CreateSupplierDto) {
        const result = await this.prisma.supplier.create({
            data: {
                ...createSupplierDto,
                tenantId,
            },
        });

        this.auditService.log({
            action: 'CREATE',
            entity: 'Supplier',
            entityId: result.id,
            newValue: result,
            tenantId,
        });

        return result;
    }

    async findAll(tenantId: string, page: number = 1, limit: number = 20, search?: string) {
        const skip = (page - 1) * limit;
        const where: any = { tenantId };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { docNumber: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [data, total] = await Promise.all([
            this.prisma.supplier.findMany({
                where,
                orderBy: { name: 'asc' },
                skip,
                take: limit,
            }),
            this.prisma.supplier.count({ where }),
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    findOne(tenantId: string, id: string) {
        return this.prisma.supplier.findFirst({
            where: { id, tenantId },
        });
    }

    async update(tenantId: string, id: string, updateSupplierDto: UpdateSupplierDto) {
        // Usamos updateMany para asegurar que el tenant coincida
        const result = await this.prisma.supplier.updateMany({
            where: { id, tenantId },
            data: updateSupplierDto,
        });

        this.auditService.log({
            action: 'UPDATE',
            entity: 'Supplier',
            entityId: id,
            newValue: updateSupplierDto,
            tenantId,
        });

        return result;
    }

    async remove(tenantId: string, id: string) {
        return this.prisma.supplier.deleteMany({
            where: { id, tenantId },
        });
    }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
    constructor(private readonly prisma: PrismaService) { }

    create(tenantId: string, createSupplierDto: CreateSupplierDto) {
        return this.prisma.supplier.create({
            data: {
                ...createSupplierDto,
                tenantId,
            },
        });
    }

    findAll(tenantId: string) {
        return this.prisma.supplier.findMany({
            where: { tenantId },
            orderBy: { name: 'asc' },
        });
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
        return result;
    }

    async remove(tenantId: string, id: string) {
        return this.prisma.supplier.deleteMany({
            where: { id, tenantId },
        });
    }
}

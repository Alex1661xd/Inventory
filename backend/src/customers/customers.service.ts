import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
    constructor(private readonly prisma: PrismaService) { }

    async create(tenantId: string, createCustomerDto: CreateCustomerDto) {
        return this.prisma.customer.create({
            data: {
                ...createCustomerDto,
                tenantId,
            },
        });
    }

    async findAll(tenantId: string) {
        return this.prisma.customer.findMany({
            where: { tenantId },
            orderBy: { name: 'asc' },
        });
    }

    async findOne(id: string) {
        return this.prisma.customer.findUniqueOrThrow({
            where: { id },
        });
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

        return this.prisma.customer.update({
            where: { id },
            data: updateCustomerDto,
        });
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

        return this.prisma.customer.delete({
            where: { id },
        });
    }
}

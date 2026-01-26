import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@Injectable()
export class WarehousesService {
    constructor(private readonly prisma: PrismaService) { }

    async create(tenantId: string, dto: CreateWarehouseDto) {
        try {
            return await this.prisma.warehouse.create({
                data: {
                    tenantId,
                    name: dto.name,
                    address: dto.address,
                },
            });
        } catch (error: any) {
            throw new BadRequestException(error?.message ?? 'Error creating warehouse');
        }
    }

    async findAll(tenantId: string) {
        return this.prisma.warehouse.findMany({
            where: { tenantId },
            orderBy: { name: 'asc' },
        });
    }

    async update(tenantId: string, id: string, dto: UpdateWarehouseDto) {
        const exists = await this.prisma.warehouse.findFirst({
            where: { id, tenantId },
            select: { id: true },
        });

        if (!exists) {
            throw new NotFoundException('Warehouse not found');
        }

        try {
            return await this.prisma.warehouse.update({
                where: { id },
                data: {
                    name: dto.name,
                    address: dto.address,
                },
            });
        } catch (error: any) {
            throw new BadRequestException(error?.message ?? 'Error updating warehouse');
        }
    }

    async remove(tenantId: string, id: string) {
        const exists = await this.prisma.warehouse.findFirst({
            where: { id, tenantId },
            select: { id: true },
        });

        if (!exists) {
            throw new NotFoundException('Warehouse not found');
        }

        try {
            return await this.prisma.warehouse.delete({
                where: { id },
            });
        } catch (error: any) {
            throw new BadRequestException(error?.message ?? 'Error deleting warehouse');
        }
    }
}

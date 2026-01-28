import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class WarehousesService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cacheService: CacheService
    ) { }

    async create(tenantId: string, dto: CreateWarehouseDto) {
        try {
            const warehouse = await this.prisma.warehouse.create({
                data: {
                    tenantId,
                    name: dto.name,
                    address: dto.address,
                },
            });

            // Invalidar caché
            await this.invalidateWarehouseCache(tenantId);

            return warehouse;
        } catch (error: any) {
            throw new BadRequestException(error?.message ?? 'Error creating warehouse');
        }
    }

    async findAll(tenantId: string) {
        // Intentar obtener del caché
        const cacheKey = this.cacheService.generateKey(tenantId, 'warehouses', 'list');
        const cached = await this.cacheService.get<any[]>(cacheKey);

        if (cached) {
            return cached;
        }

        const warehouses = await this.prisma.warehouse.findMany({
            where: { tenantId },
            orderBy: { name: 'asc' },
        });

        // Guardar en caché por 15 minutos (raramente cambian)
        await this.cacheService.set(cacheKey, warehouses, 900);

        return warehouses;
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
            const updated = await this.prisma.warehouse.update({
                where: { id },
                data: {
                    name: dto.name,
                    address: dto.address,
                },
            });

            // Invalidar caché
            await this.invalidateWarehouseCache(tenantId);

            return updated;
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
            const result = await this.prisma.warehouse.delete({
                where: { id },
            });

            // Invalidar caché
            await this.invalidateWarehouseCache(tenantId);

            return result;
        } catch (error: any) {
            throw new BadRequestException(error?.message ?? 'Error deleting warehouse');
        }
    }

    private async invalidateWarehouseCache(tenantId: string) {
        const cacheKey = this.cacheService.generateKey(tenantId, 'warehouses', 'list');
        await this.cacheService.invalidate(cacheKey);
    }
}

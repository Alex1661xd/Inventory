"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarehousesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const cache_service_1 = require("../cache/cache.service");
let WarehousesService = class WarehousesService {
    prisma;
    cacheService;
    constructor(prisma, cacheService) {
        this.prisma = prisma;
        this.cacheService = cacheService;
    }
    async create(tenantId, dto) {
        try {
            const warehouse = await this.prisma.warehouse.create({
                data: {
                    tenantId,
                    name: dto.name,
                    address: dto.address,
                },
            });
            await this.invalidateWarehouseCache(tenantId);
            return warehouse;
        }
        catch (error) {
            throw new common_1.BadRequestException(error?.message ?? 'Error creating warehouse');
        }
    }
    async findAll(tenantId) {
        const cacheKey = this.cacheService.generateKey(tenantId, 'warehouses', 'list');
        const cached = await this.cacheService.get(cacheKey);
        if (cached) {
            return cached;
        }
        const warehouses = await this.prisma.warehouse.findMany({
            where: { tenantId },
            orderBy: { name: 'asc' },
        });
        await this.cacheService.set(cacheKey, warehouses, 900);
        return warehouses;
    }
    async update(tenantId, id, dto) {
        const exists = await this.prisma.warehouse.findFirst({
            where: { id, tenantId },
            select: { id: true },
        });
        if (!exists) {
            throw new common_1.NotFoundException('Warehouse not found');
        }
        try {
            const updated = await this.prisma.warehouse.update({
                where: { id },
                data: {
                    name: dto.name,
                    address: dto.address,
                },
            });
            await this.invalidateWarehouseCache(tenantId);
            return updated;
        }
        catch (error) {
            throw new common_1.BadRequestException(error?.message ?? 'Error updating warehouse');
        }
    }
    async remove(tenantId, id) {
        const exists = await this.prisma.warehouse.findFirst({
            where: { id, tenantId },
            select: { id: true },
        });
        if (!exists) {
            throw new common_1.NotFoundException('Warehouse not found');
        }
        try {
            const result = await this.prisma.warehouse.delete({
                where: { id },
            });
            await this.invalidateWarehouseCache(tenantId);
            return result;
        }
        catch (error) {
            throw new common_1.BadRequestException(error?.message ?? 'Error deleting warehouse');
        }
    }
    async invalidateWarehouseCache(tenantId) {
        const cacheKey = this.cacheService.generateKey(tenantId, 'warehouses', 'list');
        await this.cacheService.invalidate(cacheKey);
    }
};
exports.WarehousesService = WarehousesService;
exports.WarehousesService = WarehousesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cache_service_1.CacheService])
], WarehousesService);
//# sourceMappingURL=warehouses.service.js.map
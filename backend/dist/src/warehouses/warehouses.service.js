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
let WarehousesService = class WarehousesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, dto) {
        try {
            return await this.prisma.warehouse.create({
                data: {
                    tenantId,
                    name: dto.name,
                    address: dto.address,
                },
            });
        }
        catch (error) {
            throw new common_1.BadRequestException(error?.message ?? 'Error creating warehouse');
        }
    }
    async findAll(tenantId) {
        return this.prisma.warehouse.findMany({
            where: { tenantId },
            orderBy: { name: 'asc' },
        });
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
            return await this.prisma.warehouse.update({
                where: { id },
                data: {
                    name: dto.name,
                    address: dto.address,
                },
            });
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
            return await this.prisma.warehouse.delete({
                where: { id },
            });
        }
        catch (error) {
            throw new common_1.BadRequestException(error?.message ?? 'Error deleting warehouse');
        }
    }
};
exports.WarehousesService = WarehousesService;
exports.WarehousesService = WarehousesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WarehousesService);
//# sourceMappingURL=warehouses.service.js.map
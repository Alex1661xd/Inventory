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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CategoriesService = class CategoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(tenantId) {
        return this.prisma.category.findMany({
            where: { tenantId },
            orderBy: { name: 'asc' },
        });
    }
    async findOne(id, tenantId) {
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
    async create(data, tenantId) {
        return this.prisma.category.create({
            data: {
                ...data,
                tenantId,
            },
        });
    }
    async update(id, data, tenantId) {
        await this.findOne(id, tenantId);
        return this.prisma.category.update({
            where: { id },
            data,
        });
    }
    async remove(id, tenantId) {
        await this.findOne(id, tenantId);
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
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map
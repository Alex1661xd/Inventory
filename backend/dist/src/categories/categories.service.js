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
const cache_service_1 = require("../cache/cache.service");
let CategoriesService = class CategoriesService {
    prisma;
    cacheService;
    constructor(prisma, cacheService) {
        this.prisma = prisma;
        this.cacheService = cacheService;
    }
    async findAll(tenantId) {
        const cacheKey = this.cacheService.generateKey(tenantId, 'categories', 'list');
        const cached = await this.cacheService.get(cacheKey);
        if (cached) {
            return cached;
        }
        const categories = await this.prisma.category.findMany({
            where: { tenantId },
            orderBy: { name: 'asc' },
        });
        await this.cacheService.set(cacheKey, categories, 900);
        return categories;
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
        const category = await this.prisma.category.create({
            data: {
                ...data,
                tenantId,
            },
        });
        await this.invalidateCategoryCache(tenantId);
        return category;
    }
    async update(id, data, tenantId) {
        await this.findOne(id, tenantId);
        const updated = await this.prisma.category.update({
            where: { id },
            data,
        });
        await this.invalidateCategoryCache(tenantId);
        return updated;
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
        await this.invalidateCategoryCache(tenantId);
    }
    async invalidateCategoryCache(tenantId) {
        const cacheKey = this.cacheService.generateKey(tenantId, 'categories', 'list');
        await this.cacheService.invalidate(cacheKey);
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cache_service_1.CacheService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map
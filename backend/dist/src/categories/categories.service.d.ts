import { PrismaService } from '../prisma/prisma.service';
import { Category } from '@prisma/client';
import { CacheService } from '../cache/cache.service';
export declare class CategoriesService {
    private prisma;
    private cacheService;
    constructor(prisma: PrismaService, cacheService: CacheService);
    findAll(tenantId: string): Promise<Category[]>;
    findOne(id: string, tenantId: string): Promise<Category>;
    create(data: {
        name: string;
        description?: string;
    }, tenantId: string): Promise<Category>;
    update(id: string, data: {
        name?: string;
        description?: string;
    }, tenantId: string): Promise<Category>;
    remove(id: string, tenantId: string): Promise<void>;
    private invalidateCategoryCache;
}

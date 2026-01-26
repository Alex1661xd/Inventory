import { PrismaService } from '../prisma/prisma.service';
import { Category } from '@prisma/client';
export declare class CategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
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
}

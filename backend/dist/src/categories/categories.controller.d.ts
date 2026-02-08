import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(tenantId: string): Promise<{
        name: string;
        id: string;
        tenantId: string;
    }[]>;
    findOne(tenantId: string, id: string): Promise<{
        name: string;
        id: string;
        tenantId: string;
    }>;
    create(tenantId: string, createCategoryDto: {
        name: string;
        description?: string;
    }): Promise<{
        name: string;
        id: string;
        tenantId: string;
    }>;
    update(tenantId: string, id: string, updateCategoryDto: {
        name?: string;
        description?: string;
    }): Promise<{
        name: string;
        id: string;
        tenantId: string;
    }>;
    remove(tenantId: string, id: string): Promise<void>;
}

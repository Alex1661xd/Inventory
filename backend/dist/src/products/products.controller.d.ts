import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(tenantId: string, dto: CreateProductDto, userId: string): Promise<{
        isPublic: boolean;
        id: string;
        createdAt: Date;
        name: string;
        tenantId: string;
        updatedAt: Date;
        description: string | null;
        sku: string | null;
        images: string[];
        costPrice: import("@prisma/client/runtime/library").Decimal;
        salePrice: import("@prisma/client/runtime/library").Decimal;
        isSellable: boolean;
        categoryId: string | null;
        barcode: string | null;
        active: boolean;
    }>;
    findAll(tenantId: string, page?: string, limit?: string, search?: string, categoryId?: string, minPrice?: string, maxPrice?: string, stockStatus?: string, refresh?: string, sellableOnly?: string): Promise<any>;
    findByBarcode(tenantId: string, barcode: string): Promise<any>;
    findOne(tenantId: string, id: string, refresh?: string): Promise<any>;
    update(tenantId: string, id: string, dto: UpdateProductDto): Promise<{
        isPublic: boolean;
        id: string;
        createdAt: Date;
        name: string;
        tenantId: string;
        updatedAt: Date;
        description: string | null;
        sku: string | null;
        images: string[];
        costPrice: import("@prisma/client/runtime/library").Decimal;
        salePrice: import("@prisma/client/runtime/library").Decimal;
        isSellable: boolean;
        categoryId: string | null;
        barcode: string | null;
        active: boolean;
    }>;
    remove(tenantId: string, id: string): Promise<{
        success: boolean;
    }>;
}

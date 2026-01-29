import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(tenantId: string, dto: CreateProductDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        barcode: string | null;
        sku: string | null;
        imageUrl: string | null;
        images: string[];
        costPrice: import("@prisma/client/runtime/library").Decimal;
        salePrice: import("@prisma/client/runtime/library").Decimal;
        isPublic: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        categoryId: string | null;
    }>;
    findAll(tenantId: string): Promise<any[]>;
    findByBarcode(tenantId: string, barcode: string): Promise<any>;
    findOne(tenantId: string, id: string): Promise<any>;
    update(tenantId: string, id: string, dto: UpdateProductDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        barcode: string | null;
        sku: string | null;
        imageUrl: string | null;
        images: string[];
        costPrice: import("@prisma/client/runtime/library").Decimal;
        salePrice: import("@prisma/client/runtime/library").Decimal;
        isPublic: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        categoryId: string | null;
    }>;
    remove(tenantId: string, id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        barcode: string | null;
        sku: string | null;
        imageUrl: string | null;
        images: string[];
        costPrice: import("@prisma/client/runtime/library").Decimal;
        salePrice: import("@prisma/client/runtime/library").Decimal;
        isPublic: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        categoryId: string | null;
    }>;
}

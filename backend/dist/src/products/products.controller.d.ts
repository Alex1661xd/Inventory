import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(tenantId: string, dto: CreateProductDto, userId: string): Promise<{
        isPublic: boolean;
        id: string;
        name: string;
        description: string | null;
        barcode: string | null;
        sku: string | null;
        imageUrl: string | null;
        images: string[];
        costPrice: import("@prisma/client/runtime/library").Decimal;
        salePrice: import("@prisma/client/runtime/library").Decimal;
        tenantId: string;
        categoryId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(tenantId: string): Promise<any[]>;
    findByBarcode(tenantId: string, barcode: string): Promise<any>;
    findOne(tenantId: string, id: string): Promise<any>;
    update(tenantId: string, id: string, dto: UpdateProductDto): Promise<{
        isPublic: boolean;
        id: string;
        name: string;
        description: string | null;
        barcode: string | null;
        sku: string | null;
        imageUrl: string | null;
        images: string[];
        costPrice: import("@prisma/client/runtime/library").Decimal;
        salePrice: import("@prisma/client/runtime/library").Decimal;
        tenantId: string;
        categoryId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(tenantId: string, id: string): Promise<{
        isPublic: boolean;
        id: string;
        name: string;
        description: string | null;
        barcode: string | null;
        sku: string | null;
        imageUrl: string | null;
        images: string[];
        costPrice: import("@prisma/client/runtime/library").Decimal;
        salePrice: import("@prisma/client/runtime/library").Decimal;
        tenantId: string;
        categoryId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}

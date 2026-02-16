import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CacheService } from '../cache/cache.service';
import { SupabaseService } from '../supabase/supabase.service';
export declare class ProductsService {
    private readonly prisma;
    private readonly cacheService;
    private readonly supabaseService;
    constructor(prisma: PrismaService, cacheService: CacheService, supabaseService: SupabaseService);
    private generateBarcode;
    private generateUniqueBarcode;
    create(tenantId: string, dto: CreateProductDto, userId?: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        barcode: string | null;
        sku: string | null;
        imageUrl: string | null;
        costPrice: import("@prisma/client/runtime/library").Decimal;
        salePrice: import("@prisma/client/runtime/library").Decimal;
        isPublic: boolean;
        categoryId: string | null;
        images: string[];
        active: boolean;
    }>;
    findAllWithTotalStock(tenantId: string): Promise<any[]>;
    findOne(tenantId: string, id: string, refresh?: boolean): Promise<any>;
    findByBarcode(tenantId: string, barcode: string): Promise<any>;
    update(tenantId: string, id: string, dto: UpdateProductDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        barcode: string | null;
        sku: string | null;
        imageUrl: string | null;
        costPrice: import("@prisma/client/runtime/library").Decimal;
        salePrice: import("@prisma/client/runtime/library").Decimal;
        isPublic: boolean;
        categoryId: string | null;
        images: string[];
        active: boolean;
    }>;
    remove(tenantId: string, id: string): Promise<{
        success: boolean;
    }>;
    private deleteImagesFromStorage;
    private invalidateProductCache;
}

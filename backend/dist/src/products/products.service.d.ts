import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CacheService } from '../cache/cache.service';
import { SupabaseService } from '../supabase/supabase.service';
import { AuditService } from '../audit/audit.service';
export declare class ProductsService {
    private readonly prisma;
    private readonly cacheService;
    private readonly supabaseService;
    private readonly auditService;
    constructor(prisma: PrismaService, cacheService: CacheService, supabaseService: SupabaseService, auditService: AuditService);
    private generateBarcode;
    private generateUniqueBarcode;
    create(tenantId: string, dto: CreateProductDto, userId?: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        barcode: string | null;
        sku: string | null;
        images: string[];
        costPrice: import("@prisma/client/runtime/library").Decimal;
        salePrice: import("@prisma/client/runtime/library").Decimal;
        isPublic: boolean;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        categoryId: string | null;
    }>;
    findAllWithTotalStock(tenantId: string, page?: number, limit?: number, search?: string, filters?: {
        categoryId?: string;
        minPrice?: number;
        maxPrice?: number;
        stockStatus?: string;
    }): Promise<any>;
    findOne(tenantId: string, id: string, refresh?: boolean): Promise<any>;
    findByBarcode(tenantId: string, barcode: string): Promise<any>;
    update(tenantId: string, id: string, dto: UpdateProductDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        barcode: string | null;
        sku: string | null;
        images: string[];
        costPrice: import("@prisma/client/runtime/library").Decimal;
        salePrice: import("@prisma/client/runtime/library").Decimal;
        isPublic: boolean;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        categoryId: string | null;
    }>;
    remove(tenantId: string, id: string): Promise<{
        success: boolean;
    }>;
    private deleteImagesFromStorage;
    private invalidateProductCache;
}

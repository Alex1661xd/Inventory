import { PrismaService } from '../prisma/prisma.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { CacheService } from '../cache/cache.service';
export declare class WarehousesService {
    private readonly prisma;
    private readonly cacheService;
    constructor(prisma: PrismaService, cacheService: CacheService);
    create(tenantId: string, dto: CreateWarehouseDto): Promise<{
        name: string;
        id: string;
        tenantId: string;
        address: string | null;
        isDefault: boolean;
    }>;
    findAll(tenantId: string): Promise<any[]>;
    update(tenantId: string, id: string, dto: UpdateWarehouseDto): Promise<{
        name: string;
        id: string;
        tenantId: string;
        address: string | null;
        isDefault: boolean;
    }>;
    remove(tenantId: string, id: string): Promise<{
        name: string;
        id: string;
        tenantId: string;
        address: string | null;
        isDefault: boolean;
    }>;
    private invalidateWarehouseCache;
}

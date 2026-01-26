import { PrismaService } from '../prisma/prisma.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
export declare class WarehousesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, dto: CreateWarehouseDto): Promise<{
        name: string;
        id: string;
        tenantId: string;
        address: string | null;
    }>;
    findAll(tenantId: string): Promise<{
        name: string;
        id: string;
        tenantId: string;
        address: string | null;
    }[]>;
    update(tenantId: string, id: string, dto: UpdateWarehouseDto): Promise<{
        name: string;
        id: string;
        tenantId: string;
        address: string | null;
    }>;
    remove(tenantId: string, id: string): Promise<{
        name: string;
        id: string;
        tenantId: string;
        address: string | null;
    }>;
}

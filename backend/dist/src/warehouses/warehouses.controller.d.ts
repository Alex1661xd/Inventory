import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { WarehousesService } from './warehouses.service';
export declare class WarehousesController {
    private readonly warehousesService;
    constructor(warehousesService: WarehousesService);
    create(tenantId: string, dto: CreateWarehouseDto): Promise<{
        id: string;
        name: string;
        tenantId: string;
        address: string | null;
        isDefault: boolean;
    }>;
    findAll(tenantId: string): Promise<any[]>;
    update(tenantId: string, id: string, dto: UpdateWarehouseDto): Promise<{
        id: string;
        name: string;
        tenantId: string;
        address: string | null;
        isDefault: boolean;
    }>;
    remove(tenantId: string, id: string): Promise<{
        id: string;
        name: string;
        tenantId: string;
        address: string | null;
        isDefault: boolean;
    }>;
}

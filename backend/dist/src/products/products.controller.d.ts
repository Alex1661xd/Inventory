import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(tenantId: string, dto: CreateProductDto, userId: string): Promise<any>;
    findAll(tenantId: string, page?: string, limit?: string, search?: string, categoryId?: string, minPrice?: string, maxPrice?: string, stockStatus?: string, refresh?: string, sellableOnly?: string): Promise<any>;
    findByBarcode(tenantId: string, barcode: string): Promise<any>;
    findOne(tenantId: string, id: string, refresh?: string): Promise<any>;
    update(tenantId: string, id: string, dto: UpdateProductDto): Promise<any>;
    remove(tenantId: string, id: string): Promise<{
        success: boolean;
    }>;
}

export declare class CreateProductDto {
    name: string;
    description?: string;
    sku?: string;
    imageUrl?: string;
    costPrice?: number;
    salePrice?: number;
    isPublic?: boolean;
    categoryId?: string;
    initialStock?: number;
    initialWarehouseId?: string;
}

declare class ProductVisualVariantDto {
    name: string;
    image: string;
    sortOrder?: number;
    isPublic?: boolean;
}
export declare class CreateProductDto {
    name: string;
    description?: string;
    sku?: string;
    images?: string[];
    costPrice: number;
    salePrice: number;
    isPublic?: boolean;
    isSellable?: boolean;
    categoryId: string;
    initialStock?: number;
    initialWarehouseId?: string;
    visualVariants?: ProductVisualVariantDto[];
}
export {};

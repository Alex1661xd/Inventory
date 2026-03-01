declare class ProductVisualVariantUpdateDto {
    name?: string;
    image?: string;
    sortOrder?: number;
    isPublic?: boolean;
}
export declare class UpdateProductDto {
    name?: string;
    description?: string;
    sku?: string;
    images?: string[];
    costPrice?: number;
    salePrice?: number;
    creditPrice?: number;
    allowCreditSale?: boolean;
    isPublic?: boolean;
    isSellable?: boolean;
    categoryId?: string;
    visualVariants?: ProductVisualVariantUpdateDto[];
}
export {};

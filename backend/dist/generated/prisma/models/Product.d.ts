import type * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../internal/prismaNamespace.js";
export type ProductModel = runtime.Types.Result.DefaultSelection<Prisma.$ProductPayload>;
export type AggregateProduct = {
    _count: ProductCountAggregateOutputType | null;
    _avg: ProductAvgAggregateOutputType | null;
    _sum: ProductSumAggregateOutputType | null;
    _min: ProductMinAggregateOutputType | null;
    _max: ProductMaxAggregateOutputType | null;
};
export type ProductAvgAggregateOutputType = {
    costPrice: runtime.Decimal | null;
    salePrice: runtime.Decimal | null;
};
export type ProductSumAggregateOutputType = {
    costPrice: runtime.Decimal | null;
    salePrice: runtime.Decimal | null;
};
export type ProductMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    description: string | null;
    barcode: string | null;
    sku: string | null;
    imageUrl: string | null;
    costPrice: runtime.Decimal | null;
    salePrice: runtime.Decimal | null;
    isPublic: boolean | null;
    tenantId: string | null;
    categoryId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type ProductMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    description: string | null;
    barcode: string | null;
    sku: string | null;
    imageUrl: string | null;
    costPrice: runtime.Decimal | null;
    salePrice: runtime.Decimal | null;
    isPublic: boolean | null;
    tenantId: string | null;
    categoryId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type ProductCountAggregateOutputType = {
    id: number;
    name: number;
    description: number;
    barcode: number;
    sku: number;
    imageUrl: number;
    costPrice: number;
    salePrice: number;
    isPublic: number;
    tenantId: number;
    categoryId: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type ProductAvgAggregateInputType = {
    costPrice?: true;
    salePrice?: true;
};
export type ProductSumAggregateInputType = {
    costPrice?: true;
    salePrice?: true;
};
export type ProductMinAggregateInputType = {
    id?: true;
    name?: true;
    description?: true;
    barcode?: true;
    sku?: true;
    imageUrl?: true;
    costPrice?: true;
    salePrice?: true;
    isPublic?: true;
    tenantId?: true;
    categoryId?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type ProductMaxAggregateInputType = {
    id?: true;
    name?: true;
    description?: true;
    barcode?: true;
    sku?: true;
    imageUrl?: true;
    costPrice?: true;
    salePrice?: true;
    isPublic?: true;
    tenantId?: true;
    categoryId?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type ProductCountAggregateInputType = {
    id?: true;
    name?: true;
    description?: true;
    barcode?: true;
    sku?: true;
    imageUrl?: true;
    costPrice?: true;
    salePrice?: true;
    isPublic?: true;
    tenantId?: true;
    categoryId?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type ProductAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ProductWhereInput;
    orderBy?: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[];
    cursor?: Prisma.ProductWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ProductCountAggregateInputType;
    _avg?: ProductAvgAggregateInputType;
    _sum?: ProductSumAggregateInputType;
    _min?: ProductMinAggregateInputType;
    _max?: ProductMaxAggregateInputType;
};
export type GetProductAggregateType<T extends ProductAggregateArgs> = {
    [P in keyof T & keyof AggregateProduct]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateProduct[P]> : Prisma.GetScalarType<T[P], AggregateProduct[P]>;
};
export type ProductGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ProductWhereInput;
    orderBy?: Prisma.ProductOrderByWithAggregationInput | Prisma.ProductOrderByWithAggregationInput[];
    by: Prisma.ProductScalarFieldEnum[] | Prisma.ProductScalarFieldEnum;
    having?: Prisma.ProductScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ProductCountAggregateInputType | true;
    _avg?: ProductAvgAggregateInputType;
    _sum?: ProductSumAggregateInputType;
    _min?: ProductMinAggregateInputType;
    _max?: ProductMaxAggregateInputType;
};
export type ProductGroupByOutputType = {
    id: string;
    name: string;
    description: string | null;
    barcode: string | null;
    sku: string | null;
    imageUrl: string | null;
    costPrice: runtime.Decimal;
    salePrice: runtime.Decimal;
    isPublic: boolean;
    tenantId: string;
    categoryId: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: ProductCountAggregateOutputType | null;
    _avg: ProductAvgAggregateOutputType | null;
    _sum: ProductSumAggregateOutputType | null;
    _min: ProductMinAggregateOutputType | null;
    _max: ProductMaxAggregateOutputType | null;
};
type GetProductGroupByPayload<T extends ProductGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ProductGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ProductGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ProductGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ProductGroupByOutputType[P]>;
}>>;
export type ProductWhereInput = {
    AND?: Prisma.ProductWhereInput | Prisma.ProductWhereInput[];
    OR?: Prisma.ProductWhereInput[];
    NOT?: Prisma.ProductWhereInput | Prisma.ProductWhereInput[];
    id?: Prisma.StringFilter<"Product"> | string;
    name?: Prisma.StringFilter<"Product"> | string;
    description?: Prisma.StringNullableFilter<"Product"> | string | null;
    barcode?: Prisma.StringNullableFilter<"Product"> | string | null;
    sku?: Prisma.StringNullableFilter<"Product"> | string | null;
    imageUrl?: Prisma.StringNullableFilter<"Product"> | string | null;
    costPrice?: Prisma.DecimalFilter<"Product"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    salePrice?: Prisma.DecimalFilter<"Product"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    isPublic?: Prisma.BoolFilter<"Product"> | boolean;
    tenantId?: Prisma.StringFilter<"Product"> | string;
    categoryId?: Prisma.StringNullableFilter<"Product"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"Product"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Product"> | Date | string;
    tenant?: Prisma.XOR<Prisma.TenantScalarRelationFilter, Prisma.TenantWhereInput>;
    category?: Prisma.XOR<Prisma.CategoryNullableScalarRelationFilter, Prisma.CategoryWhereInput> | null;
    inventory?: Prisma.StockListRelationFilter;
    invoiceItems?: Prisma.InvoiceItemListRelationFilter;
};
export type ProductOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrderInput | Prisma.SortOrder;
    barcode?: Prisma.SortOrderInput | Prisma.SortOrder;
    sku?: Prisma.SortOrderInput | Prisma.SortOrder;
    imageUrl?: Prisma.SortOrderInput | Prisma.SortOrder;
    costPrice?: Prisma.SortOrder;
    salePrice?: Prisma.SortOrder;
    isPublic?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    categoryId?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    tenant?: Prisma.TenantOrderByWithRelationInput;
    category?: Prisma.CategoryOrderByWithRelationInput;
    inventory?: Prisma.StockOrderByRelationAggregateInput;
    invoiceItems?: Prisma.InvoiceItemOrderByRelationAggregateInput;
};
export type ProductWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    barcode_tenantId?: Prisma.ProductBarcodeTenantIdCompoundUniqueInput;
    AND?: Prisma.ProductWhereInput | Prisma.ProductWhereInput[];
    OR?: Prisma.ProductWhereInput[];
    NOT?: Prisma.ProductWhereInput | Prisma.ProductWhereInput[];
    name?: Prisma.StringFilter<"Product"> | string;
    description?: Prisma.StringNullableFilter<"Product"> | string | null;
    barcode?: Prisma.StringNullableFilter<"Product"> | string | null;
    sku?: Prisma.StringNullableFilter<"Product"> | string | null;
    imageUrl?: Prisma.StringNullableFilter<"Product"> | string | null;
    costPrice?: Prisma.DecimalFilter<"Product"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    salePrice?: Prisma.DecimalFilter<"Product"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    isPublic?: Prisma.BoolFilter<"Product"> | boolean;
    tenantId?: Prisma.StringFilter<"Product"> | string;
    categoryId?: Prisma.StringNullableFilter<"Product"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"Product"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Product"> | Date | string;
    tenant?: Prisma.XOR<Prisma.TenantScalarRelationFilter, Prisma.TenantWhereInput>;
    category?: Prisma.XOR<Prisma.CategoryNullableScalarRelationFilter, Prisma.CategoryWhereInput> | null;
    inventory?: Prisma.StockListRelationFilter;
    invoiceItems?: Prisma.InvoiceItemListRelationFilter;
}, "id" | "barcode_tenantId">;
export type ProductOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrderInput | Prisma.SortOrder;
    barcode?: Prisma.SortOrderInput | Prisma.SortOrder;
    sku?: Prisma.SortOrderInput | Prisma.SortOrder;
    imageUrl?: Prisma.SortOrderInput | Prisma.SortOrder;
    costPrice?: Prisma.SortOrder;
    salePrice?: Prisma.SortOrder;
    isPublic?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    categoryId?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.ProductCountOrderByAggregateInput;
    _avg?: Prisma.ProductAvgOrderByAggregateInput;
    _max?: Prisma.ProductMaxOrderByAggregateInput;
    _min?: Prisma.ProductMinOrderByAggregateInput;
    _sum?: Prisma.ProductSumOrderByAggregateInput;
};
export type ProductScalarWhereWithAggregatesInput = {
    AND?: Prisma.ProductScalarWhereWithAggregatesInput | Prisma.ProductScalarWhereWithAggregatesInput[];
    OR?: Prisma.ProductScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ProductScalarWhereWithAggregatesInput | Prisma.ProductScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"Product"> | string;
    name?: Prisma.StringWithAggregatesFilter<"Product"> | string;
    description?: Prisma.StringNullableWithAggregatesFilter<"Product"> | string | null;
    barcode?: Prisma.StringNullableWithAggregatesFilter<"Product"> | string | null;
    sku?: Prisma.StringNullableWithAggregatesFilter<"Product"> | string | null;
    imageUrl?: Prisma.StringNullableWithAggregatesFilter<"Product"> | string | null;
    costPrice?: Prisma.DecimalWithAggregatesFilter<"Product"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    salePrice?: Prisma.DecimalWithAggregatesFilter<"Product"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    isPublic?: Prisma.BoolWithAggregatesFilter<"Product"> | boolean;
    tenantId?: Prisma.StringWithAggregatesFilter<"Product"> | string;
    categoryId?: Prisma.StringNullableWithAggregatesFilter<"Product"> | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Product"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"Product"> | Date | string;
};
export type ProductCreateInput = {
    id?: string;
    name: string;
    description?: string | null;
    barcode?: string | null;
    sku?: string | null;
    imageUrl?: string | null;
    costPrice?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    salePrice?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    isPublic?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    tenant: Prisma.TenantCreateNestedOneWithoutProductsInput;
    category?: Prisma.CategoryCreateNestedOneWithoutProductsInput;
    inventory?: Prisma.StockCreateNestedManyWithoutProductInput;
    invoiceItems?: Prisma.InvoiceItemCreateNestedManyWithoutProductInput;
};
export type ProductUncheckedCreateInput = {
    id?: string;
    name: string;
    description?: string | null;
    barcode?: string | null;
    sku?: string | null;
    imageUrl?: string | null;
    costPrice?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    salePrice?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    isPublic?: boolean;
    tenantId: string;
    categoryId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    inventory?: Prisma.StockUncheckedCreateNestedManyWithoutProductInput;
    invoiceItems?: Prisma.InvoiceItemUncheckedCreateNestedManyWithoutProductInput;
};
export type ProductUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    barcode?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    sku?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    imageUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    costPrice?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    salePrice?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    isPublic?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tenant?: Prisma.TenantUpdateOneRequiredWithoutProductsNestedInput;
    category?: Prisma.CategoryUpdateOneWithoutProductsNestedInput;
    inventory?: Prisma.StockUpdateManyWithoutProductNestedInput;
    invoiceItems?: Prisma.InvoiceItemUpdateManyWithoutProductNestedInput;
};
export type ProductUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    barcode?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    sku?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    imageUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    costPrice?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    salePrice?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    isPublic?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    categoryId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    inventory?: Prisma.StockUncheckedUpdateManyWithoutProductNestedInput;
    invoiceItems?: Prisma.InvoiceItemUncheckedUpdateManyWithoutProductNestedInput;
};
export type ProductCreateManyInput = {
    id?: string;
    name: string;
    description?: string | null;
    barcode?: string | null;
    sku?: string | null;
    imageUrl?: string | null;
    costPrice?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    salePrice?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    isPublic?: boolean;
    tenantId: string;
    categoryId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ProductUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    barcode?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    sku?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    imageUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    costPrice?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    salePrice?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    isPublic?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ProductUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    barcode?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    sku?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    imageUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    costPrice?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    salePrice?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    isPublic?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    categoryId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ProductListRelationFilter = {
    every?: Prisma.ProductWhereInput;
    some?: Prisma.ProductWhereInput;
    none?: Prisma.ProductWhereInput;
};
export type ProductOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ProductBarcodeTenantIdCompoundUniqueInput = {
    barcode: string;
    tenantId: string;
};
export type ProductCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    barcode?: Prisma.SortOrder;
    sku?: Prisma.SortOrder;
    imageUrl?: Prisma.SortOrder;
    costPrice?: Prisma.SortOrder;
    salePrice?: Prisma.SortOrder;
    isPublic?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    categoryId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ProductAvgOrderByAggregateInput = {
    costPrice?: Prisma.SortOrder;
    salePrice?: Prisma.SortOrder;
};
export type ProductMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    barcode?: Prisma.SortOrder;
    sku?: Prisma.SortOrder;
    imageUrl?: Prisma.SortOrder;
    costPrice?: Prisma.SortOrder;
    salePrice?: Prisma.SortOrder;
    isPublic?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    categoryId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ProductMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    barcode?: Prisma.SortOrder;
    sku?: Prisma.SortOrder;
    imageUrl?: Prisma.SortOrder;
    costPrice?: Prisma.SortOrder;
    salePrice?: Prisma.SortOrder;
    isPublic?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    categoryId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ProductSumOrderByAggregateInput = {
    costPrice?: Prisma.SortOrder;
    salePrice?: Prisma.SortOrder;
};
export type ProductScalarRelationFilter = {
    is?: Prisma.ProductWhereInput;
    isNot?: Prisma.ProductWhereInput;
};
export type ProductCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.ProductCreateWithoutTenantInput, Prisma.ProductUncheckedCreateWithoutTenantInput> | Prisma.ProductCreateWithoutTenantInput[] | Prisma.ProductUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ProductCreateOrConnectWithoutTenantInput | Prisma.ProductCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.ProductCreateManyTenantInputEnvelope;
    connect?: Prisma.ProductWhereUniqueInput | Prisma.ProductWhereUniqueInput[];
};
export type ProductUncheckedCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.ProductCreateWithoutTenantInput, Prisma.ProductUncheckedCreateWithoutTenantInput> | Prisma.ProductCreateWithoutTenantInput[] | Prisma.ProductUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ProductCreateOrConnectWithoutTenantInput | Prisma.ProductCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.ProductCreateManyTenantInputEnvelope;
    connect?: Prisma.ProductWhereUniqueInput | Prisma.ProductWhereUniqueInput[];
};
export type ProductUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.ProductCreateWithoutTenantInput, Prisma.ProductUncheckedCreateWithoutTenantInput> | Prisma.ProductCreateWithoutTenantInput[] | Prisma.ProductUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ProductCreateOrConnectWithoutTenantInput | Prisma.ProductCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.ProductUpsertWithWhereUniqueWithoutTenantInput | Prisma.ProductUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.ProductCreateManyTenantInputEnvelope;
    set?: Prisma.ProductWhereUniqueInput | Prisma.ProductWhereUniqueInput[];
    disconnect?: Prisma.ProductWhereUniqueInput | Prisma.ProductWhereUniqueInput[];
    delete?: Prisma.ProductWhereUniqueInput | Prisma.ProductWhereUniqueInput[];
    connect?: Prisma.ProductWhereUniqueInput | Prisma.ProductWhereUniqueInput[];
    update?: Prisma.ProductUpdateWithWhereUniqueWithoutTenantInput | Prisma.ProductUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.ProductUpdateManyWithWhereWithoutTenantInput | Prisma.ProductUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.ProductScalarWhereInput | Prisma.ProductScalarWhereInput[];
};
export type ProductUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.ProductCreateWithoutTenantInput, Prisma.ProductUncheckedCreateWithoutTenantInput> | Prisma.ProductCreateWithoutTenantInput[] | Prisma.ProductUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ProductCreateOrConnectWithoutTenantInput | Prisma.ProductCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.ProductUpsertWithWhereUniqueWithoutTenantInput | Prisma.ProductUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.ProductCreateManyTenantInputEnvelope;
    set?: Prisma.ProductWhereUniqueInput | Prisma.ProductWhereUniqueInput[];
    disconnect?: Prisma.ProductWhereUniqueInput | Prisma.ProductWhereUniqueInput[];
    delete?: Prisma.ProductWhereUniqueInput | Prisma.ProductWhereUniqueInput[];
    connect?: Prisma.ProductWhereUniqueInput | Prisma.ProductWhereUniqueInput[];
    update?: Prisma.ProductUpdateWithWhereUniqueWithoutTenantInput | Prisma.ProductUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.ProductUpdateManyWithWhereWithoutTenantInput | Prisma.ProductUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.ProductScalarWhereInput | Prisma.ProductScalarWhereInput[];
};
export type ProductCreateNestedManyWithoutCategoryInput = {
    create?: Prisma.XOR<Prisma.ProductCreateWithoutCategoryInput, Prisma.ProductUncheckedCreateWithoutCategoryInput> | Prisma.ProductCreateWithoutCategoryInput[] | Prisma.ProductUncheckedCreateWithoutCategoryInput[];
    connectOrCreate?: Prisma.ProductCreateOrConnectWithoutCategoryInput | Prisma.ProductCreateOrConnectWithoutCategoryInput[];
    createMany?: Prisma.ProductCreateManyCategoryInputEnvelope;
    connect?: Prisma.ProductWhereUniqueInput | Prisma.ProductWhereUniqueInput[];
};
export type ProductUncheckedCreateNestedManyWithoutCategoryInput = {
    create?: Prisma.XOR<Prisma.ProductCreateWithoutCategoryInput, Prisma.ProductUncheckedCreateWithoutCategoryInput> | Prisma.ProductCreateWithoutCategoryInput[] | Prisma.ProductUncheckedCreateWithoutCategoryInput[];
    connectOrCreate?: Prisma.ProductCreateOrConnectWithoutCategoryInput | Prisma.ProductCreateOrConnectWithoutCategoryInput[];
    createMany?: Prisma.ProductCreateManyCategoryInputEnvelope;
    connect?: Prisma.ProductWhereUniqueInput | Prisma.ProductWhereUniqueInput[];
};
export type ProductUpdateManyWithoutCategoryNestedInput = {
    create?: Prisma.XOR<Prisma.ProductCreateWithoutCategoryInput, Prisma.ProductUncheckedCreateWithoutCategoryInput> | Prisma.ProductCreateWithoutCategoryInput[] | Prisma.ProductUncheckedCreateWithoutCategoryInput[];
    connectOrCreate?: Prisma.ProductCreateOrConnectWithoutCategoryInput | Prisma.ProductCreateOrConnectWithoutCategoryInput[];
    upsert?: Prisma.ProductUpsertWithWhereUniqueWithoutCategoryInput | Prisma.ProductUpsertWithWhereUniqueWithoutCategoryInput[];
    createMany?: Prisma.ProductCreateManyCategoryInputEnvelope;
    set?: Prisma.ProductWhereUniqueInput | Prisma.ProductWhereUniqueInput[];
    disconnect?: Prisma.ProductWhereUniqueInput | Prisma.ProductWhereUniqueInput[];
    delete?: Prisma.ProductWhereUniqueInput | Prisma.ProductWhereUniqueInput[];
    connect?: Prisma.ProductWhereUniqueInput | Prisma.ProductWhereUniqueInput[];
    update?: Prisma.ProductUpdateWithWhereUniqueWithoutCategoryInput | Prisma.ProductUpdateWithWhereUniqueWithoutCategoryInput[];
    updateMany?: Prisma.ProductUpdateManyWithWhereWithoutCategoryInput | Prisma.ProductUpdateManyWithWhereWithoutCategoryInput[];
    deleteMany?: Prisma.ProductScalarWhereInput | Prisma.ProductScalarWhereInput[];
};
export type ProductUncheckedUpdateManyWithoutCategoryNestedInput = {
    create?: Prisma.XOR<Prisma.ProductCreateWithoutCategoryInput, Prisma.ProductUncheckedCreateWithoutCategoryInput> | Prisma.ProductCreateWithoutCategoryInput[] | Prisma.ProductUncheckedCreateWithoutCategoryInput[];
    connectOrCreate?: Prisma.ProductCreateOrConnectWithoutCategoryInput | Prisma.ProductCreateOrConnectWithoutCategoryInput[];
    upsert?: Prisma.ProductUpsertWithWhereUniqueWithoutCategoryInput | Prisma.ProductUpsertWithWhereUniqueWithoutCategoryInput[];
    createMany?: Prisma.ProductCreateManyCategoryInputEnvelope;
    set?: Prisma.ProductWhereUniqueInput | Prisma.ProductWhereUniqueInput[];
    disconnect?: Prisma.ProductWhereUniqueInput | Prisma.ProductWhereUniqueInput[];
    delete?: Prisma.ProductWhereUniqueInput | Prisma.ProductWhereUniqueInput[];
    connect?: Prisma.ProductWhereUniqueInput | Prisma.ProductWhereUniqueInput[];
    update?: Prisma.ProductUpdateWithWhereUniqueWithoutCategoryInput | Prisma.ProductUpdateWithWhereUniqueWithoutCategoryInput[];
    updateMany?: Prisma.ProductUpdateManyWithWhereWithoutCategoryInput | Prisma.ProductUpdateManyWithWhereWithoutCategoryInput[];
    deleteMany?: Prisma.ProductScalarWhereInput | Prisma.ProductScalarWhereInput[];
};
export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null;
};
export type DecimalFieldUpdateOperationsInput = {
    set?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    increment?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    decrement?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    multiply?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    divide?: runtime.Decimal | runtime.DecimalJsLike | number | string;
};
export type BoolFieldUpdateOperationsInput = {
    set?: boolean;
};
export type ProductCreateNestedOneWithoutInventoryInput = {
    create?: Prisma.XOR<Prisma.ProductCreateWithoutInventoryInput, Prisma.ProductUncheckedCreateWithoutInventoryInput>;
    connectOrCreate?: Prisma.ProductCreateOrConnectWithoutInventoryInput;
    connect?: Prisma.ProductWhereUniqueInput;
};
export type ProductUpdateOneRequiredWithoutInventoryNestedInput = {
    create?: Prisma.XOR<Prisma.ProductCreateWithoutInventoryInput, Prisma.ProductUncheckedCreateWithoutInventoryInput>;
    connectOrCreate?: Prisma.ProductCreateOrConnectWithoutInventoryInput;
    upsert?: Prisma.ProductUpsertWithoutInventoryInput;
    connect?: Prisma.ProductWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ProductUpdateToOneWithWhereWithoutInventoryInput, Prisma.ProductUpdateWithoutInventoryInput>, Prisma.ProductUncheckedUpdateWithoutInventoryInput>;
};
export type ProductCreateNestedOneWithoutInvoiceItemsInput = {
    create?: Prisma.XOR<Prisma.ProductCreateWithoutInvoiceItemsInput, Prisma.ProductUncheckedCreateWithoutInvoiceItemsInput>;
    connectOrCreate?: Prisma.ProductCreateOrConnectWithoutInvoiceItemsInput;
    connect?: Prisma.ProductWhereUniqueInput;
};
export type ProductUpdateOneRequiredWithoutInvoiceItemsNestedInput = {
    create?: Prisma.XOR<Prisma.ProductCreateWithoutInvoiceItemsInput, Prisma.ProductUncheckedCreateWithoutInvoiceItemsInput>;
    connectOrCreate?: Prisma.ProductCreateOrConnectWithoutInvoiceItemsInput;
    upsert?: Prisma.ProductUpsertWithoutInvoiceItemsInput;
    connect?: Prisma.ProductWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ProductUpdateToOneWithWhereWithoutInvoiceItemsInput, Prisma.ProductUpdateWithoutInvoiceItemsInput>, Prisma.ProductUncheckedUpdateWithoutInvoiceItemsInput>;
};
export type ProductCreateWithoutTenantInput = {
    id?: string;
    name: string;
    description?: string | null;
    barcode?: string | null;
    sku?: string | null;
    imageUrl?: string | null;
    costPrice?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    salePrice?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    isPublic?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    category?: Prisma.CategoryCreateNestedOneWithoutProductsInput;
    inventory?: Prisma.StockCreateNestedManyWithoutProductInput;
    invoiceItems?: Prisma.InvoiceItemCreateNestedManyWithoutProductInput;
};
export type ProductUncheckedCreateWithoutTenantInput = {
    id?: string;
    name: string;
    description?: string | null;
    barcode?: string | null;
    sku?: string | null;
    imageUrl?: string | null;
    costPrice?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    salePrice?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    isPublic?: boolean;
    categoryId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    inventory?: Prisma.StockUncheckedCreateNestedManyWithoutProductInput;
    invoiceItems?: Prisma.InvoiceItemUncheckedCreateNestedManyWithoutProductInput;
};
export type ProductCreateOrConnectWithoutTenantInput = {
    where: Prisma.ProductWhereUniqueInput;
    create: Prisma.XOR<Prisma.ProductCreateWithoutTenantInput, Prisma.ProductUncheckedCreateWithoutTenantInput>;
};
export type ProductCreateManyTenantInputEnvelope = {
    data: Prisma.ProductCreateManyTenantInput | Prisma.ProductCreateManyTenantInput[];
    skipDuplicates?: boolean;
};
export type ProductUpsertWithWhereUniqueWithoutTenantInput = {
    where: Prisma.ProductWhereUniqueInput;
    update: Prisma.XOR<Prisma.ProductUpdateWithoutTenantInput, Prisma.ProductUncheckedUpdateWithoutTenantInput>;
    create: Prisma.XOR<Prisma.ProductCreateWithoutTenantInput, Prisma.ProductUncheckedCreateWithoutTenantInput>;
};
export type ProductUpdateWithWhereUniqueWithoutTenantInput = {
    where: Prisma.ProductWhereUniqueInput;
    data: Prisma.XOR<Prisma.ProductUpdateWithoutTenantInput, Prisma.ProductUncheckedUpdateWithoutTenantInput>;
};
export type ProductUpdateManyWithWhereWithoutTenantInput = {
    where: Prisma.ProductScalarWhereInput;
    data: Prisma.XOR<Prisma.ProductUpdateManyMutationInput, Prisma.ProductUncheckedUpdateManyWithoutTenantInput>;
};
export type ProductScalarWhereInput = {
    AND?: Prisma.ProductScalarWhereInput | Prisma.ProductScalarWhereInput[];
    OR?: Prisma.ProductScalarWhereInput[];
    NOT?: Prisma.ProductScalarWhereInput | Prisma.ProductScalarWhereInput[];
    id?: Prisma.StringFilter<"Product"> | string;
    name?: Prisma.StringFilter<"Product"> | string;
    description?: Prisma.StringNullableFilter<"Product"> | string | null;
    barcode?: Prisma.StringNullableFilter<"Product"> | string | null;
    sku?: Prisma.StringNullableFilter<"Product"> | string | null;
    imageUrl?: Prisma.StringNullableFilter<"Product"> | string | null;
    costPrice?: Prisma.DecimalFilter<"Product"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    salePrice?: Prisma.DecimalFilter<"Product"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    isPublic?: Prisma.BoolFilter<"Product"> | boolean;
    tenantId?: Prisma.StringFilter<"Product"> | string;
    categoryId?: Prisma.StringNullableFilter<"Product"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"Product"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Product"> | Date | string;
};
export type ProductCreateWithoutCategoryInput = {
    id?: string;
    name: string;
    description?: string | null;
    barcode?: string | null;
    sku?: string | null;
    imageUrl?: string | null;
    costPrice?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    salePrice?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    isPublic?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    tenant: Prisma.TenantCreateNestedOneWithoutProductsInput;
    inventory?: Prisma.StockCreateNestedManyWithoutProductInput;
    invoiceItems?: Prisma.InvoiceItemCreateNestedManyWithoutProductInput;
};
export type ProductUncheckedCreateWithoutCategoryInput = {
    id?: string;
    name: string;
    description?: string | null;
    barcode?: string | null;
    sku?: string | null;
    imageUrl?: string | null;
    costPrice?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    salePrice?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    isPublic?: boolean;
    tenantId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    inventory?: Prisma.StockUncheckedCreateNestedManyWithoutProductInput;
    invoiceItems?: Prisma.InvoiceItemUncheckedCreateNestedManyWithoutProductInput;
};
export type ProductCreateOrConnectWithoutCategoryInput = {
    where: Prisma.ProductWhereUniqueInput;
    create: Prisma.XOR<Prisma.ProductCreateWithoutCategoryInput, Prisma.ProductUncheckedCreateWithoutCategoryInput>;
};
export type ProductCreateManyCategoryInputEnvelope = {
    data: Prisma.ProductCreateManyCategoryInput | Prisma.ProductCreateManyCategoryInput[];
    skipDuplicates?: boolean;
};
export type ProductUpsertWithWhereUniqueWithoutCategoryInput = {
    where: Prisma.ProductWhereUniqueInput;
    update: Prisma.XOR<Prisma.ProductUpdateWithoutCategoryInput, Prisma.ProductUncheckedUpdateWithoutCategoryInput>;
    create: Prisma.XOR<Prisma.ProductCreateWithoutCategoryInput, Prisma.ProductUncheckedCreateWithoutCategoryInput>;
};
export type ProductUpdateWithWhereUniqueWithoutCategoryInput = {
    where: Prisma.ProductWhereUniqueInput;
    data: Prisma.XOR<Prisma.ProductUpdateWithoutCategoryInput, Prisma.ProductUncheckedUpdateWithoutCategoryInput>;
};
export type ProductUpdateManyWithWhereWithoutCategoryInput = {
    where: Prisma.ProductScalarWhereInput;
    data: Prisma.XOR<Prisma.ProductUpdateManyMutationInput, Prisma.ProductUncheckedUpdateManyWithoutCategoryInput>;
};
export type ProductCreateWithoutInventoryInput = {
    id?: string;
    name: string;
    description?: string | null;
    barcode?: string | null;
    sku?: string | null;
    imageUrl?: string | null;
    costPrice?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    salePrice?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    isPublic?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    tenant: Prisma.TenantCreateNestedOneWithoutProductsInput;
    category?: Prisma.CategoryCreateNestedOneWithoutProductsInput;
    invoiceItems?: Prisma.InvoiceItemCreateNestedManyWithoutProductInput;
};
export type ProductUncheckedCreateWithoutInventoryInput = {
    id?: string;
    name: string;
    description?: string | null;
    barcode?: string | null;
    sku?: string | null;
    imageUrl?: string | null;
    costPrice?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    salePrice?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    isPublic?: boolean;
    tenantId: string;
    categoryId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    invoiceItems?: Prisma.InvoiceItemUncheckedCreateNestedManyWithoutProductInput;
};
export type ProductCreateOrConnectWithoutInventoryInput = {
    where: Prisma.ProductWhereUniqueInput;
    create: Prisma.XOR<Prisma.ProductCreateWithoutInventoryInput, Prisma.ProductUncheckedCreateWithoutInventoryInput>;
};
export type ProductUpsertWithoutInventoryInput = {
    update: Prisma.XOR<Prisma.ProductUpdateWithoutInventoryInput, Prisma.ProductUncheckedUpdateWithoutInventoryInput>;
    create: Prisma.XOR<Prisma.ProductCreateWithoutInventoryInput, Prisma.ProductUncheckedCreateWithoutInventoryInput>;
    where?: Prisma.ProductWhereInput;
};
export type ProductUpdateToOneWithWhereWithoutInventoryInput = {
    where?: Prisma.ProductWhereInput;
    data: Prisma.XOR<Prisma.ProductUpdateWithoutInventoryInput, Prisma.ProductUncheckedUpdateWithoutInventoryInput>;
};
export type ProductUpdateWithoutInventoryInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    barcode?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    sku?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    imageUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    costPrice?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    salePrice?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    isPublic?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tenant?: Prisma.TenantUpdateOneRequiredWithoutProductsNestedInput;
    category?: Prisma.CategoryUpdateOneWithoutProductsNestedInput;
    invoiceItems?: Prisma.InvoiceItemUpdateManyWithoutProductNestedInput;
};
export type ProductUncheckedUpdateWithoutInventoryInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    barcode?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    sku?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    imageUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    costPrice?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    salePrice?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    isPublic?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    categoryId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    invoiceItems?: Prisma.InvoiceItemUncheckedUpdateManyWithoutProductNestedInput;
};
export type ProductCreateWithoutInvoiceItemsInput = {
    id?: string;
    name: string;
    description?: string | null;
    barcode?: string | null;
    sku?: string | null;
    imageUrl?: string | null;
    costPrice?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    salePrice?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    isPublic?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    tenant: Prisma.TenantCreateNestedOneWithoutProductsInput;
    category?: Prisma.CategoryCreateNestedOneWithoutProductsInput;
    inventory?: Prisma.StockCreateNestedManyWithoutProductInput;
};
export type ProductUncheckedCreateWithoutInvoiceItemsInput = {
    id?: string;
    name: string;
    description?: string | null;
    barcode?: string | null;
    sku?: string | null;
    imageUrl?: string | null;
    costPrice?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    salePrice?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    isPublic?: boolean;
    tenantId: string;
    categoryId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    inventory?: Prisma.StockUncheckedCreateNestedManyWithoutProductInput;
};
export type ProductCreateOrConnectWithoutInvoiceItemsInput = {
    where: Prisma.ProductWhereUniqueInput;
    create: Prisma.XOR<Prisma.ProductCreateWithoutInvoiceItemsInput, Prisma.ProductUncheckedCreateWithoutInvoiceItemsInput>;
};
export type ProductUpsertWithoutInvoiceItemsInput = {
    update: Prisma.XOR<Prisma.ProductUpdateWithoutInvoiceItemsInput, Prisma.ProductUncheckedUpdateWithoutInvoiceItemsInput>;
    create: Prisma.XOR<Prisma.ProductCreateWithoutInvoiceItemsInput, Prisma.ProductUncheckedCreateWithoutInvoiceItemsInput>;
    where?: Prisma.ProductWhereInput;
};
export type ProductUpdateToOneWithWhereWithoutInvoiceItemsInput = {
    where?: Prisma.ProductWhereInput;
    data: Prisma.XOR<Prisma.ProductUpdateWithoutInvoiceItemsInput, Prisma.ProductUncheckedUpdateWithoutInvoiceItemsInput>;
};
export type ProductUpdateWithoutInvoiceItemsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    barcode?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    sku?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    imageUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    costPrice?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    salePrice?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    isPublic?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tenant?: Prisma.TenantUpdateOneRequiredWithoutProductsNestedInput;
    category?: Prisma.CategoryUpdateOneWithoutProductsNestedInput;
    inventory?: Prisma.StockUpdateManyWithoutProductNestedInput;
};
export type ProductUncheckedUpdateWithoutInvoiceItemsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    barcode?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    sku?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    imageUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    costPrice?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    salePrice?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    isPublic?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    categoryId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    inventory?: Prisma.StockUncheckedUpdateManyWithoutProductNestedInput;
};
export type ProductCreateManyTenantInput = {
    id?: string;
    name: string;
    description?: string | null;
    barcode?: string | null;
    sku?: string | null;
    imageUrl?: string | null;
    costPrice?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    salePrice?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    isPublic?: boolean;
    categoryId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ProductUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    barcode?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    sku?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    imageUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    costPrice?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    salePrice?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    isPublic?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    category?: Prisma.CategoryUpdateOneWithoutProductsNestedInput;
    inventory?: Prisma.StockUpdateManyWithoutProductNestedInput;
    invoiceItems?: Prisma.InvoiceItemUpdateManyWithoutProductNestedInput;
};
export type ProductUncheckedUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    barcode?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    sku?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    imageUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    costPrice?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    salePrice?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    isPublic?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    categoryId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    inventory?: Prisma.StockUncheckedUpdateManyWithoutProductNestedInput;
    invoiceItems?: Prisma.InvoiceItemUncheckedUpdateManyWithoutProductNestedInput;
};
export type ProductUncheckedUpdateManyWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    barcode?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    sku?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    imageUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    costPrice?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    salePrice?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    isPublic?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    categoryId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ProductCreateManyCategoryInput = {
    id?: string;
    name: string;
    description?: string | null;
    barcode?: string | null;
    sku?: string | null;
    imageUrl?: string | null;
    costPrice?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    salePrice?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    isPublic?: boolean;
    tenantId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ProductUpdateWithoutCategoryInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    barcode?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    sku?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    imageUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    costPrice?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    salePrice?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    isPublic?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tenant?: Prisma.TenantUpdateOneRequiredWithoutProductsNestedInput;
    inventory?: Prisma.StockUpdateManyWithoutProductNestedInput;
    invoiceItems?: Prisma.InvoiceItemUpdateManyWithoutProductNestedInput;
};
export type ProductUncheckedUpdateWithoutCategoryInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    barcode?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    sku?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    imageUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    costPrice?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    salePrice?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    isPublic?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    inventory?: Prisma.StockUncheckedUpdateManyWithoutProductNestedInput;
    invoiceItems?: Prisma.InvoiceItemUncheckedUpdateManyWithoutProductNestedInput;
};
export type ProductUncheckedUpdateManyWithoutCategoryInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    barcode?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    sku?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    imageUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    costPrice?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    salePrice?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    isPublic?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ProductCountOutputType = {
    inventory: number;
    invoiceItems: number;
};
export type ProductCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    inventory?: boolean | ProductCountOutputTypeCountInventoryArgs;
    invoiceItems?: boolean | ProductCountOutputTypeCountInvoiceItemsArgs;
};
export type ProductCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProductCountOutputTypeSelect<ExtArgs> | null;
};
export type ProductCountOutputTypeCountInventoryArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.StockWhereInput;
};
export type ProductCountOutputTypeCountInvoiceItemsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.InvoiceItemWhereInput;
};
export type ProductSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    description?: boolean;
    barcode?: boolean;
    sku?: boolean;
    imageUrl?: boolean;
    costPrice?: boolean;
    salePrice?: boolean;
    isPublic?: boolean;
    tenantId?: boolean;
    categoryId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    tenant?: boolean | Prisma.TenantDefaultArgs<ExtArgs>;
    category?: boolean | Prisma.Product$categoryArgs<ExtArgs>;
    inventory?: boolean | Prisma.Product$inventoryArgs<ExtArgs>;
    invoiceItems?: boolean | Prisma.Product$invoiceItemsArgs<ExtArgs>;
    _count?: boolean | Prisma.ProductCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["product"]>;
export type ProductSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    description?: boolean;
    barcode?: boolean;
    sku?: boolean;
    imageUrl?: boolean;
    costPrice?: boolean;
    salePrice?: boolean;
    isPublic?: boolean;
    tenantId?: boolean;
    categoryId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    tenant?: boolean | Prisma.TenantDefaultArgs<ExtArgs>;
    category?: boolean | Prisma.Product$categoryArgs<ExtArgs>;
}, ExtArgs["result"]["product"]>;
export type ProductSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    description?: boolean;
    barcode?: boolean;
    sku?: boolean;
    imageUrl?: boolean;
    costPrice?: boolean;
    salePrice?: boolean;
    isPublic?: boolean;
    tenantId?: boolean;
    categoryId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    tenant?: boolean | Prisma.TenantDefaultArgs<ExtArgs>;
    category?: boolean | Prisma.Product$categoryArgs<ExtArgs>;
}, ExtArgs["result"]["product"]>;
export type ProductSelectScalar = {
    id?: boolean;
    name?: boolean;
    description?: boolean;
    barcode?: boolean;
    sku?: boolean;
    imageUrl?: boolean;
    costPrice?: boolean;
    salePrice?: boolean;
    isPublic?: boolean;
    tenantId?: boolean;
    categoryId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type ProductOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "name" | "description" | "barcode" | "sku" | "imageUrl" | "costPrice" | "salePrice" | "isPublic" | "tenantId" | "categoryId" | "createdAt" | "updatedAt", ExtArgs["result"]["product"]>;
export type ProductInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    tenant?: boolean | Prisma.TenantDefaultArgs<ExtArgs>;
    category?: boolean | Prisma.Product$categoryArgs<ExtArgs>;
    inventory?: boolean | Prisma.Product$inventoryArgs<ExtArgs>;
    invoiceItems?: boolean | Prisma.Product$invoiceItemsArgs<ExtArgs>;
    _count?: boolean | Prisma.ProductCountOutputTypeDefaultArgs<ExtArgs>;
};
export type ProductIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    tenant?: boolean | Prisma.TenantDefaultArgs<ExtArgs>;
    category?: boolean | Prisma.Product$categoryArgs<ExtArgs>;
};
export type ProductIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    tenant?: boolean | Prisma.TenantDefaultArgs<ExtArgs>;
    category?: boolean | Prisma.Product$categoryArgs<ExtArgs>;
};
export type $ProductPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Product";
    objects: {
        tenant: Prisma.$TenantPayload<ExtArgs>;
        category: Prisma.$CategoryPayload<ExtArgs> | null;
        inventory: Prisma.$StockPayload<ExtArgs>[];
        invoiceItems: Prisma.$InvoiceItemPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        name: string;
        description: string | null;
        barcode: string | null;
        sku: string | null;
        imageUrl: string | null;
        costPrice: runtime.Decimal;
        salePrice: runtime.Decimal;
        isPublic: boolean;
        tenantId: string;
        categoryId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["product"]>;
    composites: {};
};
export type ProductGetPayload<S extends boolean | null | undefined | ProductDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ProductPayload, S>;
export type ProductCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ProductFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ProductCountAggregateInputType | true;
};
export interface ProductDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Product'];
        meta: {
            name: 'Product';
        };
    };
    findUnique<T extends ProductFindUniqueArgs>(args: Prisma.SelectSubset<T, ProductFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ProductClient<runtime.Types.Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ProductFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ProductFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ProductClient<runtime.Types.Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ProductFindFirstArgs>(args?: Prisma.SelectSubset<T, ProductFindFirstArgs<ExtArgs>>): Prisma.Prisma__ProductClient<runtime.Types.Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ProductFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ProductFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ProductClient<runtime.Types.Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ProductFindManyArgs>(args?: Prisma.SelectSubset<T, ProductFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ProductCreateArgs>(args: Prisma.SelectSubset<T, ProductCreateArgs<ExtArgs>>): Prisma.Prisma__ProductClient<runtime.Types.Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ProductCreateManyArgs>(args?: Prisma.SelectSubset<T, ProductCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ProductCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ProductCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ProductDeleteArgs>(args: Prisma.SelectSubset<T, ProductDeleteArgs<ExtArgs>>): Prisma.Prisma__ProductClient<runtime.Types.Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ProductUpdateArgs>(args: Prisma.SelectSubset<T, ProductUpdateArgs<ExtArgs>>): Prisma.Prisma__ProductClient<runtime.Types.Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ProductDeleteManyArgs>(args?: Prisma.SelectSubset<T, ProductDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ProductUpdateManyArgs>(args: Prisma.SelectSubset<T, ProductUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ProductUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ProductUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ProductUpsertArgs>(args: Prisma.SelectSubset<T, ProductUpsertArgs<ExtArgs>>): Prisma.Prisma__ProductClient<runtime.Types.Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ProductCountArgs>(args?: Prisma.Subset<T, ProductCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ProductCountAggregateOutputType> : number>;
    aggregate<T extends ProductAggregateArgs>(args: Prisma.Subset<T, ProductAggregateArgs>): Prisma.PrismaPromise<GetProductAggregateType<T>>;
    groupBy<T extends ProductGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ProductGroupByArgs['orderBy'];
    } : {
        orderBy?: ProductGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ProductGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProductGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ProductFieldRefs;
}
export interface Prisma__ProductClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    tenant<T extends Prisma.TenantDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TenantDefaultArgs<ExtArgs>>): Prisma.Prisma__TenantClient<runtime.Types.Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    category<T extends Prisma.Product$categoryArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Product$categoryArgs<ExtArgs>>): Prisma.Prisma__CategoryClient<runtime.Types.Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    inventory<T extends Prisma.Product$inventoryArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Product$inventoryArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$StockPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    invoiceItems<T extends Prisma.Product$invoiceItemsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Product$invoiceItemsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$InvoiceItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ProductFieldRefs {
    readonly id: Prisma.FieldRef<"Product", 'String'>;
    readonly name: Prisma.FieldRef<"Product", 'String'>;
    readonly description: Prisma.FieldRef<"Product", 'String'>;
    readonly barcode: Prisma.FieldRef<"Product", 'String'>;
    readonly sku: Prisma.FieldRef<"Product", 'String'>;
    readonly imageUrl: Prisma.FieldRef<"Product", 'String'>;
    readonly costPrice: Prisma.FieldRef<"Product", 'Decimal'>;
    readonly salePrice: Prisma.FieldRef<"Product", 'Decimal'>;
    readonly isPublic: Prisma.FieldRef<"Product", 'Boolean'>;
    readonly tenantId: Prisma.FieldRef<"Product", 'String'>;
    readonly categoryId: Prisma.FieldRef<"Product", 'String'>;
    readonly createdAt: Prisma.FieldRef<"Product", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"Product", 'DateTime'>;
}
export type ProductFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProductSelect<ExtArgs> | null;
    omit?: Prisma.ProductOmit<ExtArgs> | null;
    include?: Prisma.ProductInclude<ExtArgs> | null;
    where: Prisma.ProductWhereUniqueInput;
};
export type ProductFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProductSelect<ExtArgs> | null;
    omit?: Prisma.ProductOmit<ExtArgs> | null;
    include?: Prisma.ProductInclude<ExtArgs> | null;
    where: Prisma.ProductWhereUniqueInput;
};
export type ProductFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProductSelect<ExtArgs> | null;
    omit?: Prisma.ProductOmit<ExtArgs> | null;
    include?: Prisma.ProductInclude<ExtArgs> | null;
    where?: Prisma.ProductWhereInput;
    orderBy?: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[];
    cursor?: Prisma.ProductWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ProductScalarFieldEnum | Prisma.ProductScalarFieldEnum[];
};
export type ProductFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProductSelect<ExtArgs> | null;
    omit?: Prisma.ProductOmit<ExtArgs> | null;
    include?: Prisma.ProductInclude<ExtArgs> | null;
    where?: Prisma.ProductWhereInput;
    orderBy?: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[];
    cursor?: Prisma.ProductWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ProductScalarFieldEnum | Prisma.ProductScalarFieldEnum[];
};
export type ProductFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProductSelect<ExtArgs> | null;
    omit?: Prisma.ProductOmit<ExtArgs> | null;
    include?: Prisma.ProductInclude<ExtArgs> | null;
    where?: Prisma.ProductWhereInput;
    orderBy?: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[];
    cursor?: Prisma.ProductWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ProductScalarFieldEnum | Prisma.ProductScalarFieldEnum[];
};
export type ProductCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProductSelect<ExtArgs> | null;
    omit?: Prisma.ProductOmit<ExtArgs> | null;
    include?: Prisma.ProductInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ProductCreateInput, Prisma.ProductUncheckedCreateInput>;
};
export type ProductCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ProductCreateManyInput | Prisma.ProductCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ProductCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProductSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ProductOmit<ExtArgs> | null;
    data: Prisma.ProductCreateManyInput | Prisma.ProductCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.ProductIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type ProductUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProductSelect<ExtArgs> | null;
    omit?: Prisma.ProductOmit<ExtArgs> | null;
    include?: Prisma.ProductInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ProductUpdateInput, Prisma.ProductUncheckedUpdateInput>;
    where: Prisma.ProductWhereUniqueInput;
};
export type ProductUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ProductUpdateManyMutationInput, Prisma.ProductUncheckedUpdateManyInput>;
    where?: Prisma.ProductWhereInput;
    limit?: number;
};
export type ProductUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProductSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ProductOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ProductUpdateManyMutationInput, Prisma.ProductUncheckedUpdateManyInput>;
    where?: Prisma.ProductWhereInput;
    limit?: number;
    include?: Prisma.ProductIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type ProductUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProductSelect<ExtArgs> | null;
    omit?: Prisma.ProductOmit<ExtArgs> | null;
    include?: Prisma.ProductInclude<ExtArgs> | null;
    where: Prisma.ProductWhereUniqueInput;
    create: Prisma.XOR<Prisma.ProductCreateInput, Prisma.ProductUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ProductUpdateInput, Prisma.ProductUncheckedUpdateInput>;
};
export type ProductDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProductSelect<ExtArgs> | null;
    omit?: Prisma.ProductOmit<ExtArgs> | null;
    include?: Prisma.ProductInclude<ExtArgs> | null;
    where: Prisma.ProductWhereUniqueInput;
};
export type ProductDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ProductWhereInput;
    limit?: number;
};
export type Product$categoryArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CategorySelect<ExtArgs> | null;
    omit?: Prisma.CategoryOmit<ExtArgs> | null;
    include?: Prisma.CategoryInclude<ExtArgs> | null;
    where?: Prisma.CategoryWhereInput;
};
export type Product$inventoryArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StockSelect<ExtArgs> | null;
    omit?: Prisma.StockOmit<ExtArgs> | null;
    include?: Prisma.StockInclude<ExtArgs> | null;
    where?: Prisma.StockWhereInput;
    orderBy?: Prisma.StockOrderByWithRelationInput | Prisma.StockOrderByWithRelationInput[];
    cursor?: Prisma.StockWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.StockScalarFieldEnum | Prisma.StockScalarFieldEnum[];
};
export type Product$invoiceItemsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InvoiceItemSelect<ExtArgs> | null;
    omit?: Prisma.InvoiceItemOmit<ExtArgs> | null;
    include?: Prisma.InvoiceItemInclude<ExtArgs> | null;
    where?: Prisma.InvoiceItemWhereInput;
    orderBy?: Prisma.InvoiceItemOrderByWithRelationInput | Prisma.InvoiceItemOrderByWithRelationInput[];
    cursor?: Prisma.InvoiceItemWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.InvoiceItemScalarFieldEnum | Prisma.InvoiceItemScalarFieldEnum[];
};
export type ProductDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProductSelect<ExtArgs> | null;
    omit?: Prisma.ProductOmit<ExtArgs> | null;
    include?: Prisma.ProductInclude<ExtArgs> | null;
};
export {};

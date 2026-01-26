import type * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../internal/prismaNamespace.js";
export type StockModel = runtime.Types.Result.DefaultSelection<Prisma.$StockPayload>;
export type AggregateStock = {
    _count: StockCountAggregateOutputType | null;
    _avg: StockAvgAggregateOutputType | null;
    _sum: StockSumAggregateOutputType | null;
    _min: StockMinAggregateOutputType | null;
    _max: StockMaxAggregateOutputType | null;
};
export type StockAvgAggregateOutputType = {
    quantity: number | null;
};
export type StockSumAggregateOutputType = {
    quantity: number | null;
};
export type StockMinAggregateOutputType = {
    id: string | null;
    quantity: number | null;
    productId: string | null;
    warehouseId: string | null;
};
export type StockMaxAggregateOutputType = {
    id: string | null;
    quantity: number | null;
    productId: string | null;
    warehouseId: string | null;
};
export type StockCountAggregateOutputType = {
    id: number;
    quantity: number;
    productId: number;
    warehouseId: number;
    _all: number;
};
export type StockAvgAggregateInputType = {
    quantity?: true;
};
export type StockSumAggregateInputType = {
    quantity?: true;
};
export type StockMinAggregateInputType = {
    id?: true;
    quantity?: true;
    productId?: true;
    warehouseId?: true;
};
export type StockMaxAggregateInputType = {
    id?: true;
    quantity?: true;
    productId?: true;
    warehouseId?: true;
};
export type StockCountAggregateInputType = {
    id?: true;
    quantity?: true;
    productId?: true;
    warehouseId?: true;
    _all?: true;
};
export type StockAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.StockWhereInput;
    orderBy?: Prisma.StockOrderByWithRelationInput | Prisma.StockOrderByWithRelationInput[];
    cursor?: Prisma.StockWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | StockCountAggregateInputType;
    _avg?: StockAvgAggregateInputType;
    _sum?: StockSumAggregateInputType;
    _min?: StockMinAggregateInputType;
    _max?: StockMaxAggregateInputType;
};
export type GetStockAggregateType<T extends StockAggregateArgs> = {
    [P in keyof T & keyof AggregateStock]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateStock[P]> : Prisma.GetScalarType<T[P], AggregateStock[P]>;
};
export type StockGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.StockWhereInput;
    orderBy?: Prisma.StockOrderByWithAggregationInput | Prisma.StockOrderByWithAggregationInput[];
    by: Prisma.StockScalarFieldEnum[] | Prisma.StockScalarFieldEnum;
    having?: Prisma.StockScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: StockCountAggregateInputType | true;
    _avg?: StockAvgAggregateInputType;
    _sum?: StockSumAggregateInputType;
    _min?: StockMinAggregateInputType;
    _max?: StockMaxAggregateInputType;
};
export type StockGroupByOutputType = {
    id: string;
    quantity: number;
    productId: string;
    warehouseId: string;
    _count: StockCountAggregateOutputType | null;
    _avg: StockAvgAggregateOutputType | null;
    _sum: StockSumAggregateOutputType | null;
    _min: StockMinAggregateOutputType | null;
    _max: StockMaxAggregateOutputType | null;
};
type GetStockGroupByPayload<T extends StockGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<StockGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof StockGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], StockGroupByOutputType[P]> : Prisma.GetScalarType<T[P], StockGroupByOutputType[P]>;
}>>;
export type StockWhereInput = {
    AND?: Prisma.StockWhereInput | Prisma.StockWhereInput[];
    OR?: Prisma.StockWhereInput[];
    NOT?: Prisma.StockWhereInput | Prisma.StockWhereInput[];
    id?: Prisma.StringFilter<"Stock"> | string;
    quantity?: Prisma.IntFilter<"Stock"> | number;
    productId?: Prisma.StringFilter<"Stock"> | string;
    warehouseId?: Prisma.StringFilter<"Stock"> | string;
    product?: Prisma.XOR<Prisma.ProductScalarRelationFilter, Prisma.ProductWhereInput>;
    warehouse?: Prisma.XOR<Prisma.WarehouseScalarRelationFilter, Prisma.WarehouseWhereInput>;
};
export type StockOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    productId?: Prisma.SortOrder;
    warehouseId?: Prisma.SortOrder;
    product?: Prisma.ProductOrderByWithRelationInput;
    warehouse?: Prisma.WarehouseOrderByWithRelationInput;
};
export type StockWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    productId_warehouseId?: Prisma.StockProductIdWarehouseIdCompoundUniqueInput;
    AND?: Prisma.StockWhereInput | Prisma.StockWhereInput[];
    OR?: Prisma.StockWhereInput[];
    NOT?: Prisma.StockWhereInput | Prisma.StockWhereInput[];
    quantity?: Prisma.IntFilter<"Stock"> | number;
    productId?: Prisma.StringFilter<"Stock"> | string;
    warehouseId?: Prisma.StringFilter<"Stock"> | string;
    product?: Prisma.XOR<Prisma.ProductScalarRelationFilter, Prisma.ProductWhereInput>;
    warehouse?: Prisma.XOR<Prisma.WarehouseScalarRelationFilter, Prisma.WarehouseWhereInput>;
}, "id" | "productId_warehouseId">;
export type StockOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    productId?: Prisma.SortOrder;
    warehouseId?: Prisma.SortOrder;
    _count?: Prisma.StockCountOrderByAggregateInput;
    _avg?: Prisma.StockAvgOrderByAggregateInput;
    _max?: Prisma.StockMaxOrderByAggregateInput;
    _min?: Prisma.StockMinOrderByAggregateInput;
    _sum?: Prisma.StockSumOrderByAggregateInput;
};
export type StockScalarWhereWithAggregatesInput = {
    AND?: Prisma.StockScalarWhereWithAggregatesInput | Prisma.StockScalarWhereWithAggregatesInput[];
    OR?: Prisma.StockScalarWhereWithAggregatesInput[];
    NOT?: Prisma.StockScalarWhereWithAggregatesInput | Prisma.StockScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"Stock"> | string;
    quantity?: Prisma.IntWithAggregatesFilter<"Stock"> | number;
    productId?: Prisma.StringWithAggregatesFilter<"Stock"> | string;
    warehouseId?: Prisma.StringWithAggregatesFilter<"Stock"> | string;
};
export type StockCreateInput = {
    id?: string;
    quantity?: number;
    product: Prisma.ProductCreateNestedOneWithoutInventoryInput;
    warehouse: Prisma.WarehouseCreateNestedOneWithoutStocksInput;
};
export type StockUncheckedCreateInput = {
    id?: string;
    quantity?: number;
    productId: string;
    warehouseId: string;
};
export type StockUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    product?: Prisma.ProductUpdateOneRequiredWithoutInventoryNestedInput;
    warehouse?: Prisma.WarehouseUpdateOneRequiredWithoutStocksNestedInput;
};
export type StockUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    productId?: Prisma.StringFieldUpdateOperationsInput | string;
    warehouseId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type StockCreateManyInput = {
    id?: string;
    quantity?: number;
    productId: string;
    warehouseId: string;
};
export type StockUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type StockUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    productId?: Prisma.StringFieldUpdateOperationsInput | string;
    warehouseId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type StockListRelationFilter = {
    every?: Prisma.StockWhereInput;
    some?: Prisma.StockWhereInput;
    none?: Prisma.StockWhereInput;
};
export type StockOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type StockProductIdWarehouseIdCompoundUniqueInput = {
    productId: string;
    warehouseId: string;
};
export type StockCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    productId?: Prisma.SortOrder;
    warehouseId?: Prisma.SortOrder;
};
export type StockAvgOrderByAggregateInput = {
    quantity?: Prisma.SortOrder;
};
export type StockMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    productId?: Prisma.SortOrder;
    warehouseId?: Prisma.SortOrder;
};
export type StockMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    productId?: Prisma.SortOrder;
    warehouseId?: Prisma.SortOrder;
};
export type StockSumOrderByAggregateInput = {
    quantity?: Prisma.SortOrder;
};
export type StockCreateNestedManyWithoutProductInput = {
    create?: Prisma.XOR<Prisma.StockCreateWithoutProductInput, Prisma.StockUncheckedCreateWithoutProductInput> | Prisma.StockCreateWithoutProductInput[] | Prisma.StockUncheckedCreateWithoutProductInput[];
    connectOrCreate?: Prisma.StockCreateOrConnectWithoutProductInput | Prisma.StockCreateOrConnectWithoutProductInput[];
    createMany?: Prisma.StockCreateManyProductInputEnvelope;
    connect?: Prisma.StockWhereUniqueInput | Prisma.StockWhereUniqueInput[];
};
export type StockUncheckedCreateNestedManyWithoutProductInput = {
    create?: Prisma.XOR<Prisma.StockCreateWithoutProductInput, Prisma.StockUncheckedCreateWithoutProductInput> | Prisma.StockCreateWithoutProductInput[] | Prisma.StockUncheckedCreateWithoutProductInput[];
    connectOrCreate?: Prisma.StockCreateOrConnectWithoutProductInput | Prisma.StockCreateOrConnectWithoutProductInput[];
    createMany?: Prisma.StockCreateManyProductInputEnvelope;
    connect?: Prisma.StockWhereUniqueInput | Prisma.StockWhereUniqueInput[];
};
export type StockUpdateManyWithoutProductNestedInput = {
    create?: Prisma.XOR<Prisma.StockCreateWithoutProductInput, Prisma.StockUncheckedCreateWithoutProductInput> | Prisma.StockCreateWithoutProductInput[] | Prisma.StockUncheckedCreateWithoutProductInput[];
    connectOrCreate?: Prisma.StockCreateOrConnectWithoutProductInput | Prisma.StockCreateOrConnectWithoutProductInput[];
    upsert?: Prisma.StockUpsertWithWhereUniqueWithoutProductInput | Prisma.StockUpsertWithWhereUniqueWithoutProductInput[];
    createMany?: Prisma.StockCreateManyProductInputEnvelope;
    set?: Prisma.StockWhereUniqueInput | Prisma.StockWhereUniqueInput[];
    disconnect?: Prisma.StockWhereUniqueInput | Prisma.StockWhereUniqueInput[];
    delete?: Prisma.StockWhereUniqueInput | Prisma.StockWhereUniqueInput[];
    connect?: Prisma.StockWhereUniqueInput | Prisma.StockWhereUniqueInput[];
    update?: Prisma.StockUpdateWithWhereUniqueWithoutProductInput | Prisma.StockUpdateWithWhereUniqueWithoutProductInput[];
    updateMany?: Prisma.StockUpdateManyWithWhereWithoutProductInput | Prisma.StockUpdateManyWithWhereWithoutProductInput[];
    deleteMany?: Prisma.StockScalarWhereInput | Prisma.StockScalarWhereInput[];
};
export type StockUncheckedUpdateManyWithoutProductNestedInput = {
    create?: Prisma.XOR<Prisma.StockCreateWithoutProductInput, Prisma.StockUncheckedCreateWithoutProductInput> | Prisma.StockCreateWithoutProductInput[] | Prisma.StockUncheckedCreateWithoutProductInput[];
    connectOrCreate?: Prisma.StockCreateOrConnectWithoutProductInput | Prisma.StockCreateOrConnectWithoutProductInput[];
    upsert?: Prisma.StockUpsertWithWhereUniqueWithoutProductInput | Prisma.StockUpsertWithWhereUniqueWithoutProductInput[];
    createMany?: Prisma.StockCreateManyProductInputEnvelope;
    set?: Prisma.StockWhereUniqueInput | Prisma.StockWhereUniqueInput[];
    disconnect?: Prisma.StockWhereUniqueInput | Prisma.StockWhereUniqueInput[];
    delete?: Prisma.StockWhereUniqueInput | Prisma.StockWhereUniqueInput[];
    connect?: Prisma.StockWhereUniqueInput | Prisma.StockWhereUniqueInput[];
    update?: Prisma.StockUpdateWithWhereUniqueWithoutProductInput | Prisma.StockUpdateWithWhereUniqueWithoutProductInput[];
    updateMany?: Prisma.StockUpdateManyWithWhereWithoutProductInput | Prisma.StockUpdateManyWithWhereWithoutProductInput[];
    deleteMany?: Prisma.StockScalarWhereInput | Prisma.StockScalarWhereInput[];
};
export type StockCreateNestedManyWithoutWarehouseInput = {
    create?: Prisma.XOR<Prisma.StockCreateWithoutWarehouseInput, Prisma.StockUncheckedCreateWithoutWarehouseInput> | Prisma.StockCreateWithoutWarehouseInput[] | Prisma.StockUncheckedCreateWithoutWarehouseInput[];
    connectOrCreate?: Prisma.StockCreateOrConnectWithoutWarehouseInput | Prisma.StockCreateOrConnectWithoutWarehouseInput[];
    createMany?: Prisma.StockCreateManyWarehouseInputEnvelope;
    connect?: Prisma.StockWhereUniqueInput | Prisma.StockWhereUniqueInput[];
};
export type StockUncheckedCreateNestedManyWithoutWarehouseInput = {
    create?: Prisma.XOR<Prisma.StockCreateWithoutWarehouseInput, Prisma.StockUncheckedCreateWithoutWarehouseInput> | Prisma.StockCreateWithoutWarehouseInput[] | Prisma.StockUncheckedCreateWithoutWarehouseInput[];
    connectOrCreate?: Prisma.StockCreateOrConnectWithoutWarehouseInput | Prisma.StockCreateOrConnectWithoutWarehouseInput[];
    createMany?: Prisma.StockCreateManyWarehouseInputEnvelope;
    connect?: Prisma.StockWhereUniqueInput | Prisma.StockWhereUniqueInput[];
};
export type StockUpdateManyWithoutWarehouseNestedInput = {
    create?: Prisma.XOR<Prisma.StockCreateWithoutWarehouseInput, Prisma.StockUncheckedCreateWithoutWarehouseInput> | Prisma.StockCreateWithoutWarehouseInput[] | Prisma.StockUncheckedCreateWithoutWarehouseInput[];
    connectOrCreate?: Prisma.StockCreateOrConnectWithoutWarehouseInput | Prisma.StockCreateOrConnectWithoutWarehouseInput[];
    upsert?: Prisma.StockUpsertWithWhereUniqueWithoutWarehouseInput | Prisma.StockUpsertWithWhereUniqueWithoutWarehouseInput[];
    createMany?: Prisma.StockCreateManyWarehouseInputEnvelope;
    set?: Prisma.StockWhereUniqueInput | Prisma.StockWhereUniqueInput[];
    disconnect?: Prisma.StockWhereUniqueInput | Prisma.StockWhereUniqueInput[];
    delete?: Prisma.StockWhereUniqueInput | Prisma.StockWhereUniqueInput[];
    connect?: Prisma.StockWhereUniqueInput | Prisma.StockWhereUniqueInput[];
    update?: Prisma.StockUpdateWithWhereUniqueWithoutWarehouseInput | Prisma.StockUpdateWithWhereUniqueWithoutWarehouseInput[];
    updateMany?: Prisma.StockUpdateManyWithWhereWithoutWarehouseInput | Prisma.StockUpdateManyWithWhereWithoutWarehouseInput[];
    deleteMany?: Prisma.StockScalarWhereInput | Prisma.StockScalarWhereInput[];
};
export type StockUncheckedUpdateManyWithoutWarehouseNestedInput = {
    create?: Prisma.XOR<Prisma.StockCreateWithoutWarehouseInput, Prisma.StockUncheckedCreateWithoutWarehouseInput> | Prisma.StockCreateWithoutWarehouseInput[] | Prisma.StockUncheckedCreateWithoutWarehouseInput[];
    connectOrCreate?: Prisma.StockCreateOrConnectWithoutWarehouseInput | Prisma.StockCreateOrConnectWithoutWarehouseInput[];
    upsert?: Prisma.StockUpsertWithWhereUniqueWithoutWarehouseInput | Prisma.StockUpsertWithWhereUniqueWithoutWarehouseInput[];
    createMany?: Prisma.StockCreateManyWarehouseInputEnvelope;
    set?: Prisma.StockWhereUniqueInput | Prisma.StockWhereUniqueInput[];
    disconnect?: Prisma.StockWhereUniqueInput | Prisma.StockWhereUniqueInput[];
    delete?: Prisma.StockWhereUniqueInput | Prisma.StockWhereUniqueInput[];
    connect?: Prisma.StockWhereUniqueInput | Prisma.StockWhereUniqueInput[];
    update?: Prisma.StockUpdateWithWhereUniqueWithoutWarehouseInput | Prisma.StockUpdateWithWhereUniqueWithoutWarehouseInput[];
    updateMany?: Prisma.StockUpdateManyWithWhereWithoutWarehouseInput | Prisma.StockUpdateManyWithWhereWithoutWarehouseInput[];
    deleteMany?: Prisma.StockScalarWhereInput | Prisma.StockScalarWhereInput[];
};
export type IntFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type StockCreateWithoutProductInput = {
    id?: string;
    quantity?: number;
    warehouse: Prisma.WarehouseCreateNestedOneWithoutStocksInput;
};
export type StockUncheckedCreateWithoutProductInput = {
    id?: string;
    quantity?: number;
    warehouseId: string;
};
export type StockCreateOrConnectWithoutProductInput = {
    where: Prisma.StockWhereUniqueInput;
    create: Prisma.XOR<Prisma.StockCreateWithoutProductInput, Prisma.StockUncheckedCreateWithoutProductInput>;
};
export type StockCreateManyProductInputEnvelope = {
    data: Prisma.StockCreateManyProductInput | Prisma.StockCreateManyProductInput[];
    skipDuplicates?: boolean;
};
export type StockUpsertWithWhereUniqueWithoutProductInput = {
    where: Prisma.StockWhereUniqueInput;
    update: Prisma.XOR<Prisma.StockUpdateWithoutProductInput, Prisma.StockUncheckedUpdateWithoutProductInput>;
    create: Prisma.XOR<Prisma.StockCreateWithoutProductInput, Prisma.StockUncheckedCreateWithoutProductInput>;
};
export type StockUpdateWithWhereUniqueWithoutProductInput = {
    where: Prisma.StockWhereUniqueInput;
    data: Prisma.XOR<Prisma.StockUpdateWithoutProductInput, Prisma.StockUncheckedUpdateWithoutProductInput>;
};
export type StockUpdateManyWithWhereWithoutProductInput = {
    where: Prisma.StockScalarWhereInput;
    data: Prisma.XOR<Prisma.StockUpdateManyMutationInput, Prisma.StockUncheckedUpdateManyWithoutProductInput>;
};
export type StockScalarWhereInput = {
    AND?: Prisma.StockScalarWhereInput | Prisma.StockScalarWhereInput[];
    OR?: Prisma.StockScalarWhereInput[];
    NOT?: Prisma.StockScalarWhereInput | Prisma.StockScalarWhereInput[];
    id?: Prisma.StringFilter<"Stock"> | string;
    quantity?: Prisma.IntFilter<"Stock"> | number;
    productId?: Prisma.StringFilter<"Stock"> | string;
    warehouseId?: Prisma.StringFilter<"Stock"> | string;
};
export type StockCreateWithoutWarehouseInput = {
    id?: string;
    quantity?: number;
    product: Prisma.ProductCreateNestedOneWithoutInventoryInput;
};
export type StockUncheckedCreateWithoutWarehouseInput = {
    id?: string;
    quantity?: number;
    productId: string;
};
export type StockCreateOrConnectWithoutWarehouseInput = {
    where: Prisma.StockWhereUniqueInput;
    create: Prisma.XOR<Prisma.StockCreateWithoutWarehouseInput, Prisma.StockUncheckedCreateWithoutWarehouseInput>;
};
export type StockCreateManyWarehouseInputEnvelope = {
    data: Prisma.StockCreateManyWarehouseInput | Prisma.StockCreateManyWarehouseInput[];
    skipDuplicates?: boolean;
};
export type StockUpsertWithWhereUniqueWithoutWarehouseInput = {
    where: Prisma.StockWhereUniqueInput;
    update: Prisma.XOR<Prisma.StockUpdateWithoutWarehouseInput, Prisma.StockUncheckedUpdateWithoutWarehouseInput>;
    create: Prisma.XOR<Prisma.StockCreateWithoutWarehouseInput, Prisma.StockUncheckedCreateWithoutWarehouseInput>;
};
export type StockUpdateWithWhereUniqueWithoutWarehouseInput = {
    where: Prisma.StockWhereUniqueInput;
    data: Prisma.XOR<Prisma.StockUpdateWithoutWarehouseInput, Prisma.StockUncheckedUpdateWithoutWarehouseInput>;
};
export type StockUpdateManyWithWhereWithoutWarehouseInput = {
    where: Prisma.StockScalarWhereInput;
    data: Prisma.XOR<Prisma.StockUpdateManyMutationInput, Prisma.StockUncheckedUpdateManyWithoutWarehouseInput>;
};
export type StockCreateManyProductInput = {
    id?: string;
    quantity?: number;
    warehouseId: string;
};
export type StockUpdateWithoutProductInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    warehouse?: Prisma.WarehouseUpdateOneRequiredWithoutStocksNestedInput;
};
export type StockUncheckedUpdateWithoutProductInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    warehouseId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type StockUncheckedUpdateManyWithoutProductInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    warehouseId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type StockCreateManyWarehouseInput = {
    id?: string;
    quantity?: number;
    productId: string;
};
export type StockUpdateWithoutWarehouseInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    product?: Prisma.ProductUpdateOneRequiredWithoutInventoryNestedInput;
};
export type StockUncheckedUpdateWithoutWarehouseInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    productId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type StockUncheckedUpdateManyWithoutWarehouseInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    productId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type StockSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    quantity?: boolean;
    productId?: boolean;
    warehouseId?: boolean;
    product?: boolean | Prisma.ProductDefaultArgs<ExtArgs>;
    warehouse?: boolean | Prisma.WarehouseDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["stock"]>;
export type StockSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    quantity?: boolean;
    productId?: boolean;
    warehouseId?: boolean;
    product?: boolean | Prisma.ProductDefaultArgs<ExtArgs>;
    warehouse?: boolean | Prisma.WarehouseDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["stock"]>;
export type StockSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    quantity?: boolean;
    productId?: boolean;
    warehouseId?: boolean;
    product?: boolean | Prisma.ProductDefaultArgs<ExtArgs>;
    warehouse?: boolean | Prisma.WarehouseDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["stock"]>;
export type StockSelectScalar = {
    id?: boolean;
    quantity?: boolean;
    productId?: boolean;
    warehouseId?: boolean;
};
export type StockOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "quantity" | "productId" | "warehouseId", ExtArgs["result"]["stock"]>;
export type StockInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    product?: boolean | Prisma.ProductDefaultArgs<ExtArgs>;
    warehouse?: boolean | Prisma.WarehouseDefaultArgs<ExtArgs>;
};
export type StockIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    product?: boolean | Prisma.ProductDefaultArgs<ExtArgs>;
    warehouse?: boolean | Prisma.WarehouseDefaultArgs<ExtArgs>;
};
export type StockIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    product?: boolean | Prisma.ProductDefaultArgs<ExtArgs>;
    warehouse?: boolean | Prisma.WarehouseDefaultArgs<ExtArgs>;
};
export type $StockPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Stock";
    objects: {
        product: Prisma.$ProductPayload<ExtArgs>;
        warehouse: Prisma.$WarehousePayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        quantity: number;
        productId: string;
        warehouseId: string;
    }, ExtArgs["result"]["stock"]>;
    composites: {};
};
export type StockGetPayload<S extends boolean | null | undefined | StockDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$StockPayload, S>;
export type StockCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<StockFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: StockCountAggregateInputType | true;
};
export interface StockDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Stock'];
        meta: {
            name: 'Stock';
        };
    };
    findUnique<T extends StockFindUniqueArgs>(args: Prisma.SelectSubset<T, StockFindUniqueArgs<ExtArgs>>): Prisma.Prisma__StockClient<runtime.Types.Result.GetResult<Prisma.$StockPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends StockFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, StockFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__StockClient<runtime.Types.Result.GetResult<Prisma.$StockPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends StockFindFirstArgs>(args?: Prisma.SelectSubset<T, StockFindFirstArgs<ExtArgs>>): Prisma.Prisma__StockClient<runtime.Types.Result.GetResult<Prisma.$StockPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends StockFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, StockFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__StockClient<runtime.Types.Result.GetResult<Prisma.$StockPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends StockFindManyArgs>(args?: Prisma.SelectSubset<T, StockFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$StockPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends StockCreateArgs>(args: Prisma.SelectSubset<T, StockCreateArgs<ExtArgs>>): Prisma.Prisma__StockClient<runtime.Types.Result.GetResult<Prisma.$StockPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends StockCreateManyArgs>(args?: Prisma.SelectSubset<T, StockCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends StockCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, StockCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$StockPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends StockDeleteArgs>(args: Prisma.SelectSubset<T, StockDeleteArgs<ExtArgs>>): Prisma.Prisma__StockClient<runtime.Types.Result.GetResult<Prisma.$StockPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends StockUpdateArgs>(args: Prisma.SelectSubset<T, StockUpdateArgs<ExtArgs>>): Prisma.Prisma__StockClient<runtime.Types.Result.GetResult<Prisma.$StockPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends StockDeleteManyArgs>(args?: Prisma.SelectSubset<T, StockDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends StockUpdateManyArgs>(args: Prisma.SelectSubset<T, StockUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends StockUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, StockUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$StockPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends StockUpsertArgs>(args: Prisma.SelectSubset<T, StockUpsertArgs<ExtArgs>>): Prisma.Prisma__StockClient<runtime.Types.Result.GetResult<Prisma.$StockPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends StockCountArgs>(args?: Prisma.Subset<T, StockCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], StockCountAggregateOutputType> : number>;
    aggregate<T extends StockAggregateArgs>(args: Prisma.Subset<T, StockAggregateArgs>): Prisma.PrismaPromise<GetStockAggregateType<T>>;
    groupBy<T extends StockGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: StockGroupByArgs['orderBy'];
    } : {
        orderBy?: StockGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, StockGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetStockGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: StockFieldRefs;
}
export interface Prisma__StockClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    product<T extends Prisma.ProductDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ProductDefaultArgs<ExtArgs>>): Prisma.Prisma__ProductClient<runtime.Types.Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    warehouse<T extends Prisma.WarehouseDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.WarehouseDefaultArgs<ExtArgs>>): Prisma.Prisma__WarehouseClient<runtime.Types.Result.GetResult<Prisma.$WarehousePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface StockFieldRefs {
    readonly id: Prisma.FieldRef<"Stock", 'String'>;
    readonly quantity: Prisma.FieldRef<"Stock", 'Int'>;
    readonly productId: Prisma.FieldRef<"Stock", 'String'>;
    readonly warehouseId: Prisma.FieldRef<"Stock", 'String'>;
}
export type StockFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StockSelect<ExtArgs> | null;
    omit?: Prisma.StockOmit<ExtArgs> | null;
    include?: Prisma.StockInclude<ExtArgs> | null;
    where: Prisma.StockWhereUniqueInput;
};
export type StockFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StockSelect<ExtArgs> | null;
    omit?: Prisma.StockOmit<ExtArgs> | null;
    include?: Prisma.StockInclude<ExtArgs> | null;
    where: Prisma.StockWhereUniqueInput;
};
export type StockFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type StockFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type StockFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type StockCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StockSelect<ExtArgs> | null;
    omit?: Prisma.StockOmit<ExtArgs> | null;
    include?: Prisma.StockInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.StockCreateInput, Prisma.StockUncheckedCreateInput>;
};
export type StockCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.StockCreateManyInput | Prisma.StockCreateManyInput[];
    skipDuplicates?: boolean;
};
export type StockCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StockSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.StockOmit<ExtArgs> | null;
    data: Prisma.StockCreateManyInput | Prisma.StockCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.StockIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type StockUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StockSelect<ExtArgs> | null;
    omit?: Prisma.StockOmit<ExtArgs> | null;
    include?: Prisma.StockInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.StockUpdateInput, Prisma.StockUncheckedUpdateInput>;
    where: Prisma.StockWhereUniqueInput;
};
export type StockUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.StockUpdateManyMutationInput, Prisma.StockUncheckedUpdateManyInput>;
    where?: Prisma.StockWhereInput;
    limit?: number;
};
export type StockUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StockSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.StockOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.StockUpdateManyMutationInput, Prisma.StockUncheckedUpdateManyInput>;
    where?: Prisma.StockWhereInput;
    limit?: number;
    include?: Prisma.StockIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type StockUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StockSelect<ExtArgs> | null;
    omit?: Prisma.StockOmit<ExtArgs> | null;
    include?: Prisma.StockInclude<ExtArgs> | null;
    where: Prisma.StockWhereUniqueInput;
    create: Prisma.XOR<Prisma.StockCreateInput, Prisma.StockUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.StockUpdateInput, Prisma.StockUncheckedUpdateInput>;
};
export type StockDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StockSelect<ExtArgs> | null;
    omit?: Prisma.StockOmit<ExtArgs> | null;
    include?: Prisma.StockInclude<ExtArgs> | null;
    where: Prisma.StockWhereUniqueInput;
};
export type StockDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.StockWhereInput;
    limit?: number;
};
export type StockDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StockSelect<ExtArgs> | null;
    omit?: Prisma.StockOmit<ExtArgs> | null;
    include?: Prisma.StockInclude<ExtArgs> | null;
};
export {};

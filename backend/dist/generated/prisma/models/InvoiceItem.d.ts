import type * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../internal/prismaNamespace.js";
export type InvoiceItemModel = runtime.Types.Result.DefaultSelection<Prisma.$InvoiceItemPayload>;
export type AggregateInvoiceItem = {
    _count: InvoiceItemCountAggregateOutputType | null;
    _avg: InvoiceItemAvgAggregateOutputType | null;
    _sum: InvoiceItemSumAggregateOutputType | null;
    _min: InvoiceItemMinAggregateOutputType | null;
    _max: InvoiceItemMaxAggregateOutputType | null;
};
export type InvoiceItemAvgAggregateOutputType = {
    quantity: number | null;
    unitPrice: runtime.Decimal | null;
};
export type InvoiceItemSumAggregateOutputType = {
    quantity: number | null;
    unitPrice: runtime.Decimal | null;
};
export type InvoiceItemMinAggregateOutputType = {
    id: string | null;
    quantity: number | null;
    unitPrice: runtime.Decimal | null;
    invoiceId: string | null;
    productId: string | null;
};
export type InvoiceItemMaxAggregateOutputType = {
    id: string | null;
    quantity: number | null;
    unitPrice: runtime.Decimal | null;
    invoiceId: string | null;
    productId: string | null;
};
export type InvoiceItemCountAggregateOutputType = {
    id: number;
    quantity: number;
    unitPrice: number;
    invoiceId: number;
    productId: number;
    _all: number;
};
export type InvoiceItemAvgAggregateInputType = {
    quantity?: true;
    unitPrice?: true;
};
export type InvoiceItemSumAggregateInputType = {
    quantity?: true;
    unitPrice?: true;
};
export type InvoiceItemMinAggregateInputType = {
    id?: true;
    quantity?: true;
    unitPrice?: true;
    invoiceId?: true;
    productId?: true;
};
export type InvoiceItemMaxAggregateInputType = {
    id?: true;
    quantity?: true;
    unitPrice?: true;
    invoiceId?: true;
    productId?: true;
};
export type InvoiceItemCountAggregateInputType = {
    id?: true;
    quantity?: true;
    unitPrice?: true;
    invoiceId?: true;
    productId?: true;
    _all?: true;
};
export type InvoiceItemAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.InvoiceItemWhereInput;
    orderBy?: Prisma.InvoiceItemOrderByWithRelationInput | Prisma.InvoiceItemOrderByWithRelationInput[];
    cursor?: Prisma.InvoiceItemWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | InvoiceItemCountAggregateInputType;
    _avg?: InvoiceItemAvgAggregateInputType;
    _sum?: InvoiceItemSumAggregateInputType;
    _min?: InvoiceItemMinAggregateInputType;
    _max?: InvoiceItemMaxAggregateInputType;
};
export type GetInvoiceItemAggregateType<T extends InvoiceItemAggregateArgs> = {
    [P in keyof T & keyof AggregateInvoiceItem]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateInvoiceItem[P]> : Prisma.GetScalarType<T[P], AggregateInvoiceItem[P]>;
};
export type InvoiceItemGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.InvoiceItemWhereInput;
    orderBy?: Prisma.InvoiceItemOrderByWithAggregationInput | Prisma.InvoiceItemOrderByWithAggregationInput[];
    by: Prisma.InvoiceItemScalarFieldEnum[] | Prisma.InvoiceItemScalarFieldEnum;
    having?: Prisma.InvoiceItemScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: InvoiceItemCountAggregateInputType | true;
    _avg?: InvoiceItemAvgAggregateInputType;
    _sum?: InvoiceItemSumAggregateInputType;
    _min?: InvoiceItemMinAggregateInputType;
    _max?: InvoiceItemMaxAggregateInputType;
};
export type InvoiceItemGroupByOutputType = {
    id: string;
    quantity: number;
    unitPrice: runtime.Decimal;
    invoiceId: string;
    productId: string;
    _count: InvoiceItemCountAggregateOutputType | null;
    _avg: InvoiceItemAvgAggregateOutputType | null;
    _sum: InvoiceItemSumAggregateOutputType | null;
    _min: InvoiceItemMinAggregateOutputType | null;
    _max: InvoiceItemMaxAggregateOutputType | null;
};
type GetInvoiceItemGroupByPayload<T extends InvoiceItemGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<InvoiceItemGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof InvoiceItemGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], InvoiceItemGroupByOutputType[P]> : Prisma.GetScalarType<T[P], InvoiceItemGroupByOutputType[P]>;
}>>;
export type InvoiceItemWhereInput = {
    AND?: Prisma.InvoiceItemWhereInput | Prisma.InvoiceItemWhereInput[];
    OR?: Prisma.InvoiceItemWhereInput[];
    NOT?: Prisma.InvoiceItemWhereInput | Prisma.InvoiceItemWhereInput[];
    id?: Prisma.StringFilter<"InvoiceItem"> | string;
    quantity?: Prisma.IntFilter<"InvoiceItem"> | number;
    unitPrice?: Prisma.DecimalFilter<"InvoiceItem"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    invoiceId?: Prisma.StringFilter<"InvoiceItem"> | string;
    productId?: Prisma.StringFilter<"InvoiceItem"> | string;
    invoice?: Prisma.XOR<Prisma.InvoiceScalarRelationFilter, Prisma.InvoiceWhereInput>;
    product?: Prisma.XOR<Prisma.ProductScalarRelationFilter, Prisma.ProductWhereInput>;
};
export type InvoiceItemOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    unitPrice?: Prisma.SortOrder;
    invoiceId?: Prisma.SortOrder;
    productId?: Prisma.SortOrder;
    invoice?: Prisma.InvoiceOrderByWithRelationInput;
    product?: Prisma.ProductOrderByWithRelationInput;
};
export type InvoiceItemWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.InvoiceItemWhereInput | Prisma.InvoiceItemWhereInput[];
    OR?: Prisma.InvoiceItemWhereInput[];
    NOT?: Prisma.InvoiceItemWhereInput | Prisma.InvoiceItemWhereInput[];
    quantity?: Prisma.IntFilter<"InvoiceItem"> | number;
    unitPrice?: Prisma.DecimalFilter<"InvoiceItem"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    invoiceId?: Prisma.StringFilter<"InvoiceItem"> | string;
    productId?: Prisma.StringFilter<"InvoiceItem"> | string;
    invoice?: Prisma.XOR<Prisma.InvoiceScalarRelationFilter, Prisma.InvoiceWhereInput>;
    product?: Prisma.XOR<Prisma.ProductScalarRelationFilter, Prisma.ProductWhereInput>;
}, "id">;
export type InvoiceItemOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    unitPrice?: Prisma.SortOrder;
    invoiceId?: Prisma.SortOrder;
    productId?: Prisma.SortOrder;
    _count?: Prisma.InvoiceItemCountOrderByAggregateInput;
    _avg?: Prisma.InvoiceItemAvgOrderByAggregateInput;
    _max?: Prisma.InvoiceItemMaxOrderByAggregateInput;
    _min?: Prisma.InvoiceItemMinOrderByAggregateInput;
    _sum?: Prisma.InvoiceItemSumOrderByAggregateInput;
};
export type InvoiceItemScalarWhereWithAggregatesInput = {
    AND?: Prisma.InvoiceItemScalarWhereWithAggregatesInput | Prisma.InvoiceItemScalarWhereWithAggregatesInput[];
    OR?: Prisma.InvoiceItemScalarWhereWithAggregatesInput[];
    NOT?: Prisma.InvoiceItemScalarWhereWithAggregatesInput | Prisma.InvoiceItemScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"InvoiceItem"> | string;
    quantity?: Prisma.IntWithAggregatesFilter<"InvoiceItem"> | number;
    unitPrice?: Prisma.DecimalWithAggregatesFilter<"InvoiceItem"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    invoiceId?: Prisma.StringWithAggregatesFilter<"InvoiceItem"> | string;
    productId?: Prisma.StringWithAggregatesFilter<"InvoiceItem"> | string;
};
export type InvoiceItemCreateInput = {
    id?: string;
    quantity: number;
    unitPrice: runtime.Decimal | runtime.DecimalJsLike | number | string;
    invoice: Prisma.InvoiceCreateNestedOneWithoutItemsInput;
    product: Prisma.ProductCreateNestedOneWithoutInvoiceItemsInput;
};
export type InvoiceItemUncheckedCreateInput = {
    id?: string;
    quantity: number;
    unitPrice: runtime.Decimal | runtime.DecimalJsLike | number | string;
    invoiceId: string;
    productId: string;
};
export type InvoiceItemUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    unitPrice?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    invoice?: Prisma.InvoiceUpdateOneRequiredWithoutItemsNestedInput;
    product?: Prisma.ProductUpdateOneRequiredWithoutInvoiceItemsNestedInput;
};
export type InvoiceItemUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    unitPrice?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    invoiceId?: Prisma.StringFieldUpdateOperationsInput | string;
    productId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type InvoiceItemCreateManyInput = {
    id?: string;
    quantity: number;
    unitPrice: runtime.Decimal | runtime.DecimalJsLike | number | string;
    invoiceId: string;
    productId: string;
};
export type InvoiceItemUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    unitPrice?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
};
export type InvoiceItemUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    unitPrice?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    invoiceId?: Prisma.StringFieldUpdateOperationsInput | string;
    productId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type InvoiceItemListRelationFilter = {
    every?: Prisma.InvoiceItemWhereInput;
    some?: Prisma.InvoiceItemWhereInput;
    none?: Prisma.InvoiceItemWhereInput;
};
export type InvoiceItemOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type InvoiceItemCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    unitPrice?: Prisma.SortOrder;
    invoiceId?: Prisma.SortOrder;
    productId?: Prisma.SortOrder;
};
export type InvoiceItemAvgOrderByAggregateInput = {
    quantity?: Prisma.SortOrder;
    unitPrice?: Prisma.SortOrder;
};
export type InvoiceItemMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    unitPrice?: Prisma.SortOrder;
    invoiceId?: Prisma.SortOrder;
    productId?: Prisma.SortOrder;
};
export type InvoiceItemMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    unitPrice?: Prisma.SortOrder;
    invoiceId?: Prisma.SortOrder;
    productId?: Prisma.SortOrder;
};
export type InvoiceItemSumOrderByAggregateInput = {
    quantity?: Prisma.SortOrder;
    unitPrice?: Prisma.SortOrder;
};
export type InvoiceItemCreateNestedManyWithoutProductInput = {
    create?: Prisma.XOR<Prisma.InvoiceItemCreateWithoutProductInput, Prisma.InvoiceItemUncheckedCreateWithoutProductInput> | Prisma.InvoiceItemCreateWithoutProductInput[] | Prisma.InvoiceItemUncheckedCreateWithoutProductInput[];
    connectOrCreate?: Prisma.InvoiceItemCreateOrConnectWithoutProductInput | Prisma.InvoiceItemCreateOrConnectWithoutProductInput[];
    createMany?: Prisma.InvoiceItemCreateManyProductInputEnvelope;
    connect?: Prisma.InvoiceItemWhereUniqueInput | Prisma.InvoiceItemWhereUniqueInput[];
};
export type InvoiceItemUncheckedCreateNestedManyWithoutProductInput = {
    create?: Prisma.XOR<Prisma.InvoiceItemCreateWithoutProductInput, Prisma.InvoiceItemUncheckedCreateWithoutProductInput> | Prisma.InvoiceItemCreateWithoutProductInput[] | Prisma.InvoiceItemUncheckedCreateWithoutProductInput[];
    connectOrCreate?: Prisma.InvoiceItemCreateOrConnectWithoutProductInput | Prisma.InvoiceItemCreateOrConnectWithoutProductInput[];
    createMany?: Prisma.InvoiceItemCreateManyProductInputEnvelope;
    connect?: Prisma.InvoiceItemWhereUniqueInput | Prisma.InvoiceItemWhereUniqueInput[];
};
export type InvoiceItemUpdateManyWithoutProductNestedInput = {
    create?: Prisma.XOR<Prisma.InvoiceItemCreateWithoutProductInput, Prisma.InvoiceItemUncheckedCreateWithoutProductInput> | Prisma.InvoiceItemCreateWithoutProductInput[] | Prisma.InvoiceItemUncheckedCreateWithoutProductInput[];
    connectOrCreate?: Prisma.InvoiceItemCreateOrConnectWithoutProductInput | Prisma.InvoiceItemCreateOrConnectWithoutProductInput[];
    upsert?: Prisma.InvoiceItemUpsertWithWhereUniqueWithoutProductInput | Prisma.InvoiceItemUpsertWithWhereUniqueWithoutProductInput[];
    createMany?: Prisma.InvoiceItemCreateManyProductInputEnvelope;
    set?: Prisma.InvoiceItemWhereUniqueInput | Prisma.InvoiceItemWhereUniqueInput[];
    disconnect?: Prisma.InvoiceItemWhereUniqueInput | Prisma.InvoiceItemWhereUniqueInput[];
    delete?: Prisma.InvoiceItemWhereUniqueInput | Prisma.InvoiceItemWhereUniqueInput[];
    connect?: Prisma.InvoiceItemWhereUniqueInput | Prisma.InvoiceItemWhereUniqueInput[];
    update?: Prisma.InvoiceItemUpdateWithWhereUniqueWithoutProductInput | Prisma.InvoiceItemUpdateWithWhereUniqueWithoutProductInput[];
    updateMany?: Prisma.InvoiceItemUpdateManyWithWhereWithoutProductInput | Prisma.InvoiceItemUpdateManyWithWhereWithoutProductInput[];
    deleteMany?: Prisma.InvoiceItemScalarWhereInput | Prisma.InvoiceItemScalarWhereInput[];
};
export type InvoiceItemUncheckedUpdateManyWithoutProductNestedInput = {
    create?: Prisma.XOR<Prisma.InvoiceItemCreateWithoutProductInput, Prisma.InvoiceItemUncheckedCreateWithoutProductInput> | Prisma.InvoiceItemCreateWithoutProductInput[] | Prisma.InvoiceItemUncheckedCreateWithoutProductInput[];
    connectOrCreate?: Prisma.InvoiceItemCreateOrConnectWithoutProductInput | Prisma.InvoiceItemCreateOrConnectWithoutProductInput[];
    upsert?: Prisma.InvoiceItemUpsertWithWhereUniqueWithoutProductInput | Prisma.InvoiceItemUpsertWithWhereUniqueWithoutProductInput[];
    createMany?: Prisma.InvoiceItemCreateManyProductInputEnvelope;
    set?: Prisma.InvoiceItemWhereUniqueInput | Prisma.InvoiceItemWhereUniqueInput[];
    disconnect?: Prisma.InvoiceItemWhereUniqueInput | Prisma.InvoiceItemWhereUniqueInput[];
    delete?: Prisma.InvoiceItemWhereUniqueInput | Prisma.InvoiceItemWhereUniqueInput[];
    connect?: Prisma.InvoiceItemWhereUniqueInput | Prisma.InvoiceItemWhereUniqueInput[];
    update?: Prisma.InvoiceItemUpdateWithWhereUniqueWithoutProductInput | Prisma.InvoiceItemUpdateWithWhereUniqueWithoutProductInput[];
    updateMany?: Prisma.InvoiceItemUpdateManyWithWhereWithoutProductInput | Prisma.InvoiceItemUpdateManyWithWhereWithoutProductInput[];
    deleteMany?: Prisma.InvoiceItemScalarWhereInput | Prisma.InvoiceItemScalarWhereInput[];
};
export type InvoiceItemCreateNestedManyWithoutInvoiceInput = {
    create?: Prisma.XOR<Prisma.InvoiceItemCreateWithoutInvoiceInput, Prisma.InvoiceItemUncheckedCreateWithoutInvoiceInput> | Prisma.InvoiceItemCreateWithoutInvoiceInput[] | Prisma.InvoiceItemUncheckedCreateWithoutInvoiceInput[];
    connectOrCreate?: Prisma.InvoiceItemCreateOrConnectWithoutInvoiceInput | Prisma.InvoiceItemCreateOrConnectWithoutInvoiceInput[];
    createMany?: Prisma.InvoiceItemCreateManyInvoiceInputEnvelope;
    connect?: Prisma.InvoiceItemWhereUniqueInput | Prisma.InvoiceItemWhereUniqueInput[];
};
export type InvoiceItemUncheckedCreateNestedManyWithoutInvoiceInput = {
    create?: Prisma.XOR<Prisma.InvoiceItemCreateWithoutInvoiceInput, Prisma.InvoiceItemUncheckedCreateWithoutInvoiceInput> | Prisma.InvoiceItemCreateWithoutInvoiceInput[] | Prisma.InvoiceItemUncheckedCreateWithoutInvoiceInput[];
    connectOrCreate?: Prisma.InvoiceItemCreateOrConnectWithoutInvoiceInput | Prisma.InvoiceItemCreateOrConnectWithoutInvoiceInput[];
    createMany?: Prisma.InvoiceItemCreateManyInvoiceInputEnvelope;
    connect?: Prisma.InvoiceItemWhereUniqueInput | Prisma.InvoiceItemWhereUniqueInput[];
};
export type InvoiceItemUpdateManyWithoutInvoiceNestedInput = {
    create?: Prisma.XOR<Prisma.InvoiceItemCreateWithoutInvoiceInput, Prisma.InvoiceItemUncheckedCreateWithoutInvoiceInput> | Prisma.InvoiceItemCreateWithoutInvoiceInput[] | Prisma.InvoiceItemUncheckedCreateWithoutInvoiceInput[];
    connectOrCreate?: Prisma.InvoiceItemCreateOrConnectWithoutInvoiceInput | Prisma.InvoiceItemCreateOrConnectWithoutInvoiceInput[];
    upsert?: Prisma.InvoiceItemUpsertWithWhereUniqueWithoutInvoiceInput | Prisma.InvoiceItemUpsertWithWhereUniqueWithoutInvoiceInput[];
    createMany?: Prisma.InvoiceItemCreateManyInvoiceInputEnvelope;
    set?: Prisma.InvoiceItemWhereUniqueInput | Prisma.InvoiceItemWhereUniqueInput[];
    disconnect?: Prisma.InvoiceItemWhereUniqueInput | Prisma.InvoiceItemWhereUniqueInput[];
    delete?: Prisma.InvoiceItemWhereUniqueInput | Prisma.InvoiceItemWhereUniqueInput[];
    connect?: Prisma.InvoiceItemWhereUniqueInput | Prisma.InvoiceItemWhereUniqueInput[];
    update?: Prisma.InvoiceItemUpdateWithWhereUniqueWithoutInvoiceInput | Prisma.InvoiceItemUpdateWithWhereUniqueWithoutInvoiceInput[];
    updateMany?: Prisma.InvoiceItemUpdateManyWithWhereWithoutInvoiceInput | Prisma.InvoiceItemUpdateManyWithWhereWithoutInvoiceInput[];
    deleteMany?: Prisma.InvoiceItemScalarWhereInput | Prisma.InvoiceItemScalarWhereInput[];
};
export type InvoiceItemUncheckedUpdateManyWithoutInvoiceNestedInput = {
    create?: Prisma.XOR<Prisma.InvoiceItemCreateWithoutInvoiceInput, Prisma.InvoiceItemUncheckedCreateWithoutInvoiceInput> | Prisma.InvoiceItemCreateWithoutInvoiceInput[] | Prisma.InvoiceItemUncheckedCreateWithoutInvoiceInput[];
    connectOrCreate?: Prisma.InvoiceItemCreateOrConnectWithoutInvoiceInput | Prisma.InvoiceItemCreateOrConnectWithoutInvoiceInput[];
    upsert?: Prisma.InvoiceItemUpsertWithWhereUniqueWithoutInvoiceInput | Prisma.InvoiceItemUpsertWithWhereUniqueWithoutInvoiceInput[];
    createMany?: Prisma.InvoiceItemCreateManyInvoiceInputEnvelope;
    set?: Prisma.InvoiceItemWhereUniqueInput | Prisma.InvoiceItemWhereUniqueInput[];
    disconnect?: Prisma.InvoiceItemWhereUniqueInput | Prisma.InvoiceItemWhereUniqueInput[];
    delete?: Prisma.InvoiceItemWhereUniqueInput | Prisma.InvoiceItemWhereUniqueInput[];
    connect?: Prisma.InvoiceItemWhereUniqueInput | Prisma.InvoiceItemWhereUniqueInput[];
    update?: Prisma.InvoiceItemUpdateWithWhereUniqueWithoutInvoiceInput | Prisma.InvoiceItemUpdateWithWhereUniqueWithoutInvoiceInput[];
    updateMany?: Prisma.InvoiceItemUpdateManyWithWhereWithoutInvoiceInput | Prisma.InvoiceItemUpdateManyWithWhereWithoutInvoiceInput[];
    deleteMany?: Prisma.InvoiceItemScalarWhereInput | Prisma.InvoiceItemScalarWhereInput[];
};
export type InvoiceItemCreateWithoutProductInput = {
    id?: string;
    quantity: number;
    unitPrice: runtime.Decimal | runtime.DecimalJsLike | number | string;
    invoice: Prisma.InvoiceCreateNestedOneWithoutItemsInput;
};
export type InvoiceItemUncheckedCreateWithoutProductInput = {
    id?: string;
    quantity: number;
    unitPrice: runtime.Decimal | runtime.DecimalJsLike | number | string;
    invoiceId: string;
};
export type InvoiceItemCreateOrConnectWithoutProductInput = {
    where: Prisma.InvoiceItemWhereUniqueInput;
    create: Prisma.XOR<Prisma.InvoiceItemCreateWithoutProductInput, Prisma.InvoiceItemUncheckedCreateWithoutProductInput>;
};
export type InvoiceItemCreateManyProductInputEnvelope = {
    data: Prisma.InvoiceItemCreateManyProductInput | Prisma.InvoiceItemCreateManyProductInput[];
    skipDuplicates?: boolean;
};
export type InvoiceItemUpsertWithWhereUniqueWithoutProductInput = {
    where: Prisma.InvoiceItemWhereUniqueInput;
    update: Prisma.XOR<Prisma.InvoiceItemUpdateWithoutProductInput, Prisma.InvoiceItemUncheckedUpdateWithoutProductInput>;
    create: Prisma.XOR<Prisma.InvoiceItemCreateWithoutProductInput, Prisma.InvoiceItemUncheckedCreateWithoutProductInput>;
};
export type InvoiceItemUpdateWithWhereUniqueWithoutProductInput = {
    where: Prisma.InvoiceItemWhereUniqueInput;
    data: Prisma.XOR<Prisma.InvoiceItemUpdateWithoutProductInput, Prisma.InvoiceItemUncheckedUpdateWithoutProductInput>;
};
export type InvoiceItemUpdateManyWithWhereWithoutProductInput = {
    where: Prisma.InvoiceItemScalarWhereInput;
    data: Prisma.XOR<Prisma.InvoiceItemUpdateManyMutationInput, Prisma.InvoiceItemUncheckedUpdateManyWithoutProductInput>;
};
export type InvoiceItemScalarWhereInput = {
    AND?: Prisma.InvoiceItemScalarWhereInput | Prisma.InvoiceItemScalarWhereInput[];
    OR?: Prisma.InvoiceItemScalarWhereInput[];
    NOT?: Prisma.InvoiceItemScalarWhereInput | Prisma.InvoiceItemScalarWhereInput[];
    id?: Prisma.StringFilter<"InvoiceItem"> | string;
    quantity?: Prisma.IntFilter<"InvoiceItem"> | number;
    unitPrice?: Prisma.DecimalFilter<"InvoiceItem"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    invoiceId?: Prisma.StringFilter<"InvoiceItem"> | string;
    productId?: Prisma.StringFilter<"InvoiceItem"> | string;
};
export type InvoiceItemCreateWithoutInvoiceInput = {
    id?: string;
    quantity: number;
    unitPrice: runtime.Decimal | runtime.DecimalJsLike | number | string;
    product: Prisma.ProductCreateNestedOneWithoutInvoiceItemsInput;
};
export type InvoiceItemUncheckedCreateWithoutInvoiceInput = {
    id?: string;
    quantity: number;
    unitPrice: runtime.Decimal | runtime.DecimalJsLike | number | string;
    productId: string;
};
export type InvoiceItemCreateOrConnectWithoutInvoiceInput = {
    where: Prisma.InvoiceItemWhereUniqueInput;
    create: Prisma.XOR<Prisma.InvoiceItemCreateWithoutInvoiceInput, Prisma.InvoiceItemUncheckedCreateWithoutInvoiceInput>;
};
export type InvoiceItemCreateManyInvoiceInputEnvelope = {
    data: Prisma.InvoiceItemCreateManyInvoiceInput | Prisma.InvoiceItemCreateManyInvoiceInput[];
    skipDuplicates?: boolean;
};
export type InvoiceItemUpsertWithWhereUniqueWithoutInvoiceInput = {
    where: Prisma.InvoiceItemWhereUniqueInput;
    update: Prisma.XOR<Prisma.InvoiceItemUpdateWithoutInvoiceInput, Prisma.InvoiceItemUncheckedUpdateWithoutInvoiceInput>;
    create: Prisma.XOR<Prisma.InvoiceItemCreateWithoutInvoiceInput, Prisma.InvoiceItemUncheckedCreateWithoutInvoiceInput>;
};
export type InvoiceItemUpdateWithWhereUniqueWithoutInvoiceInput = {
    where: Prisma.InvoiceItemWhereUniqueInput;
    data: Prisma.XOR<Prisma.InvoiceItemUpdateWithoutInvoiceInput, Prisma.InvoiceItemUncheckedUpdateWithoutInvoiceInput>;
};
export type InvoiceItemUpdateManyWithWhereWithoutInvoiceInput = {
    where: Prisma.InvoiceItemScalarWhereInput;
    data: Prisma.XOR<Prisma.InvoiceItemUpdateManyMutationInput, Prisma.InvoiceItemUncheckedUpdateManyWithoutInvoiceInput>;
};
export type InvoiceItemCreateManyProductInput = {
    id?: string;
    quantity: number;
    unitPrice: runtime.Decimal | runtime.DecimalJsLike | number | string;
    invoiceId: string;
};
export type InvoiceItemUpdateWithoutProductInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    unitPrice?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    invoice?: Prisma.InvoiceUpdateOneRequiredWithoutItemsNestedInput;
};
export type InvoiceItemUncheckedUpdateWithoutProductInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    unitPrice?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    invoiceId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type InvoiceItemUncheckedUpdateManyWithoutProductInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    unitPrice?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    invoiceId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type InvoiceItemCreateManyInvoiceInput = {
    id?: string;
    quantity: number;
    unitPrice: runtime.Decimal | runtime.DecimalJsLike | number | string;
    productId: string;
};
export type InvoiceItemUpdateWithoutInvoiceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    unitPrice?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    product?: Prisma.ProductUpdateOneRequiredWithoutInvoiceItemsNestedInput;
};
export type InvoiceItemUncheckedUpdateWithoutInvoiceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    unitPrice?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    productId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type InvoiceItemUncheckedUpdateManyWithoutInvoiceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    unitPrice?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    productId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type InvoiceItemSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    quantity?: boolean;
    unitPrice?: boolean;
    invoiceId?: boolean;
    productId?: boolean;
    invoice?: boolean | Prisma.InvoiceDefaultArgs<ExtArgs>;
    product?: boolean | Prisma.ProductDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["invoiceItem"]>;
export type InvoiceItemSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    quantity?: boolean;
    unitPrice?: boolean;
    invoiceId?: boolean;
    productId?: boolean;
    invoice?: boolean | Prisma.InvoiceDefaultArgs<ExtArgs>;
    product?: boolean | Prisma.ProductDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["invoiceItem"]>;
export type InvoiceItemSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    quantity?: boolean;
    unitPrice?: boolean;
    invoiceId?: boolean;
    productId?: boolean;
    invoice?: boolean | Prisma.InvoiceDefaultArgs<ExtArgs>;
    product?: boolean | Prisma.ProductDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["invoiceItem"]>;
export type InvoiceItemSelectScalar = {
    id?: boolean;
    quantity?: boolean;
    unitPrice?: boolean;
    invoiceId?: boolean;
    productId?: boolean;
};
export type InvoiceItemOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "quantity" | "unitPrice" | "invoiceId" | "productId", ExtArgs["result"]["invoiceItem"]>;
export type InvoiceItemInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    invoice?: boolean | Prisma.InvoiceDefaultArgs<ExtArgs>;
    product?: boolean | Prisma.ProductDefaultArgs<ExtArgs>;
};
export type InvoiceItemIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    invoice?: boolean | Prisma.InvoiceDefaultArgs<ExtArgs>;
    product?: boolean | Prisma.ProductDefaultArgs<ExtArgs>;
};
export type InvoiceItemIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    invoice?: boolean | Prisma.InvoiceDefaultArgs<ExtArgs>;
    product?: boolean | Prisma.ProductDefaultArgs<ExtArgs>;
};
export type $InvoiceItemPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "InvoiceItem";
    objects: {
        invoice: Prisma.$InvoicePayload<ExtArgs>;
        product: Prisma.$ProductPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        quantity: number;
        unitPrice: runtime.Decimal;
        invoiceId: string;
        productId: string;
    }, ExtArgs["result"]["invoiceItem"]>;
    composites: {};
};
export type InvoiceItemGetPayload<S extends boolean | null | undefined | InvoiceItemDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$InvoiceItemPayload, S>;
export type InvoiceItemCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<InvoiceItemFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: InvoiceItemCountAggregateInputType | true;
};
export interface InvoiceItemDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['InvoiceItem'];
        meta: {
            name: 'InvoiceItem';
        };
    };
    findUnique<T extends InvoiceItemFindUniqueArgs>(args: Prisma.SelectSubset<T, InvoiceItemFindUniqueArgs<ExtArgs>>): Prisma.Prisma__InvoiceItemClient<runtime.Types.Result.GetResult<Prisma.$InvoiceItemPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends InvoiceItemFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, InvoiceItemFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__InvoiceItemClient<runtime.Types.Result.GetResult<Prisma.$InvoiceItemPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends InvoiceItemFindFirstArgs>(args?: Prisma.SelectSubset<T, InvoiceItemFindFirstArgs<ExtArgs>>): Prisma.Prisma__InvoiceItemClient<runtime.Types.Result.GetResult<Prisma.$InvoiceItemPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends InvoiceItemFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, InvoiceItemFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__InvoiceItemClient<runtime.Types.Result.GetResult<Prisma.$InvoiceItemPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends InvoiceItemFindManyArgs>(args?: Prisma.SelectSubset<T, InvoiceItemFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$InvoiceItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends InvoiceItemCreateArgs>(args: Prisma.SelectSubset<T, InvoiceItemCreateArgs<ExtArgs>>): Prisma.Prisma__InvoiceItemClient<runtime.Types.Result.GetResult<Prisma.$InvoiceItemPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends InvoiceItemCreateManyArgs>(args?: Prisma.SelectSubset<T, InvoiceItemCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends InvoiceItemCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, InvoiceItemCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$InvoiceItemPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends InvoiceItemDeleteArgs>(args: Prisma.SelectSubset<T, InvoiceItemDeleteArgs<ExtArgs>>): Prisma.Prisma__InvoiceItemClient<runtime.Types.Result.GetResult<Prisma.$InvoiceItemPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends InvoiceItemUpdateArgs>(args: Prisma.SelectSubset<T, InvoiceItemUpdateArgs<ExtArgs>>): Prisma.Prisma__InvoiceItemClient<runtime.Types.Result.GetResult<Prisma.$InvoiceItemPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends InvoiceItemDeleteManyArgs>(args?: Prisma.SelectSubset<T, InvoiceItemDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends InvoiceItemUpdateManyArgs>(args: Prisma.SelectSubset<T, InvoiceItemUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends InvoiceItemUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, InvoiceItemUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$InvoiceItemPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends InvoiceItemUpsertArgs>(args: Prisma.SelectSubset<T, InvoiceItemUpsertArgs<ExtArgs>>): Prisma.Prisma__InvoiceItemClient<runtime.Types.Result.GetResult<Prisma.$InvoiceItemPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends InvoiceItemCountArgs>(args?: Prisma.Subset<T, InvoiceItemCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], InvoiceItemCountAggregateOutputType> : number>;
    aggregate<T extends InvoiceItemAggregateArgs>(args: Prisma.Subset<T, InvoiceItemAggregateArgs>): Prisma.PrismaPromise<GetInvoiceItemAggregateType<T>>;
    groupBy<T extends InvoiceItemGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: InvoiceItemGroupByArgs['orderBy'];
    } : {
        orderBy?: InvoiceItemGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, InvoiceItemGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInvoiceItemGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: InvoiceItemFieldRefs;
}
export interface Prisma__InvoiceItemClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    invoice<T extends Prisma.InvoiceDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.InvoiceDefaultArgs<ExtArgs>>): Prisma.Prisma__InvoiceClient<runtime.Types.Result.GetResult<Prisma.$InvoicePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    product<T extends Prisma.ProductDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ProductDefaultArgs<ExtArgs>>): Prisma.Prisma__ProductClient<runtime.Types.Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface InvoiceItemFieldRefs {
    readonly id: Prisma.FieldRef<"InvoiceItem", 'String'>;
    readonly quantity: Prisma.FieldRef<"InvoiceItem", 'Int'>;
    readonly unitPrice: Prisma.FieldRef<"InvoiceItem", 'Decimal'>;
    readonly invoiceId: Prisma.FieldRef<"InvoiceItem", 'String'>;
    readonly productId: Prisma.FieldRef<"InvoiceItem", 'String'>;
}
export type InvoiceItemFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InvoiceItemSelect<ExtArgs> | null;
    omit?: Prisma.InvoiceItemOmit<ExtArgs> | null;
    include?: Prisma.InvoiceItemInclude<ExtArgs> | null;
    where: Prisma.InvoiceItemWhereUniqueInput;
};
export type InvoiceItemFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InvoiceItemSelect<ExtArgs> | null;
    omit?: Prisma.InvoiceItemOmit<ExtArgs> | null;
    include?: Prisma.InvoiceItemInclude<ExtArgs> | null;
    where: Prisma.InvoiceItemWhereUniqueInput;
};
export type InvoiceItemFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type InvoiceItemFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type InvoiceItemFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type InvoiceItemCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InvoiceItemSelect<ExtArgs> | null;
    omit?: Prisma.InvoiceItemOmit<ExtArgs> | null;
    include?: Prisma.InvoiceItemInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.InvoiceItemCreateInput, Prisma.InvoiceItemUncheckedCreateInput>;
};
export type InvoiceItemCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.InvoiceItemCreateManyInput | Prisma.InvoiceItemCreateManyInput[];
    skipDuplicates?: boolean;
};
export type InvoiceItemCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InvoiceItemSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.InvoiceItemOmit<ExtArgs> | null;
    data: Prisma.InvoiceItemCreateManyInput | Prisma.InvoiceItemCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.InvoiceItemIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type InvoiceItemUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InvoiceItemSelect<ExtArgs> | null;
    omit?: Prisma.InvoiceItemOmit<ExtArgs> | null;
    include?: Prisma.InvoiceItemInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.InvoiceItemUpdateInput, Prisma.InvoiceItemUncheckedUpdateInput>;
    where: Prisma.InvoiceItemWhereUniqueInput;
};
export type InvoiceItemUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.InvoiceItemUpdateManyMutationInput, Prisma.InvoiceItemUncheckedUpdateManyInput>;
    where?: Prisma.InvoiceItemWhereInput;
    limit?: number;
};
export type InvoiceItemUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InvoiceItemSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.InvoiceItemOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.InvoiceItemUpdateManyMutationInput, Prisma.InvoiceItemUncheckedUpdateManyInput>;
    where?: Prisma.InvoiceItemWhereInput;
    limit?: number;
    include?: Prisma.InvoiceItemIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type InvoiceItemUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InvoiceItemSelect<ExtArgs> | null;
    omit?: Prisma.InvoiceItemOmit<ExtArgs> | null;
    include?: Prisma.InvoiceItemInclude<ExtArgs> | null;
    where: Prisma.InvoiceItemWhereUniqueInput;
    create: Prisma.XOR<Prisma.InvoiceItemCreateInput, Prisma.InvoiceItemUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.InvoiceItemUpdateInput, Prisma.InvoiceItemUncheckedUpdateInput>;
};
export type InvoiceItemDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InvoiceItemSelect<ExtArgs> | null;
    omit?: Prisma.InvoiceItemOmit<ExtArgs> | null;
    include?: Prisma.InvoiceItemInclude<ExtArgs> | null;
    where: Prisma.InvoiceItemWhereUniqueInput;
};
export type InvoiceItemDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.InvoiceItemWhereInput;
    limit?: number;
};
export type InvoiceItemDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InvoiceItemSelect<ExtArgs> | null;
    omit?: Prisma.InvoiceItemOmit<ExtArgs> | null;
    include?: Prisma.InvoiceItemInclude<ExtArgs> | null;
};
export {};

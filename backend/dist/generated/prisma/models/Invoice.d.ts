import type * as runtime from "@prisma/client/runtime/library";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type InvoiceModel = runtime.Types.Result.DefaultSelection<Prisma.$InvoicePayload>;
export type AggregateInvoice = {
    _count: InvoiceCountAggregateOutputType | null;
    _avg: InvoiceAvgAggregateOutputType | null;
    _sum: InvoiceSumAggregateOutputType | null;
    _min: InvoiceMinAggregateOutputType | null;
    _max: InvoiceMaxAggregateOutputType | null;
};
export type InvoiceAvgAggregateOutputType = {
    invoiceNumber: number | null;
    total: runtime.Decimal | null;
};
export type InvoiceSumAggregateOutputType = {
    invoiceNumber: number | null;
    total: runtime.Decimal | null;
};
export type InvoiceMinAggregateOutputType = {
    id: string | null;
    invoiceNumber: number | null;
    total: runtime.Decimal | null;
    status: $Enums.InvoiceStatus | null;
    paymentMethod: $Enums.PaymentMethod | null;
    createdAt: Date | null;
    tenantId: string | null;
    customerId: string | null;
    sellerId: string | null;
};
export type InvoiceMaxAggregateOutputType = {
    id: string | null;
    invoiceNumber: number | null;
    total: runtime.Decimal | null;
    status: $Enums.InvoiceStatus | null;
    paymentMethod: $Enums.PaymentMethod | null;
    createdAt: Date | null;
    tenantId: string | null;
    customerId: string | null;
    sellerId: string | null;
};
export type InvoiceCountAggregateOutputType = {
    id: number;
    invoiceNumber: number;
    total: number;
    status: number;
    paymentMethod: number;
    createdAt: number;
    tenantId: number;
    customerId: number;
    sellerId: number;
    _all: number;
};
export type InvoiceAvgAggregateInputType = {
    invoiceNumber?: true;
    total?: true;
};
export type InvoiceSumAggregateInputType = {
    invoiceNumber?: true;
    total?: true;
};
export type InvoiceMinAggregateInputType = {
    id?: true;
    invoiceNumber?: true;
    total?: true;
    status?: true;
    paymentMethod?: true;
    createdAt?: true;
    tenantId?: true;
    customerId?: true;
    sellerId?: true;
};
export type InvoiceMaxAggregateInputType = {
    id?: true;
    invoiceNumber?: true;
    total?: true;
    status?: true;
    paymentMethod?: true;
    createdAt?: true;
    tenantId?: true;
    customerId?: true;
    sellerId?: true;
};
export type InvoiceCountAggregateInputType = {
    id?: true;
    invoiceNumber?: true;
    total?: true;
    status?: true;
    paymentMethod?: true;
    createdAt?: true;
    tenantId?: true;
    customerId?: true;
    sellerId?: true;
    _all?: true;
};
export type InvoiceAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.InvoiceWhereInput;
    orderBy?: Prisma.InvoiceOrderByWithRelationInput | Prisma.InvoiceOrderByWithRelationInput[];
    cursor?: Prisma.InvoiceWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | InvoiceCountAggregateInputType;
    _avg?: InvoiceAvgAggregateInputType;
    _sum?: InvoiceSumAggregateInputType;
    _min?: InvoiceMinAggregateInputType;
    _max?: InvoiceMaxAggregateInputType;
};
export type GetInvoiceAggregateType<T extends InvoiceAggregateArgs> = {
    [P in keyof T & keyof AggregateInvoice]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateInvoice[P]> : Prisma.GetScalarType<T[P], AggregateInvoice[P]>;
};
export type InvoiceGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.InvoiceWhereInput;
    orderBy?: Prisma.InvoiceOrderByWithAggregationInput | Prisma.InvoiceOrderByWithAggregationInput[];
    by: Prisma.InvoiceScalarFieldEnum[] | Prisma.InvoiceScalarFieldEnum;
    having?: Prisma.InvoiceScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: InvoiceCountAggregateInputType | true;
    _avg?: InvoiceAvgAggregateInputType;
    _sum?: InvoiceSumAggregateInputType;
    _min?: InvoiceMinAggregateInputType;
    _max?: InvoiceMaxAggregateInputType;
};
export type InvoiceGroupByOutputType = {
    id: string;
    invoiceNumber: number;
    total: runtime.Decimal;
    status: $Enums.InvoiceStatus;
    paymentMethod: $Enums.PaymentMethod;
    createdAt: Date;
    tenantId: string;
    customerId: string | null;
    sellerId: string;
    _count: InvoiceCountAggregateOutputType | null;
    _avg: InvoiceAvgAggregateOutputType | null;
    _sum: InvoiceSumAggregateOutputType | null;
    _min: InvoiceMinAggregateOutputType | null;
    _max: InvoiceMaxAggregateOutputType | null;
};
type GetInvoiceGroupByPayload<T extends InvoiceGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<InvoiceGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof InvoiceGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], InvoiceGroupByOutputType[P]> : Prisma.GetScalarType<T[P], InvoiceGroupByOutputType[P]>;
}>>;
export type InvoiceWhereInput = {
    AND?: Prisma.InvoiceWhereInput | Prisma.InvoiceWhereInput[];
    OR?: Prisma.InvoiceWhereInput[];
    NOT?: Prisma.InvoiceWhereInput | Prisma.InvoiceWhereInput[];
    id?: Prisma.StringFilter<"Invoice"> | string;
    invoiceNumber?: Prisma.IntFilter<"Invoice"> | number;
    total?: Prisma.DecimalFilter<"Invoice"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumInvoiceStatusFilter<"Invoice"> | $Enums.InvoiceStatus;
    paymentMethod?: Prisma.EnumPaymentMethodFilter<"Invoice"> | $Enums.PaymentMethod;
    createdAt?: Prisma.DateTimeFilter<"Invoice"> | Date | string;
    tenantId?: Prisma.StringFilter<"Invoice"> | string;
    customerId?: Prisma.StringNullableFilter<"Invoice"> | string | null;
    sellerId?: Prisma.StringFilter<"Invoice"> | string;
    tenant?: Prisma.XOR<Prisma.TenantScalarRelationFilter, Prisma.TenantWhereInput>;
    customer?: Prisma.XOR<Prisma.CustomerNullableScalarRelationFilter, Prisma.CustomerWhereInput> | null;
    seller?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    items?: Prisma.InvoiceItemListRelationFilter;
};
export type InvoiceOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    invoiceNumber?: Prisma.SortOrder;
    total?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    paymentMethod?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    customerId?: Prisma.SortOrderInput | Prisma.SortOrder;
    sellerId?: Prisma.SortOrder;
    tenant?: Prisma.TenantOrderByWithRelationInput;
    customer?: Prisma.CustomerOrderByWithRelationInput;
    seller?: Prisma.UserOrderByWithRelationInput;
    items?: Prisma.InvoiceItemOrderByRelationAggregateInput;
};
export type InvoiceWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.InvoiceWhereInput | Prisma.InvoiceWhereInput[];
    OR?: Prisma.InvoiceWhereInput[];
    NOT?: Prisma.InvoiceWhereInput | Prisma.InvoiceWhereInput[];
    invoiceNumber?: Prisma.IntFilter<"Invoice"> | number;
    total?: Prisma.DecimalFilter<"Invoice"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumInvoiceStatusFilter<"Invoice"> | $Enums.InvoiceStatus;
    paymentMethod?: Prisma.EnumPaymentMethodFilter<"Invoice"> | $Enums.PaymentMethod;
    createdAt?: Prisma.DateTimeFilter<"Invoice"> | Date | string;
    tenantId?: Prisma.StringFilter<"Invoice"> | string;
    customerId?: Prisma.StringNullableFilter<"Invoice"> | string | null;
    sellerId?: Prisma.StringFilter<"Invoice"> | string;
    tenant?: Prisma.XOR<Prisma.TenantScalarRelationFilter, Prisma.TenantWhereInput>;
    customer?: Prisma.XOR<Prisma.CustomerNullableScalarRelationFilter, Prisma.CustomerWhereInput> | null;
    seller?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    items?: Prisma.InvoiceItemListRelationFilter;
}, "id">;
export type InvoiceOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    invoiceNumber?: Prisma.SortOrder;
    total?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    paymentMethod?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    customerId?: Prisma.SortOrderInput | Prisma.SortOrder;
    sellerId?: Prisma.SortOrder;
    _count?: Prisma.InvoiceCountOrderByAggregateInput;
    _avg?: Prisma.InvoiceAvgOrderByAggregateInput;
    _max?: Prisma.InvoiceMaxOrderByAggregateInput;
    _min?: Prisma.InvoiceMinOrderByAggregateInput;
    _sum?: Prisma.InvoiceSumOrderByAggregateInput;
};
export type InvoiceScalarWhereWithAggregatesInput = {
    AND?: Prisma.InvoiceScalarWhereWithAggregatesInput | Prisma.InvoiceScalarWhereWithAggregatesInput[];
    OR?: Prisma.InvoiceScalarWhereWithAggregatesInput[];
    NOT?: Prisma.InvoiceScalarWhereWithAggregatesInput | Prisma.InvoiceScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"Invoice"> | string;
    invoiceNumber?: Prisma.IntWithAggregatesFilter<"Invoice"> | number;
    total?: Prisma.DecimalWithAggregatesFilter<"Invoice"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumInvoiceStatusWithAggregatesFilter<"Invoice"> | $Enums.InvoiceStatus;
    paymentMethod?: Prisma.EnumPaymentMethodWithAggregatesFilter<"Invoice"> | $Enums.PaymentMethod;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Invoice"> | Date | string;
    tenantId?: Prisma.StringWithAggregatesFilter<"Invoice"> | string;
    customerId?: Prisma.StringNullableWithAggregatesFilter<"Invoice"> | string | null;
    sellerId?: Prisma.StringWithAggregatesFilter<"Invoice"> | string;
};
export type InvoiceCreateInput = {
    id?: string;
    invoiceNumber?: number;
    total: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.InvoiceStatus;
    paymentMethod: $Enums.PaymentMethod;
    createdAt?: Date | string;
    tenant: Prisma.TenantCreateNestedOneWithoutInvoicesInput;
    customer?: Prisma.CustomerCreateNestedOneWithoutInvoicesInput;
    seller: Prisma.UserCreateNestedOneWithoutSalesInput;
    items?: Prisma.InvoiceItemCreateNestedManyWithoutInvoiceInput;
};
export type InvoiceUncheckedCreateInput = {
    id?: string;
    invoiceNumber?: number;
    total: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.InvoiceStatus;
    paymentMethod: $Enums.PaymentMethod;
    createdAt?: Date | string;
    tenantId: string;
    customerId?: string | null;
    sellerId: string;
    items?: Prisma.InvoiceItemUncheckedCreateNestedManyWithoutInvoiceInput;
};
export type InvoiceUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    invoiceNumber?: Prisma.IntFieldUpdateOperationsInput | number;
    total?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumInvoiceStatusFieldUpdateOperationsInput | $Enums.InvoiceStatus;
    paymentMethod?: Prisma.EnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tenant?: Prisma.TenantUpdateOneRequiredWithoutInvoicesNestedInput;
    customer?: Prisma.CustomerUpdateOneWithoutInvoicesNestedInput;
    seller?: Prisma.UserUpdateOneRequiredWithoutSalesNestedInput;
    items?: Prisma.InvoiceItemUpdateManyWithoutInvoiceNestedInput;
};
export type InvoiceUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    invoiceNumber?: Prisma.IntFieldUpdateOperationsInput | number;
    total?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumInvoiceStatusFieldUpdateOperationsInput | $Enums.InvoiceStatus;
    paymentMethod?: Prisma.EnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    customerId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    sellerId?: Prisma.StringFieldUpdateOperationsInput | string;
    items?: Prisma.InvoiceItemUncheckedUpdateManyWithoutInvoiceNestedInput;
};
export type InvoiceCreateManyInput = {
    id?: string;
    invoiceNumber?: number;
    total: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.InvoiceStatus;
    paymentMethod: $Enums.PaymentMethod;
    createdAt?: Date | string;
    tenantId: string;
    customerId?: string | null;
    sellerId: string;
};
export type InvoiceUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    invoiceNumber?: Prisma.IntFieldUpdateOperationsInput | number;
    total?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumInvoiceStatusFieldUpdateOperationsInput | $Enums.InvoiceStatus;
    paymentMethod?: Prisma.EnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type InvoiceUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    invoiceNumber?: Prisma.IntFieldUpdateOperationsInput | number;
    total?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumInvoiceStatusFieldUpdateOperationsInput | $Enums.InvoiceStatus;
    paymentMethod?: Prisma.EnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    customerId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    sellerId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type InvoiceListRelationFilter = {
    every?: Prisma.InvoiceWhereInput;
    some?: Prisma.InvoiceWhereInput;
    none?: Prisma.InvoiceWhereInput;
};
export type InvoiceOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type InvoiceCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    invoiceNumber?: Prisma.SortOrder;
    total?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    paymentMethod?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    customerId?: Prisma.SortOrder;
    sellerId?: Prisma.SortOrder;
};
export type InvoiceAvgOrderByAggregateInput = {
    invoiceNumber?: Prisma.SortOrder;
    total?: Prisma.SortOrder;
};
export type InvoiceMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    invoiceNumber?: Prisma.SortOrder;
    total?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    paymentMethod?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    customerId?: Prisma.SortOrder;
    sellerId?: Prisma.SortOrder;
};
export type InvoiceMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    invoiceNumber?: Prisma.SortOrder;
    total?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    paymentMethod?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    customerId?: Prisma.SortOrder;
    sellerId?: Prisma.SortOrder;
};
export type InvoiceSumOrderByAggregateInput = {
    invoiceNumber?: Prisma.SortOrder;
    total?: Prisma.SortOrder;
};
export type InvoiceScalarRelationFilter = {
    is?: Prisma.InvoiceWhereInput;
    isNot?: Prisma.InvoiceWhereInput;
};
export type InvoiceCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.InvoiceCreateWithoutTenantInput, Prisma.InvoiceUncheckedCreateWithoutTenantInput> | Prisma.InvoiceCreateWithoutTenantInput[] | Prisma.InvoiceUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.InvoiceCreateOrConnectWithoutTenantInput | Prisma.InvoiceCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.InvoiceCreateManyTenantInputEnvelope;
    connect?: Prisma.InvoiceWhereUniqueInput | Prisma.InvoiceWhereUniqueInput[];
};
export type InvoiceUncheckedCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.InvoiceCreateWithoutTenantInput, Prisma.InvoiceUncheckedCreateWithoutTenantInput> | Prisma.InvoiceCreateWithoutTenantInput[] | Prisma.InvoiceUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.InvoiceCreateOrConnectWithoutTenantInput | Prisma.InvoiceCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.InvoiceCreateManyTenantInputEnvelope;
    connect?: Prisma.InvoiceWhereUniqueInput | Prisma.InvoiceWhereUniqueInput[];
};
export type InvoiceUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.InvoiceCreateWithoutTenantInput, Prisma.InvoiceUncheckedCreateWithoutTenantInput> | Prisma.InvoiceCreateWithoutTenantInput[] | Prisma.InvoiceUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.InvoiceCreateOrConnectWithoutTenantInput | Prisma.InvoiceCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.InvoiceUpsertWithWhereUniqueWithoutTenantInput | Prisma.InvoiceUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.InvoiceCreateManyTenantInputEnvelope;
    set?: Prisma.InvoiceWhereUniqueInput | Prisma.InvoiceWhereUniqueInput[];
    disconnect?: Prisma.InvoiceWhereUniqueInput | Prisma.InvoiceWhereUniqueInput[];
    delete?: Prisma.InvoiceWhereUniqueInput | Prisma.InvoiceWhereUniqueInput[];
    connect?: Prisma.InvoiceWhereUniqueInput | Prisma.InvoiceWhereUniqueInput[];
    update?: Prisma.InvoiceUpdateWithWhereUniqueWithoutTenantInput | Prisma.InvoiceUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.InvoiceUpdateManyWithWhereWithoutTenantInput | Prisma.InvoiceUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.InvoiceScalarWhereInput | Prisma.InvoiceScalarWhereInput[];
};
export type InvoiceUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.InvoiceCreateWithoutTenantInput, Prisma.InvoiceUncheckedCreateWithoutTenantInput> | Prisma.InvoiceCreateWithoutTenantInput[] | Prisma.InvoiceUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.InvoiceCreateOrConnectWithoutTenantInput | Prisma.InvoiceCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.InvoiceUpsertWithWhereUniqueWithoutTenantInput | Prisma.InvoiceUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.InvoiceCreateManyTenantInputEnvelope;
    set?: Prisma.InvoiceWhereUniqueInput | Prisma.InvoiceWhereUniqueInput[];
    disconnect?: Prisma.InvoiceWhereUniqueInput | Prisma.InvoiceWhereUniqueInput[];
    delete?: Prisma.InvoiceWhereUniqueInput | Prisma.InvoiceWhereUniqueInput[];
    connect?: Prisma.InvoiceWhereUniqueInput | Prisma.InvoiceWhereUniqueInput[];
    update?: Prisma.InvoiceUpdateWithWhereUniqueWithoutTenantInput | Prisma.InvoiceUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.InvoiceUpdateManyWithWhereWithoutTenantInput | Prisma.InvoiceUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.InvoiceScalarWhereInput | Prisma.InvoiceScalarWhereInput[];
};
export type InvoiceCreateNestedManyWithoutSellerInput = {
    create?: Prisma.XOR<Prisma.InvoiceCreateWithoutSellerInput, Prisma.InvoiceUncheckedCreateWithoutSellerInput> | Prisma.InvoiceCreateWithoutSellerInput[] | Prisma.InvoiceUncheckedCreateWithoutSellerInput[];
    connectOrCreate?: Prisma.InvoiceCreateOrConnectWithoutSellerInput | Prisma.InvoiceCreateOrConnectWithoutSellerInput[];
    createMany?: Prisma.InvoiceCreateManySellerInputEnvelope;
    connect?: Prisma.InvoiceWhereUniqueInput | Prisma.InvoiceWhereUniqueInput[];
};
export type InvoiceUncheckedCreateNestedManyWithoutSellerInput = {
    create?: Prisma.XOR<Prisma.InvoiceCreateWithoutSellerInput, Prisma.InvoiceUncheckedCreateWithoutSellerInput> | Prisma.InvoiceCreateWithoutSellerInput[] | Prisma.InvoiceUncheckedCreateWithoutSellerInput[];
    connectOrCreate?: Prisma.InvoiceCreateOrConnectWithoutSellerInput | Prisma.InvoiceCreateOrConnectWithoutSellerInput[];
    createMany?: Prisma.InvoiceCreateManySellerInputEnvelope;
    connect?: Prisma.InvoiceWhereUniqueInput | Prisma.InvoiceWhereUniqueInput[];
};
export type InvoiceUpdateManyWithoutSellerNestedInput = {
    create?: Prisma.XOR<Prisma.InvoiceCreateWithoutSellerInput, Prisma.InvoiceUncheckedCreateWithoutSellerInput> | Prisma.InvoiceCreateWithoutSellerInput[] | Prisma.InvoiceUncheckedCreateWithoutSellerInput[];
    connectOrCreate?: Prisma.InvoiceCreateOrConnectWithoutSellerInput | Prisma.InvoiceCreateOrConnectWithoutSellerInput[];
    upsert?: Prisma.InvoiceUpsertWithWhereUniqueWithoutSellerInput | Prisma.InvoiceUpsertWithWhereUniqueWithoutSellerInput[];
    createMany?: Prisma.InvoiceCreateManySellerInputEnvelope;
    set?: Prisma.InvoiceWhereUniqueInput | Prisma.InvoiceWhereUniqueInput[];
    disconnect?: Prisma.InvoiceWhereUniqueInput | Prisma.InvoiceWhereUniqueInput[];
    delete?: Prisma.InvoiceWhereUniqueInput | Prisma.InvoiceWhereUniqueInput[];
    connect?: Prisma.InvoiceWhereUniqueInput | Prisma.InvoiceWhereUniqueInput[];
    update?: Prisma.InvoiceUpdateWithWhereUniqueWithoutSellerInput | Prisma.InvoiceUpdateWithWhereUniqueWithoutSellerInput[];
    updateMany?: Prisma.InvoiceUpdateManyWithWhereWithoutSellerInput | Prisma.InvoiceUpdateManyWithWhereWithoutSellerInput[];
    deleteMany?: Prisma.InvoiceScalarWhereInput | Prisma.InvoiceScalarWhereInput[];
};
export type InvoiceUncheckedUpdateManyWithoutSellerNestedInput = {
    create?: Prisma.XOR<Prisma.InvoiceCreateWithoutSellerInput, Prisma.InvoiceUncheckedCreateWithoutSellerInput> | Prisma.InvoiceCreateWithoutSellerInput[] | Prisma.InvoiceUncheckedCreateWithoutSellerInput[];
    connectOrCreate?: Prisma.InvoiceCreateOrConnectWithoutSellerInput | Prisma.InvoiceCreateOrConnectWithoutSellerInput[];
    upsert?: Prisma.InvoiceUpsertWithWhereUniqueWithoutSellerInput | Prisma.InvoiceUpsertWithWhereUniqueWithoutSellerInput[];
    createMany?: Prisma.InvoiceCreateManySellerInputEnvelope;
    set?: Prisma.InvoiceWhereUniqueInput | Prisma.InvoiceWhereUniqueInput[];
    disconnect?: Prisma.InvoiceWhereUniqueInput | Prisma.InvoiceWhereUniqueInput[];
    delete?: Prisma.InvoiceWhereUniqueInput | Prisma.InvoiceWhereUniqueInput[];
    connect?: Prisma.InvoiceWhereUniqueInput | Prisma.InvoiceWhereUniqueInput[];
    update?: Prisma.InvoiceUpdateWithWhereUniqueWithoutSellerInput | Prisma.InvoiceUpdateWithWhereUniqueWithoutSellerInput[];
    updateMany?: Prisma.InvoiceUpdateManyWithWhereWithoutSellerInput | Prisma.InvoiceUpdateManyWithWhereWithoutSellerInput[];
    deleteMany?: Prisma.InvoiceScalarWhereInput | Prisma.InvoiceScalarWhereInput[];
};
export type InvoiceCreateNestedManyWithoutCustomerInput = {
    create?: Prisma.XOR<Prisma.InvoiceCreateWithoutCustomerInput, Prisma.InvoiceUncheckedCreateWithoutCustomerInput> | Prisma.InvoiceCreateWithoutCustomerInput[] | Prisma.InvoiceUncheckedCreateWithoutCustomerInput[];
    connectOrCreate?: Prisma.InvoiceCreateOrConnectWithoutCustomerInput | Prisma.InvoiceCreateOrConnectWithoutCustomerInput[];
    createMany?: Prisma.InvoiceCreateManyCustomerInputEnvelope;
    connect?: Prisma.InvoiceWhereUniqueInput | Prisma.InvoiceWhereUniqueInput[];
};
export type InvoiceUncheckedCreateNestedManyWithoutCustomerInput = {
    create?: Prisma.XOR<Prisma.InvoiceCreateWithoutCustomerInput, Prisma.InvoiceUncheckedCreateWithoutCustomerInput> | Prisma.InvoiceCreateWithoutCustomerInput[] | Prisma.InvoiceUncheckedCreateWithoutCustomerInput[];
    connectOrCreate?: Prisma.InvoiceCreateOrConnectWithoutCustomerInput | Prisma.InvoiceCreateOrConnectWithoutCustomerInput[];
    createMany?: Prisma.InvoiceCreateManyCustomerInputEnvelope;
    connect?: Prisma.InvoiceWhereUniqueInput | Prisma.InvoiceWhereUniqueInput[];
};
export type InvoiceUpdateManyWithoutCustomerNestedInput = {
    create?: Prisma.XOR<Prisma.InvoiceCreateWithoutCustomerInput, Prisma.InvoiceUncheckedCreateWithoutCustomerInput> | Prisma.InvoiceCreateWithoutCustomerInput[] | Prisma.InvoiceUncheckedCreateWithoutCustomerInput[];
    connectOrCreate?: Prisma.InvoiceCreateOrConnectWithoutCustomerInput | Prisma.InvoiceCreateOrConnectWithoutCustomerInput[];
    upsert?: Prisma.InvoiceUpsertWithWhereUniqueWithoutCustomerInput | Prisma.InvoiceUpsertWithWhereUniqueWithoutCustomerInput[];
    createMany?: Prisma.InvoiceCreateManyCustomerInputEnvelope;
    set?: Prisma.InvoiceWhereUniqueInput | Prisma.InvoiceWhereUniqueInput[];
    disconnect?: Prisma.InvoiceWhereUniqueInput | Prisma.InvoiceWhereUniqueInput[];
    delete?: Prisma.InvoiceWhereUniqueInput | Prisma.InvoiceWhereUniqueInput[];
    connect?: Prisma.InvoiceWhereUniqueInput | Prisma.InvoiceWhereUniqueInput[];
    update?: Prisma.InvoiceUpdateWithWhereUniqueWithoutCustomerInput | Prisma.InvoiceUpdateWithWhereUniqueWithoutCustomerInput[];
    updateMany?: Prisma.InvoiceUpdateManyWithWhereWithoutCustomerInput | Prisma.InvoiceUpdateManyWithWhereWithoutCustomerInput[];
    deleteMany?: Prisma.InvoiceScalarWhereInput | Prisma.InvoiceScalarWhereInput[];
};
export type InvoiceUncheckedUpdateManyWithoutCustomerNestedInput = {
    create?: Prisma.XOR<Prisma.InvoiceCreateWithoutCustomerInput, Prisma.InvoiceUncheckedCreateWithoutCustomerInput> | Prisma.InvoiceCreateWithoutCustomerInput[] | Prisma.InvoiceUncheckedCreateWithoutCustomerInput[];
    connectOrCreate?: Prisma.InvoiceCreateOrConnectWithoutCustomerInput | Prisma.InvoiceCreateOrConnectWithoutCustomerInput[];
    upsert?: Prisma.InvoiceUpsertWithWhereUniqueWithoutCustomerInput | Prisma.InvoiceUpsertWithWhereUniqueWithoutCustomerInput[];
    createMany?: Prisma.InvoiceCreateManyCustomerInputEnvelope;
    set?: Prisma.InvoiceWhereUniqueInput | Prisma.InvoiceWhereUniqueInput[];
    disconnect?: Prisma.InvoiceWhereUniqueInput | Prisma.InvoiceWhereUniqueInput[];
    delete?: Prisma.InvoiceWhereUniqueInput | Prisma.InvoiceWhereUniqueInput[];
    connect?: Prisma.InvoiceWhereUniqueInput | Prisma.InvoiceWhereUniqueInput[];
    update?: Prisma.InvoiceUpdateWithWhereUniqueWithoutCustomerInput | Prisma.InvoiceUpdateWithWhereUniqueWithoutCustomerInput[];
    updateMany?: Prisma.InvoiceUpdateManyWithWhereWithoutCustomerInput | Prisma.InvoiceUpdateManyWithWhereWithoutCustomerInput[];
    deleteMany?: Prisma.InvoiceScalarWhereInput | Prisma.InvoiceScalarWhereInput[];
};
export type EnumInvoiceStatusFieldUpdateOperationsInput = {
    set?: $Enums.InvoiceStatus;
};
export type EnumPaymentMethodFieldUpdateOperationsInput = {
    set?: $Enums.PaymentMethod;
};
export type InvoiceCreateNestedOneWithoutItemsInput = {
    create?: Prisma.XOR<Prisma.InvoiceCreateWithoutItemsInput, Prisma.InvoiceUncheckedCreateWithoutItemsInput>;
    connectOrCreate?: Prisma.InvoiceCreateOrConnectWithoutItemsInput;
    connect?: Prisma.InvoiceWhereUniqueInput;
};
export type InvoiceUpdateOneRequiredWithoutItemsNestedInput = {
    create?: Prisma.XOR<Prisma.InvoiceCreateWithoutItemsInput, Prisma.InvoiceUncheckedCreateWithoutItemsInput>;
    connectOrCreate?: Prisma.InvoiceCreateOrConnectWithoutItemsInput;
    upsert?: Prisma.InvoiceUpsertWithoutItemsInput;
    connect?: Prisma.InvoiceWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.InvoiceUpdateToOneWithWhereWithoutItemsInput, Prisma.InvoiceUpdateWithoutItemsInput>, Prisma.InvoiceUncheckedUpdateWithoutItemsInput>;
};
export type InvoiceCreateWithoutTenantInput = {
    id?: string;
    invoiceNumber?: number;
    total: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.InvoiceStatus;
    paymentMethod: $Enums.PaymentMethod;
    createdAt?: Date | string;
    customer?: Prisma.CustomerCreateNestedOneWithoutInvoicesInput;
    seller: Prisma.UserCreateNestedOneWithoutSalesInput;
    items?: Prisma.InvoiceItemCreateNestedManyWithoutInvoiceInput;
};
export type InvoiceUncheckedCreateWithoutTenantInput = {
    id?: string;
    invoiceNumber?: number;
    total: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.InvoiceStatus;
    paymentMethod: $Enums.PaymentMethod;
    createdAt?: Date | string;
    customerId?: string | null;
    sellerId: string;
    items?: Prisma.InvoiceItemUncheckedCreateNestedManyWithoutInvoiceInput;
};
export type InvoiceCreateOrConnectWithoutTenantInput = {
    where: Prisma.InvoiceWhereUniqueInput;
    create: Prisma.XOR<Prisma.InvoiceCreateWithoutTenantInput, Prisma.InvoiceUncheckedCreateWithoutTenantInput>;
};
export type InvoiceCreateManyTenantInputEnvelope = {
    data: Prisma.InvoiceCreateManyTenantInput | Prisma.InvoiceCreateManyTenantInput[];
    skipDuplicates?: boolean;
};
export type InvoiceUpsertWithWhereUniqueWithoutTenantInput = {
    where: Prisma.InvoiceWhereUniqueInput;
    update: Prisma.XOR<Prisma.InvoiceUpdateWithoutTenantInput, Prisma.InvoiceUncheckedUpdateWithoutTenantInput>;
    create: Prisma.XOR<Prisma.InvoiceCreateWithoutTenantInput, Prisma.InvoiceUncheckedCreateWithoutTenantInput>;
};
export type InvoiceUpdateWithWhereUniqueWithoutTenantInput = {
    where: Prisma.InvoiceWhereUniqueInput;
    data: Prisma.XOR<Prisma.InvoiceUpdateWithoutTenantInput, Prisma.InvoiceUncheckedUpdateWithoutTenantInput>;
};
export type InvoiceUpdateManyWithWhereWithoutTenantInput = {
    where: Prisma.InvoiceScalarWhereInput;
    data: Prisma.XOR<Prisma.InvoiceUpdateManyMutationInput, Prisma.InvoiceUncheckedUpdateManyWithoutTenantInput>;
};
export type InvoiceScalarWhereInput = {
    AND?: Prisma.InvoiceScalarWhereInput | Prisma.InvoiceScalarWhereInput[];
    OR?: Prisma.InvoiceScalarWhereInput[];
    NOT?: Prisma.InvoiceScalarWhereInput | Prisma.InvoiceScalarWhereInput[];
    id?: Prisma.StringFilter<"Invoice"> | string;
    invoiceNumber?: Prisma.IntFilter<"Invoice"> | number;
    total?: Prisma.DecimalFilter<"Invoice"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumInvoiceStatusFilter<"Invoice"> | $Enums.InvoiceStatus;
    paymentMethod?: Prisma.EnumPaymentMethodFilter<"Invoice"> | $Enums.PaymentMethod;
    createdAt?: Prisma.DateTimeFilter<"Invoice"> | Date | string;
    tenantId?: Prisma.StringFilter<"Invoice"> | string;
    customerId?: Prisma.StringNullableFilter<"Invoice"> | string | null;
    sellerId?: Prisma.StringFilter<"Invoice"> | string;
};
export type InvoiceCreateWithoutSellerInput = {
    id?: string;
    invoiceNumber?: number;
    total: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.InvoiceStatus;
    paymentMethod: $Enums.PaymentMethod;
    createdAt?: Date | string;
    tenant: Prisma.TenantCreateNestedOneWithoutInvoicesInput;
    customer?: Prisma.CustomerCreateNestedOneWithoutInvoicesInput;
    items?: Prisma.InvoiceItemCreateNestedManyWithoutInvoiceInput;
};
export type InvoiceUncheckedCreateWithoutSellerInput = {
    id?: string;
    invoiceNumber?: number;
    total: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.InvoiceStatus;
    paymentMethod: $Enums.PaymentMethod;
    createdAt?: Date | string;
    tenantId: string;
    customerId?: string | null;
    items?: Prisma.InvoiceItemUncheckedCreateNestedManyWithoutInvoiceInput;
};
export type InvoiceCreateOrConnectWithoutSellerInput = {
    where: Prisma.InvoiceWhereUniqueInput;
    create: Prisma.XOR<Prisma.InvoiceCreateWithoutSellerInput, Prisma.InvoiceUncheckedCreateWithoutSellerInput>;
};
export type InvoiceCreateManySellerInputEnvelope = {
    data: Prisma.InvoiceCreateManySellerInput | Prisma.InvoiceCreateManySellerInput[];
    skipDuplicates?: boolean;
};
export type InvoiceUpsertWithWhereUniqueWithoutSellerInput = {
    where: Prisma.InvoiceWhereUniqueInput;
    update: Prisma.XOR<Prisma.InvoiceUpdateWithoutSellerInput, Prisma.InvoiceUncheckedUpdateWithoutSellerInput>;
    create: Prisma.XOR<Prisma.InvoiceCreateWithoutSellerInput, Prisma.InvoiceUncheckedCreateWithoutSellerInput>;
};
export type InvoiceUpdateWithWhereUniqueWithoutSellerInput = {
    where: Prisma.InvoiceWhereUniqueInput;
    data: Prisma.XOR<Prisma.InvoiceUpdateWithoutSellerInput, Prisma.InvoiceUncheckedUpdateWithoutSellerInput>;
};
export type InvoiceUpdateManyWithWhereWithoutSellerInput = {
    where: Prisma.InvoiceScalarWhereInput;
    data: Prisma.XOR<Prisma.InvoiceUpdateManyMutationInput, Prisma.InvoiceUncheckedUpdateManyWithoutSellerInput>;
};
export type InvoiceCreateWithoutCustomerInput = {
    id?: string;
    invoiceNumber?: number;
    total: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.InvoiceStatus;
    paymentMethod: $Enums.PaymentMethod;
    createdAt?: Date | string;
    tenant: Prisma.TenantCreateNestedOneWithoutInvoicesInput;
    seller: Prisma.UserCreateNestedOneWithoutSalesInput;
    items?: Prisma.InvoiceItemCreateNestedManyWithoutInvoiceInput;
};
export type InvoiceUncheckedCreateWithoutCustomerInput = {
    id?: string;
    invoiceNumber?: number;
    total: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.InvoiceStatus;
    paymentMethod: $Enums.PaymentMethod;
    createdAt?: Date | string;
    tenantId: string;
    sellerId: string;
    items?: Prisma.InvoiceItemUncheckedCreateNestedManyWithoutInvoiceInput;
};
export type InvoiceCreateOrConnectWithoutCustomerInput = {
    where: Prisma.InvoiceWhereUniqueInput;
    create: Prisma.XOR<Prisma.InvoiceCreateWithoutCustomerInput, Prisma.InvoiceUncheckedCreateWithoutCustomerInput>;
};
export type InvoiceCreateManyCustomerInputEnvelope = {
    data: Prisma.InvoiceCreateManyCustomerInput | Prisma.InvoiceCreateManyCustomerInput[];
    skipDuplicates?: boolean;
};
export type InvoiceUpsertWithWhereUniqueWithoutCustomerInput = {
    where: Prisma.InvoiceWhereUniqueInput;
    update: Prisma.XOR<Prisma.InvoiceUpdateWithoutCustomerInput, Prisma.InvoiceUncheckedUpdateWithoutCustomerInput>;
    create: Prisma.XOR<Prisma.InvoiceCreateWithoutCustomerInput, Prisma.InvoiceUncheckedCreateWithoutCustomerInput>;
};
export type InvoiceUpdateWithWhereUniqueWithoutCustomerInput = {
    where: Prisma.InvoiceWhereUniqueInput;
    data: Prisma.XOR<Prisma.InvoiceUpdateWithoutCustomerInput, Prisma.InvoiceUncheckedUpdateWithoutCustomerInput>;
};
export type InvoiceUpdateManyWithWhereWithoutCustomerInput = {
    where: Prisma.InvoiceScalarWhereInput;
    data: Prisma.XOR<Prisma.InvoiceUpdateManyMutationInput, Prisma.InvoiceUncheckedUpdateManyWithoutCustomerInput>;
};
export type InvoiceCreateWithoutItemsInput = {
    id?: string;
    invoiceNumber?: number;
    total: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.InvoiceStatus;
    paymentMethod: $Enums.PaymentMethod;
    createdAt?: Date | string;
    tenant: Prisma.TenantCreateNestedOneWithoutInvoicesInput;
    customer?: Prisma.CustomerCreateNestedOneWithoutInvoicesInput;
    seller: Prisma.UserCreateNestedOneWithoutSalesInput;
};
export type InvoiceUncheckedCreateWithoutItemsInput = {
    id?: string;
    invoiceNumber?: number;
    total: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.InvoiceStatus;
    paymentMethod: $Enums.PaymentMethod;
    createdAt?: Date | string;
    tenantId: string;
    customerId?: string | null;
    sellerId: string;
};
export type InvoiceCreateOrConnectWithoutItemsInput = {
    where: Prisma.InvoiceWhereUniqueInput;
    create: Prisma.XOR<Prisma.InvoiceCreateWithoutItemsInput, Prisma.InvoiceUncheckedCreateWithoutItemsInput>;
};
export type InvoiceUpsertWithoutItemsInput = {
    update: Prisma.XOR<Prisma.InvoiceUpdateWithoutItemsInput, Prisma.InvoiceUncheckedUpdateWithoutItemsInput>;
    create: Prisma.XOR<Prisma.InvoiceCreateWithoutItemsInput, Prisma.InvoiceUncheckedCreateWithoutItemsInput>;
    where?: Prisma.InvoiceWhereInput;
};
export type InvoiceUpdateToOneWithWhereWithoutItemsInput = {
    where?: Prisma.InvoiceWhereInput;
    data: Prisma.XOR<Prisma.InvoiceUpdateWithoutItemsInput, Prisma.InvoiceUncheckedUpdateWithoutItemsInput>;
};
export type InvoiceUpdateWithoutItemsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    invoiceNumber?: Prisma.IntFieldUpdateOperationsInput | number;
    total?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumInvoiceStatusFieldUpdateOperationsInput | $Enums.InvoiceStatus;
    paymentMethod?: Prisma.EnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tenant?: Prisma.TenantUpdateOneRequiredWithoutInvoicesNestedInput;
    customer?: Prisma.CustomerUpdateOneWithoutInvoicesNestedInput;
    seller?: Prisma.UserUpdateOneRequiredWithoutSalesNestedInput;
};
export type InvoiceUncheckedUpdateWithoutItemsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    invoiceNumber?: Prisma.IntFieldUpdateOperationsInput | number;
    total?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumInvoiceStatusFieldUpdateOperationsInput | $Enums.InvoiceStatus;
    paymentMethod?: Prisma.EnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    customerId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    sellerId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type InvoiceCreateManyTenantInput = {
    id?: string;
    invoiceNumber?: number;
    total: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.InvoiceStatus;
    paymentMethod: $Enums.PaymentMethod;
    createdAt?: Date | string;
    customerId?: string | null;
    sellerId: string;
};
export type InvoiceUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    invoiceNumber?: Prisma.IntFieldUpdateOperationsInput | number;
    total?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumInvoiceStatusFieldUpdateOperationsInput | $Enums.InvoiceStatus;
    paymentMethod?: Prisma.EnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    customer?: Prisma.CustomerUpdateOneWithoutInvoicesNestedInput;
    seller?: Prisma.UserUpdateOneRequiredWithoutSalesNestedInput;
    items?: Prisma.InvoiceItemUpdateManyWithoutInvoiceNestedInput;
};
export type InvoiceUncheckedUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    invoiceNumber?: Prisma.IntFieldUpdateOperationsInput | number;
    total?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumInvoiceStatusFieldUpdateOperationsInput | $Enums.InvoiceStatus;
    paymentMethod?: Prisma.EnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    customerId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    sellerId?: Prisma.StringFieldUpdateOperationsInput | string;
    items?: Prisma.InvoiceItemUncheckedUpdateManyWithoutInvoiceNestedInput;
};
export type InvoiceUncheckedUpdateManyWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    invoiceNumber?: Prisma.IntFieldUpdateOperationsInput | number;
    total?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumInvoiceStatusFieldUpdateOperationsInput | $Enums.InvoiceStatus;
    paymentMethod?: Prisma.EnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    customerId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    sellerId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type InvoiceCreateManySellerInput = {
    id?: string;
    invoiceNumber?: number;
    total: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.InvoiceStatus;
    paymentMethod: $Enums.PaymentMethod;
    createdAt?: Date | string;
    tenantId: string;
    customerId?: string | null;
};
export type InvoiceUpdateWithoutSellerInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    invoiceNumber?: Prisma.IntFieldUpdateOperationsInput | number;
    total?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumInvoiceStatusFieldUpdateOperationsInput | $Enums.InvoiceStatus;
    paymentMethod?: Prisma.EnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tenant?: Prisma.TenantUpdateOneRequiredWithoutInvoicesNestedInput;
    customer?: Prisma.CustomerUpdateOneWithoutInvoicesNestedInput;
    items?: Prisma.InvoiceItemUpdateManyWithoutInvoiceNestedInput;
};
export type InvoiceUncheckedUpdateWithoutSellerInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    invoiceNumber?: Prisma.IntFieldUpdateOperationsInput | number;
    total?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumInvoiceStatusFieldUpdateOperationsInput | $Enums.InvoiceStatus;
    paymentMethod?: Prisma.EnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    customerId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    items?: Prisma.InvoiceItemUncheckedUpdateManyWithoutInvoiceNestedInput;
};
export type InvoiceUncheckedUpdateManyWithoutSellerInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    invoiceNumber?: Prisma.IntFieldUpdateOperationsInput | number;
    total?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumInvoiceStatusFieldUpdateOperationsInput | $Enums.InvoiceStatus;
    paymentMethod?: Prisma.EnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    customerId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type InvoiceCreateManyCustomerInput = {
    id?: string;
    invoiceNumber?: number;
    total: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.InvoiceStatus;
    paymentMethod: $Enums.PaymentMethod;
    createdAt?: Date | string;
    tenantId: string;
    sellerId: string;
};
export type InvoiceUpdateWithoutCustomerInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    invoiceNumber?: Prisma.IntFieldUpdateOperationsInput | number;
    total?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumInvoiceStatusFieldUpdateOperationsInput | $Enums.InvoiceStatus;
    paymentMethod?: Prisma.EnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tenant?: Prisma.TenantUpdateOneRequiredWithoutInvoicesNestedInput;
    seller?: Prisma.UserUpdateOneRequiredWithoutSalesNestedInput;
    items?: Prisma.InvoiceItemUpdateManyWithoutInvoiceNestedInput;
};
export type InvoiceUncheckedUpdateWithoutCustomerInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    invoiceNumber?: Prisma.IntFieldUpdateOperationsInput | number;
    total?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumInvoiceStatusFieldUpdateOperationsInput | $Enums.InvoiceStatus;
    paymentMethod?: Prisma.EnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    sellerId?: Prisma.StringFieldUpdateOperationsInput | string;
    items?: Prisma.InvoiceItemUncheckedUpdateManyWithoutInvoiceNestedInput;
};
export type InvoiceUncheckedUpdateManyWithoutCustomerInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    invoiceNumber?: Prisma.IntFieldUpdateOperationsInput | number;
    total?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumInvoiceStatusFieldUpdateOperationsInput | $Enums.InvoiceStatus;
    paymentMethod?: Prisma.EnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    sellerId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type InvoiceCountOutputType = {
    items: number;
};
export type InvoiceCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    items?: boolean | InvoiceCountOutputTypeCountItemsArgs;
};
export type InvoiceCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InvoiceCountOutputTypeSelect<ExtArgs> | null;
};
export type InvoiceCountOutputTypeCountItemsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.InvoiceItemWhereInput;
};
export type InvoiceSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    invoiceNumber?: boolean;
    total?: boolean;
    status?: boolean;
    paymentMethod?: boolean;
    createdAt?: boolean;
    tenantId?: boolean;
    customerId?: boolean;
    sellerId?: boolean;
    tenant?: boolean | Prisma.TenantDefaultArgs<ExtArgs>;
    customer?: boolean | Prisma.Invoice$customerArgs<ExtArgs>;
    seller?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    items?: boolean | Prisma.Invoice$itemsArgs<ExtArgs>;
    _count?: boolean | Prisma.InvoiceCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["invoice"]>;
export type InvoiceSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    invoiceNumber?: boolean;
    total?: boolean;
    status?: boolean;
    paymentMethod?: boolean;
    createdAt?: boolean;
    tenantId?: boolean;
    customerId?: boolean;
    sellerId?: boolean;
    tenant?: boolean | Prisma.TenantDefaultArgs<ExtArgs>;
    customer?: boolean | Prisma.Invoice$customerArgs<ExtArgs>;
    seller?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["invoice"]>;
export type InvoiceSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    invoiceNumber?: boolean;
    total?: boolean;
    status?: boolean;
    paymentMethod?: boolean;
    createdAt?: boolean;
    tenantId?: boolean;
    customerId?: boolean;
    sellerId?: boolean;
    tenant?: boolean | Prisma.TenantDefaultArgs<ExtArgs>;
    customer?: boolean | Prisma.Invoice$customerArgs<ExtArgs>;
    seller?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["invoice"]>;
export type InvoiceSelectScalar = {
    id?: boolean;
    invoiceNumber?: boolean;
    total?: boolean;
    status?: boolean;
    paymentMethod?: boolean;
    createdAt?: boolean;
    tenantId?: boolean;
    customerId?: boolean;
    sellerId?: boolean;
};
export type InvoiceOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "invoiceNumber" | "total" | "status" | "paymentMethod" | "createdAt" | "tenantId" | "customerId" | "sellerId", ExtArgs["result"]["invoice"]>;
export type InvoiceInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    tenant?: boolean | Prisma.TenantDefaultArgs<ExtArgs>;
    customer?: boolean | Prisma.Invoice$customerArgs<ExtArgs>;
    seller?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    items?: boolean | Prisma.Invoice$itemsArgs<ExtArgs>;
    _count?: boolean | Prisma.InvoiceCountOutputTypeDefaultArgs<ExtArgs>;
};
export type InvoiceIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    tenant?: boolean | Prisma.TenantDefaultArgs<ExtArgs>;
    customer?: boolean | Prisma.Invoice$customerArgs<ExtArgs>;
    seller?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type InvoiceIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    tenant?: boolean | Prisma.TenantDefaultArgs<ExtArgs>;
    customer?: boolean | Prisma.Invoice$customerArgs<ExtArgs>;
    seller?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type $InvoicePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Invoice";
    objects: {
        tenant: Prisma.$TenantPayload<ExtArgs>;
        customer: Prisma.$CustomerPayload<ExtArgs> | null;
        seller: Prisma.$UserPayload<ExtArgs>;
        items: Prisma.$InvoiceItemPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        invoiceNumber: number;
        total: runtime.Decimal;
        status: $Enums.InvoiceStatus;
        paymentMethod: $Enums.PaymentMethod;
        createdAt: Date;
        tenantId: string;
        customerId: string | null;
        sellerId: string;
    }, ExtArgs["result"]["invoice"]>;
    composites: {};
};
export type InvoiceGetPayload<S extends boolean | null | undefined | InvoiceDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$InvoicePayload, S>;
export type InvoiceCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<InvoiceFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: InvoiceCountAggregateInputType | true;
};
export interface InvoiceDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Invoice'];
        meta: {
            name: 'Invoice';
        };
    };
    findUnique<T extends InvoiceFindUniqueArgs>(args: Prisma.SelectSubset<T, InvoiceFindUniqueArgs<ExtArgs>>): Prisma.Prisma__InvoiceClient<runtime.Types.Result.GetResult<Prisma.$InvoicePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends InvoiceFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, InvoiceFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__InvoiceClient<runtime.Types.Result.GetResult<Prisma.$InvoicePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends InvoiceFindFirstArgs>(args?: Prisma.SelectSubset<T, InvoiceFindFirstArgs<ExtArgs>>): Prisma.Prisma__InvoiceClient<runtime.Types.Result.GetResult<Prisma.$InvoicePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends InvoiceFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, InvoiceFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__InvoiceClient<runtime.Types.Result.GetResult<Prisma.$InvoicePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends InvoiceFindManyArgs>(args?: Prisma.SelectSubset<T, InvoiceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$InvoicePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends InvoiceCreateArgs>(args: Prisma.SelectSubset<T, InvoiceCreateArgs<ExtArgs>>): Prisma.Prisma__InvoiceClient<runtime.Types.Result.GetResult<Prisma.$InvoicePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends InvoiceCreateManyArgs>(args?: Prisma.SelectSubset<T, InvoiceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends InvoiceCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, InvoiceCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$InvoicePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends InvoiceDeleteArgs>(args: Prisma.SelectSubset<T, InvoiceDeleteArgs<ExtArgs>>): Prisma.Prisma__InvoiceClient<runtime.Types.Result.GetResult<Prisma.$InvoicePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends InvoiceUpdateArgs>(args: Prisma.SelectSubset<T, InvoiceUpdateArgs<ExtArgs>>): Prisma.Prisma__InvoiceClient<runtime.Types.Result.GetResult<Prisma.$InvoicePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends InvoiceDeleteManyArgs>(args?: Prisma.SelectSubset<T, InvoiceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends InvoiceUpdateManyArgs>(args: Prisma.SelectSubset<T, InvoiceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends InvoiceUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, InvoiceUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$InvoicePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends InvoiceUpsertArgs>(args: Prisma.SelectSubset<T, InvoiceUpsertArgs<ExtArgs>>): Prisma.Prisma__InvoiceClient<runtime.Types.Result.GetResult<Prisma.$InvoicePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends InvoiceCountArgs>(args?: Prisma.Subset<T, InvoiceCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], InvoiceCountAggregateOutputType> : number>;
    aggregate<T extends InvoiceAggregateArgs>(args: Prisma.Subset<T, InvoiceAggregateArgs>): Prisma.PrismaPromise<GetInvoiceAggregateType<T>>;
    groupBy<T extends InvoiceGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: InvoiceGroupByArgs['orderBy'];
    } : {
        orderBy?: InvoiceGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, InvoiceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInvoiceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: InvoiceFieldRefs;
}
export interface Prisma__InvoiceClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    tenant<T extends Prisma.TenantDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TenantDefaultArgs<ExtArgs>>): Prisma.Prisma__TenantClient<runtime.Types.Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    customer<T extends Prisma.Invoice$customerArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Invoice$customerArgs<ExtArgs>>): Prisma.Prisma__CustomerClient<runtime.Types.Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    seller<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    items<T extends Prisma.Invoice$itemsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Invoice$itemsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$InvoiceItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface InvoiceFieldRefs {
    readonly id: Prisma.FieldRef<"Invoice", 'String'>;
    readonly invoiceNumber: Prisma.FieldRef<"Invoice", 'Int'>;
    readonly total: Prisma.FieldRef<"Invoice", 'Decimal'>;
    readonly status: Prisma.FieldRef<"Invoice", 'InvoiceStatus'>;
    readonly paymentMethod: Prisma.FieldRef<"Invoice", 'PaymentMethod'>;
    readonly createdAt: Prisma.FieldRef<"Invoice", 'DateTime'>;
    readonly tenantId: Prisma.FieldRef<"Invoice", 'String'>;
    readonly customerId: Prisma.FieldRef<"Invoice", 'String'>;
    readonly sellerId: Prisma.FieldRef<"Invoice", 'String'>;
}
export type InvoiceFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InvoiceSelect<ExtArgs> | null;
    omit?: Prisma.InvoiceOmit<ExtArgs> | null;
    include?: Prisma.InvoiceInclude<ExtArgs> | null;
    where: Prisma.InvoiceWhereUniqueInput;
};
export type InvoiceFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InvoiceSelect<ExtArgs> | null;
    omit?: Prisma.InvoiceOmit<ExtArgs> | null;
    include?: Prisma.InvoiceInclude<ExtArgs> | null;
    where: Prisma.InvoiceWhereUniqueInput;
};
export type InvoiceFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InvoiceSelect<ExtArgs> | null;
    omit?: Prisma.InvoiceOmit<ExtArgs> | null;
    include?: Prisma.InvoiceInclude<ExtArgs> | null;
    where?: Prisma.InvoiceWhereInput;
    orderBy?: Prisma.InvoiceOrderByWithRelationInput | Prisma.InvoiceOrderByWithRelationInput[];
    cursor?: Prisma.InvoiceWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.InvoiceScalarFieldEnum | Prisma.InvoiceScalarFieldEnum[];
};
export type InvoiceFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InvoiceSelect<ExtArgs> | null;
    omit?: Prisma.InvoiceOmit<ExtArgs> | null;
    include?: Prisma.InvoiceInclude<ExtArgs> | null;
    where?: Prisma.InvoiceWhereInput;
    orderBy?: Prisma.InvoiceOrderByWithRelationInput | Prisma.InvoiceOrderByWithRelationInput[];
    cursor?: Prisma.InvoiceWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.InvoiceScalarFieldEnum | Prisma.InvoiceScalarFieldEnum[];
};
export type InvoiceFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InvoiceSelect<ExtArgs> | null;
    omit?: Prisma.InvoiceOmit<ExtArgs> | null;
    include?: Prisma.InvoiceInclude<ExtArgs> | null;
    where?: Prisma.InvoiceWhereInput;
    orderBy?: Prisma.InvoiceOrderByWithRelationInput | Prisma.InvoiceOrderByWithRelationInput[];
    cursor?: Prisma.InvoiceWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.InvoiceScalarFieldEnum | Prisma.InvoiceScalarFieldEnum[];
};
export type InvoiceCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InvoiceSelect<ExtArgs> | null;
    omit?: Prisma.InvoiceOmit<ExtArgs> | null;
    include?: Prisma.InvoiceInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.InvoiceCreateInput, Prisma.InvoiceUncheckedCreateInput>;
};
export type InvoiceCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.InvoiceCreateManyInput | Prisma.InvoiceCreateManyInput[];
    skipDuplicates?: boolean;
};
export type InvoiceCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InvoiceSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.InvoiceOmit<ExtArgs> | null;
    data: Prisma.InvoiceCreateManyInput | Prisma.InvoiceCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.InvoiceIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type InvoiceUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InvoiceSelect<ExtArgs> | null;
    omit?: Prisma.InvoiceOmit<ExtArgs> | null;
    include?: Prisma.InvoiceInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.InvoiceUpdateInput, Prisma.InvoiceUncheckedUpdateInput>;
    where: Prisma.InvoiceWhereUniqueInput;
};
export type InvoiceUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.InvoiceUpdateManyMutationInput, Prisma.InvoiceUncheckedUpdateManyInput>;
    where?: Prisma.InvoiceWhereInput;
    limit?: number;
};
export type InvoiceUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InvoiceSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.InvoiceOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.InvoiceUpdateManyMutationInput, Prisma.InvoiceUncheckedUpdateManyInput>;
    where?: Prisma.InvoiceWhereInput;
    limit?: number;
    include?: Prisma.InvoiceIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type InvoiceUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InvoiceSelect<ExtArgs> | null;
    omit?: Prisma.InvoiceOmit<ExtArgs> | null;
    include?: Prisma.InvoiceInclude<ExtArgs> | null;
    where: Prisma.InvoiceWhereUniqueInput;
    create: Prisma.XOR<Prisma.InvoiceCreateInput, Prisma.InvoiceUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.InvoiceUpdateInput, Prisma.InvoiceUncheckedUpdateInput>;
};
export type InvoiceDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InvoiceSelect<ExtArgs> | null;
    omit?: Prisma.InvoiceOmit<ExtArgs> | null;
    include?: Prisma.InvoiceInclude<ExtArgs> | null;
    where: Prisma.InvoiceWhereUniqueInput;
};
export type InvoiceDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.InvoiceWhereInput;
    limit?: number;
};
export type Invoice$customerArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CustomerSelect<ExtArgs> | null;
    omit?: Prisma.CustomerOmit<ExtArgs> | null;
    include?: Prisma.CustomerInclude<ExtArgs> | null;
    where?: Prisma.CustomerWhereInput;
};
export type Invoice$itemsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type InvoiceDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InvoiceSelect<ExtArgs> | null;
    omit?: Prisma.InvoiceOmit<ExtArgs> | null;
    include?: Prisma.InvoiceInclude<ExtArgs> | null;
};
export {};

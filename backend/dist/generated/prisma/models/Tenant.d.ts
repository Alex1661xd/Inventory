import type * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../internal/prismaNamespace.js";
export type TenantModel = runtime.Types.Result.DefaultSelection<Prisma.$TenantPayload>;
export type AggregateTenant = {
    _count: TenantCountAggregateOutputType | null;
    _min: TenantMinAggregateOutputType | null;
    _max: TenantMaxAggregateOutputType | null;
};
export type TenantMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    slug: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type TenantMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    slug: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type TenantCountAggregateOutputType = {
    id: number;
    name: number;
    slug: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type TenantMinAggregateInputType = {
    id?: true;
    name?: true;
    slug?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type TenantMaxAggregateInputType = {
    id?: true;
    name?: true;
    slug?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type TenantCountAggregateInputType = {
    id?: true;
    name?: true;
    slug?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type TenantAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TenantWhereInput;
    orderBy?: Prisma.TenantOrderByWithRelationInput | Prisma.TenantOrderByWithRelationInput[];
    cursor?: Prisma.TenantWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | TenantCountAggregateInputType;
    _min?: TenantMinAggregateInputType;
    _max?: TenantMaxAggregateInputType;
};
export type GetTenantAggregateType<T extends TenantAggregateArgs> = {
    [P in keyof T & keyof AggregateTenant]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateTenant[P]> : Prisma.GetScalarType<T[P], AggregateTenant[P]>;
};
export type TenantGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TenantWhereInput;
    orderBy?: Prisma.TenantOrderByWithAggregationInput | Prisma.TenantOrderByWithAggregationInput[];
    by: Prisma.TenantScalarFieldEnum[] | Prisma.TenantScalarFieldEnum;
    having?: Prisma.TenantScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: TenantCountAggregateInputType | true;
    _min?: TenantMinAggregateInputType;
    _max?: TenantMaxAggregateInputType;
};
export type TenantGroupByOutputType = {
    id: string;
    name: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
    _count: TenantCountAggregateOutputType | null;
    _min: TenantMinAggregateOutputType | null;
    _max: TenantMaxAggregateOutputType | null;
};
type GetTenantGroupByPayload<T extends TenantGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<TenantGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof TenantGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], TenantGroupByOutputType[P]> : Prisma.GetScalarType<T[P], TenantGroupByOutputType[P]>;
}>>;
export type TenantWhereInput = {
    AND?: Prisma.TenantWhereInput | Prisma.TenantWhereInput[];
    OR?: Prisma.TenantWhereInput[];
    NOT?: Prisma.TenantWhereInput | Prisma.TenantWhereInput[];
    id?: Prisma.StringFilter<"Tenant"> | string;
    name?: Prisma.StringFilter<"Tenant"> | string;
    slug?: Prisma.StringFilter<"Tenant"> | string;
    createdAt?: Prisma.DateTimeFilter<"Tenant"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Tenant"> | Date | string;
    users?: Prisma.UserListRelationFilter;
    products?: Prisma.ProductListRelationFilter;
    warehouses?: Prisma.WarehouseListRelationFilter;
    customers?: Prisma.CustomerListRelationFilter;
    invoices?: Prisma.InvoiceListRelationFilter;
    categories?: Prisma.CategoryListRelationFilter;
};
export type TenantOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    slug?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    users?: Prisma.UserOrderByRelationAggregateInput;
    products?: Prisma.ProductOrderByRelationAggregateInput;
    warehouses?: Prisma.WarehouseOrderByRelationAggregateInput;
    customers?: Prisma.CustomerOrderByRelationAggregateInput;
    invoices?: Prisma.InvoiceOrderByRelationAggregateInput;
    categories?: Prisma.CategoryOrderByRelationAggregateInput;
};
export type TenantWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    slug?: string;
    AND?: Prisma.TenantWhereInput | Prisma.TenantWhereInput[];
    OR?: Prisma.TenantWhereInput[];
    NOT?: Prisma.TenantWhereInput | Prisma.TenantWhereInput[];
    name?: Prisma.StringFilter<"Tenant"> | string;
    createdAt?: Prisma.DateTimeFilter<"Tenant"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Tenant"> | Date | string;
    users?: Prisma.UserListRelationFilter;
    products?: Prisma.ProductListRelationFilter;
    warehouses?: Prisma.WarehouseListRelationFilter;
    customers?: Prisma.CustomerListRelationFilter;
    invoices?: Prisma.InvoiceListRelationFilter;
    categories?: Prisma.CategoryListRelationFilter;
}, "id" | "slug">;
export type TenantOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    slug?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.TenantCountOrderByAggregateInput;
    _max?: Prisma.TenantMaxOrderByAggregateInput;
    _min?: Prisma.TenantMinOrderByAggregateInput;
};
export type TenantScalarWhereWithAggregatesInput = {
    AND?: Prisma.TenantScalarWhereWithAggregatesInput | Prisma.TenantScalarWhereWithAggregatesInput[];
    OR?: Prisma.TenantScalarWhereWithAggregatesInput[];
    NOT?: Prisma.TenantScalarWhereWithAggregatesInput | Prisma.TenantScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"Tenant"> | string;
    name?: Prisma.StringWithAggregatesFilter<"Tenant"> | string;
    slug?: Prisma.StringWithAggregatesFilter<"Tenant"> | string;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Tenant"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"Tenant"> | Date | string;
};
export type TenantCreateInput = {
    id?: string;
    name: string;
    slug: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    users?: Prisma.UserCreateNestedManyWithoutTenantInput;
    products?: Prisma.ProductCreateNestedManyWithoutTenantInput;
    warehouses?: Prisma.WarehouseCreateNestedManyWithoutTenantInput;
    customers?: Prisma.CustomerCreateNestedManyWithoutTenantInput;
    invoices?: Prisma.InvoiceCreateNestedManyWithoutTenantInput;
    categories?: Prisma.CategoryCreateNestedManyWithoutTenantInput;
};
export type TenantUncheckedCreateInput = {
    id?: string;
    name: string;
    slug: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    users?: Prisma.UserUncheckedCreateNestedManyWithoutTenantInput;
    products?: Prisma.ProductUncheckedCreateNestedManyWithoutTenantInput;
    warehouses?: Prisma.WarehouseUncheckedCreateNestedManyWithoutTenantInput;
    customers?: Prisma.CustomerUncheckedCreateNestedManyWithoutTenantInput;
    invoices?: Prisma.InvoiceUncheckedCreateNestedManyWithoutTenantInput;
    categories?: Prisma.CategoryUncheckedCreateNestedManyWithoutTenantInput;
};
export type TenantUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    slug?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    users?: Prisma.UserUpdateManyWithoutTenantNestedInput;
    products?: Prisma.ProductUpdateManyWithoutTenantNestedInput;
    warehouses?: Prisma.WarehouseUpdateManyWithoutTenantNestedInput;
    customers?: Prisma.CustomerUpdateManyWithoutTenantNestedInput;
    invoices?: Prisma.InvoiceUpdateManyWithoutTenantNestedInput;
    categories?: Prisma.CategoryUpdateManyWithoutTenantNestedInput;
};
export type TenantUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    slug?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    users?: Prisma.UserUncheckedUpdateManyWithoutTenantNestedInput;
    products?: Prisma.ProductUncheckedUpdateManyWithoutTenantNestedInput;
    warehouses?: Prisma.WarehouseUncheckedUpdateManyWithoutTenantNestedInput;
    customers?: Prisma.CustomerUncheckedUpdateManyWithoutTenantNestedInput;
    invoices?: Prisma.InvoiceUncheckedUpdateManyWithoutTenantNestedInput;
    categories?: Prisma.CategoryUncheckedUpdateManyWithoutTenantNestedInput;
};
export type TenantCreateManyInput = {
    id?: string;
    name: string;
    slug: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type TenantUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    slug?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TenantUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    slug?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TenantCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    slug?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type TenantMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    slug?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type TenantMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    slug?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type TenantScalarRelationFilter = {
    is?: Prisma.TenantWhereInput;
    isNot?: Prisma.TenantWhereInput;
};
export type StringFieldUpdateOperationsInput = {
    set?: string;
};
export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string;
};
export type TenantCreateNestedOneWithoutUsersInput = {
    create?: Prisma.XOR<Prisma.TenantCreateWithoutUsersInput, Prisma.TenantUncheckedCreateWithoutUsersInput>;
    connectOrCreate?: Prisma.TenantCreateOrConnectWithoutUsersInput;
    connect?: Prisma.TenantWhereUniqueInput;
};
export type TenantUpdateOneRequiredWithoutUsersNestedInput = {
    create?: Prisma.XOR<Prisma.TenantCreateWithoutUsersInput, Prisma.TenantUncheckedCreateWithoutUsersInput>;
    connectOrCreate?: Prisma.TenantCreateOrConnectWithoutUsersInput;
    upsert?: Prisma.TenantUpsertWithoutUsersInput;
    connect?: Prisma.TenantWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.TenantUpdateToOneWithWhereWithoutUsersInput, Prisma.TenantUpdateWithoutUsersInput>, Prisma.TenantUncheckedUpdateWithoutUsersInput>;
};
export type TenantCreateNestedOneWithoutCategoriesInput = {
    create?: Prisma.XOR<Prisma.TenantCreateWithoutCategoriesInput, Prisma.TenantUncheckedCreateWithoutCategoriesInput>;
    connectOrCreate?: Prisma.TenantCreateOrConnectWithoutCategoriesInput;
    connect?: Prisma.TenantWhereUniqueInput;
};
export type TenantUpdateOneRequiredWithoutCategoriesNestedInput = {
    create?: Prisma.XOR<Prisma.TenantCreateWithoutCategoriesInput, Prisma.TenantUncheckedCreateWithoutCategoriesInput>;
    connectOrCreate?: Prisma.TenantCreateOrConnectWithoutCategoriesInput;
    upsert?: Prisma.TenantUpsertWithoutCategoriesInput;
    connect?: Prisma.TenantWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.TenantUpdateToOneWithWhereWithoutCategoriesInput, Prisma.TenantUpdateWithoutCategoriesInput>, Prisma.TenantUncheckedUpdateWithoutCategoriesInput>;
};
export type TenantCreateNestedOneWithoutProductsInput = {
    create?: Prisma.XOR<Prisma.TenantCreateWithoutProductsInput, Prisma.TenantUncheckedCreateWithoutProductsInput>;
    connectOrCreate?: Prisma.TenantCreateOrConnectWithoutProductsInput;
    connect?: Prisma.TenantWhereUniqueInput;
};
export type TenantUpdateOneRequiredWithoutProductsNestedInput = {
    create?: Prisma.XOR<Prisma.TenantCreateWithoutProductsInput, Prisma.TenantUncheckedCreateWithoutProductsInput>;
    connectOrCreate?: Prisma.TenantCreateOrConnectWithoutProductsInput;
    upsert?: Prisma.TenantUpsertWithoutProductsInput;
    connect?: Prisma.TenantWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.TenantUpdateToOneWithWhereWithoutProductsInput, Prisma.TenantUpdateWithoutProductsInput>, Prisma.TenantUncheckedUpdateWithoutProductsInput>;
};
export type TenantCreateNestedOneWithoutWarehousesInput = {
    create?: Prisma.XOR<Prisma.TenantCreateWithoutWarehousesInput, Prisma.TenantUncheckedCreateWithoutWarehousesInput>;
    connectOrCreate?: Prisma.TenantCreateOrConnectWithoutWarehousesInput;
    connect?: Prisma.TenantWhereUniqueInput;
};
export type TenantUpdateOneRequiredWithoutWarehousesNestedInput = {
    create?: Prisma.XOR<Prisma.TenantCreateWithoutWarehousesInput, Prisma.TenantUncheckedCreateWithoutWarehousesInput>;
    connectOrCreate?: Prisma.TenantCreateOrConnectWithoutWarehousesInput;
    upsert?: Prisma.TenantUpsertWithoutWarehousesInput;
    connect?: Prisma.TenantWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.TenantUpdateToOneWithWhereWithoutWarehousesInput, Prisma.TenantUpdateWithoutWarehousesInput>, Prisma.TenantUncheckedUpdateWithoutWarehousesInput>;
};
export type TenantCreateNestedOneWithoutCustomersInput = {
    create?: Prisma.XOR<Prisma.TenantCreateWithoutCustomersInput, Prisma.TenantUncheckedCreateWithoutCustomersInput>;
    connectOrCreate?: Prisma.TenantCreateOrConnectWithoutCustomersInput;
    connect?: Prisma.TenantWhereUniqueInput;
};
export type TenantUpdateOneRequiredWithoutCustomersNestedInput = {
    create?: Prisma.XOR<Prisma.TenantCreateWithoutCustomersInput, Prisma.TenantUncheckedCreateWithoutCustomersInput>;
    connectOrCreate?: Prisma.TenantCreateOrConnectWithoutCustomersInput;
    upsert?: Prisma.TenantUpsertWithoutCustomersInput;
    connect?: Prisma.TenantWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.TenantUpdateToOneWithWhereWithoutCustomersInput, Prisma.TenantUpdateWithoutCustomersInput>, Prisma.TenantUncheckedUpdateWithoutCustomersInput>;
};
export type TenantCreateNestedOneWithoutInvoicesInput = {
    create?: Prisma.XOR<Prisma.TenantCreateWithoutInvoicesInput, Prisma.TenantUncheckedCreateWithoutInvoicesInput>;
    connectOrCreate?: Prisma.TenantCreateOrConnectWithoutInvoicesInput;
    connect?: Prisma.TenantWhereUniqueInput;
};
export type TenantUpdateOneRequiredWithoutInvoicesNestedInput = {
    create?: Prisma.XOR<Prisma.TenantCreateWithoutInvoicesInput, Prisma.TenantUncheckedCreateWithoutInvoicesInput>;
    connectOrCreate?: Prisma.TenantCreateOrConnectWithoutInvoicesInput;
    upsert?: Prisma.TenantUpsertWithoutInvoicesInput;
    connect?: Prisma.TenantWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.TenantUpdateToOneWithWhereWithoutInvoicesInput, Prisma.TenantUpdateWithoutInvoicesInput>, Prisma.TenantUncheckedUpdateWithoutInvoicesInput>;
};
export type TenantCreateWithoutUsersInput = {
    id?: string;
    name: string;
    slug: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    products?: Prisma.ProductCreateNestedManyWithoutTenantInput;
    warehouses?: Prisma.WarehouseCreateNestedManyWithoutTenantInput;
    customers?: Prisma.CustomerCreateNestedManyWithoutTenantInput;
    invoices?: Prisma.InvoiceCreateNestedManyWithoutTenantInput;
    categories?: Prisma.CategoryCreateNestedManyWithoutTenantInput;
};
export type TenantUncheckedCreateWithoutUsersInput = {
    id?: string;
    name: string;
    slug: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    products?: Prisma.ProductUncheckedCreateNestedManyWithoutTenantInput;
    warehouses?: Prisma.WarehouseUncheckedCreateNestedManyWithoutTenantInput;
    customers?: Prisma.CustomerUncheckedCreateNestedManyWithoutTenantInput;
    invoices?: Prisma.InvoiceUncheckedCreateNestedManyWithoutTenantInput;
    categories?: Prisma.CategoryUncheckedCreateNestedManyWithoutTenantInput;
};
export type TenantCreateOrConnectWithoutUsersInput = {
    where: Prisma.TenantWhereUniqueInput;
    create: Prisma.XOR<Prisma.TenantCreateWithoutUsersInput, Prisma.TenantUncheckedCreateWithoutUsersInput>;
};
export type TenantUpsertWithoutUsersInput = {
    update: Prisma.XOR<Prisma.TenantUpdateWithoutUsersInput, Prisma.TenantUncheckedUpdateWithoutUsersInput>;
    create: Prisma.XOR<Prisma.TenantCreateWithoutUsersInput, Prisma.TenantUncheckedCreateWithoutUsersInput>;
    where?: Prisma.TenantWhereInput;
};
export type TenantUpdateToOneWithWhereWithoutUsersInput = {
    where?: Prisma.TenantWhereInput;
    data: Prisma.XOR<Prisma.TenantUpdateWithoutUsersInput, Prisma.TenantUncheckedUpdateWithoutUsersInput>;
};
export type TenantUpdateWithoutUsersInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    slug?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    products?: Prisma.ProductUpdateManyWithoutTenantNestedInput;
    warehouses?: Prisma.WarehouseUpdateManyWithoutTenantNestedInput;
    customers?: Prisma.CustomerUpdateManyWithoutTenantNestedInput;
    invoices?: Prisma.InvoiceUpdateManyWithoutTenantNestedInput;
    categories?: Prisma.CategoryUpdateManyWithoutTenantNestedInput;
};
export type TenantUncheckedUpdateWithoutUsersInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    slug?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    products?: Prisma.ProductUncheckedUpdateManyWithoutTenantNestedInput;
    warehouses?: Prisma.WarehouseUncheckedUpdateManyWithoutTenantNestedInput;
    customers?: Prisma.CustomerUncheckedUpdateManyWithoutTenantNestedInput;
    invoices?: Prisma.InvoiceUncheckedUpdateManyWithoutTenantNestedInput;
    categories?: Prisma.CategoryUncheckedUpdateManyWithoutTenantNestedInput;
};
export type TenantCreateWithoutCategoriesInput = {
    id?: string;
    name: string;
    slug: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    users?: Prisma.UserCreateNestedManyWithoutTenantInput;
    products?: Prisma.ProductCreateNestedManyWithoutTenantInput;
    warehouses?: Prisma.WarehouseCreateNestedManyWithoutTenantInput;
    customers?: Prisma.CustomerCreateNestedManyWithoutTenantInput;
    invoices?: Prisma.InvoiceCreateNestedManyWithoutTenantInput;
};
export type TenantUncheckedCreateWithoutCategoriesInput = {
    id?: string;
    name: string;
    slug: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    users?: Prisma.UserUncheckedCreateNestedManyWithoutTenantInput;
    products?: Prisma.ProductUncheckedCreateNestedManyWithoutTenantInput;
    warehouses?: Prisma.WarehouseUncheckedCreateNestedManyWithoutTenantInput;
    customers?: Prisma.CustomerUncheckedCreateNestedManyWithoutTenantInput;
    invoices?: Prisma.InvoiceUncheckedCreateNestedManyWithoutTenantInput;
};
export type TenantCreateOrConnectWithoutCategoriesInput = {
    where: Prisma.TenantWhereUniqueInput;
    create: Prisma.XOR<Prisma.TenantCreateWithoutCategoriesInput, Prisma.TenantUncheckedCreateWithoutCategoriesInput>;
};
export type TenantUpsertWithoutCategoriesInput = {
    update: Prisma.XOR<Prisma.TenantUpdateWithoutCategoriesInput, Prisma.TenantUncheckedUpdateWithoutCategoriesInput>;
    create: Prisma.XOR<Prisma.TenantCreateWithoutCategoriesInput, Prisma.TenantUncheckedCreateWithoutCategoriesInput>;
    where?: Prisma.TenantWhereInput;
};
export type TenantUpdateToOneWithWhereWithoutCategoriesInput = {
    where?: Prisma.TenantWhereInput;
    data: Prisma.XOR<Prisma.TenantUpdateWithoutCategoriesInput, Prisma.TenantUncheckedUpdateWithoutCategoriesInput>;
};
export type TenantUpdateWithoutCategoriesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    slug?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    users?: Prisma.UserUpdateManyWithoutTenantNestedInput;
    products?: Prisma.ProductUpdateManyWithoutTenantNestedInput;
    warehouses?: Prisma.WarehouseUpdateManyWithoutTenantNestedInput;
    customers?: Prisma.CustomerUpdateManyWithoutTenantNestedInput;
    invoices?: Prisma.InvoiceUpdateManyWithoutTenantNestedInput;
};
export type TenantUncheckedUpdateWithoutCategoriesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    slug?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    users?: Prisma.UserUncheckedUpdateManyWithoutTenantNestedInput;
    products?: Prisma.ProductUncheckedUpdateManyWithoutTenantNestedInput;
    warehouses?: Prisma.WarehouseUncheckedUpdateManyWithoutTenantNestedInput;
    customers?: Prisma.CustomerUncheckedUpdateManyWithoutTenantNestedInput;
    invoices?: Prisma.InvoiceUncheckedUpdateManyWithoutTenantNestedInput;
};
export type TenantCreateWithoutProductsInput = {
    id?: string;
    name: string;
    slug: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    users?: Prisma.UserCreateNestedManyWithoutTenantInput;
    warehouses?: Prisma.WarehouseCreateNestedManyWithoutTenantInput;
    customers?: Prisma.CustomerCreateNestedManyWithoutTenantInput;
    invoices?: Prisma.InvoiceCreateNestedManyWithoutTenantInput;
    categories?: Prisma.CategoryCreateNestedManyWithoutTenantInput;
};
export type TenantUncheckedCreateWithoutProductsInput = {
    id?: string;
    name: string;
    slug: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    users?: Prisma.UserUncheckedCreateNestedManyWithoutTenantInput;
    warehouses?: Prisma.WarehouseUncheckedCreateNestedManyWithoutTenantInput;
    customers?: Prisma.CustomerUncheckedCreateNestedManyWithoutTenantInput;
    invoices?: Prisma.InvoiceUncheckedCreateNestedManyWithoutTenantInput;
    categories?: Prisma.CategoryUncheckedCreateNestedManyWithoutTenantInput;
};
export type TenantCreateOrConnectWithoutProductsInput = {
    where: Prisma.TenantWhereUniqueInput;
    create: Prisma.XOR<Prisma.TenantCreateWithoutProductsInput, Prisma.TenantUncheckedCreateWithoutProductsInput>;
};
export type TenantUpsertWithoutProductsInput = {
    update: Prisma.XOR<Prisma.TenantUpdateWithoutProductsInput, Prisma.TenantUncheckedUpdateWithoutProductsInput>;
    create: Prisma.XOR<Prisma.TenantCreateWithoutProductsInput, Prisma.TenantUncheckedCreateWithoutProductsInput>;
    where?: Prisma.TenantWhereInput;
};
export type TenantUpdateToOneWithWhereWithoutProductsInput = {
    where?: Prisma.TenantWhereInput;
    data: Prisma.XOR<Prisma.TenantUpdateWithoutProductsInput, Prisma.TenantUncheckedUpdateWithoutProductsInput>;
};
export type TenantUpdateWithoutProductsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    slug?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    users?: Prisma.UserUpdateManyWithoutTenantNestedInput;
    warehouses?: Prisma.WarehouseUpdateManyWithoutTenantNestedInput;
    customers?: Prisma.CustomerUpdateManyWithoutTenantNestedInput;
    invoices?: Prisma.InvoiceUpdateManyWithoutTenantNestedInput;
    categories?: Prisma.CategoryUpdateManyWithoutTenantNestedInput;
};
export type TenantUncheckedUpdateWithoutProductsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    slug?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    users?: Prisma.UserUncheckedUpdateManyWithoutTenantNestedInput;
    warehouses?: Prisma.WarehouseUncheckedUpdateManyWithoutTenantNestedInput;
    customers?: Prisma.CustomerUncheckedUpdateManyWithoutTenantNestedInput;
    invoices?: Prisma.InvoiceUncheckedUpdateManyWithoutTenantNestedInput;
    categories?: Prisma.CategoryUncheckedUpdateManyWithoutTenantNestedInput;
};
export type TenantCreateWithoutWarehousesInput = {
    id?: string;
    name: string;
    slug: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    users?: Prisma.UserCreateNestedManyWithoutTenantInput;
    products?: Prisma.ProductCreateNestedManyWithoutTenantInput;
    customers?: Prisma.CustomerCreateNestedManyWithoutTenantInput;
    invoices?: Prisma.InvoiceCreateNestedManyWithoutTenantInput;
    categories?: Prisma.CategoryCreateNestedManyWithoutTenantInput;
};
export type TenantUncheckedCreateWithoutWarehousesInput = {
    id?: string;
    name: string;
    slug: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    users?: Prisma.UserUncheckedCreateNestedManyWithoutTenantInput;
    products?: Prisma.ProductUncheckedCreateNestedManyWithoutTenantInput;
    customers?: Prisma.CustomerUncheckedCreateNestedManyWithoutTenantInput;
    invoices?: Prisma.InvoiceUncheckedCreateNestedManyWithoutTenantInput;
    categories?: Prisma.CategoryUncheckedCreateNestedManyWithoutTenantInput;
};
export type TenantCreateOrConnectWithoutWarehousesInput = {
    where: Prisma.TenantWhereUniqueInput;
    create: Prisma.XOR<Prisma.TenantCreateWithoutWarehousesInput, Prisma.TenantUncheckedCreateWithoutWarehousesInput>;
};
export type TenantUpsertWithoutWarehousesInput = {
    update: Prisma.XOR<Prisma.TenantUpdateWithoutWarehousesInput, Prisma.TenantUncheckedUpdateWithoutWarehousesInput>;
    create: Prisma.XOR<Prisma.TenantCreateWithoutWarehousesInput, Prisma.TenantUncheckedCreateWithoutWarehousesInput>;
    where?: Prisma.TenantWhereInput;
};
export type TenantUpdateToOneWithWhereWithoutWarehousesInput = {
    where?: Prisma.TenantWhereInput;
    data: Prisma.XOR<Prisma.TenantUpdateWithoutWarehousesInput, Prisma.TenantUncheckedUpdateWithoutWarehousesInput>;
};
export type TenantUpdateWithoutWarehousesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    slug?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    users?: Prisma.UserUpdateManyWithoutTenantNestedInput;
    products?: Prisma.ProductUpdateManyWithoutTenantNestedInput;
    customers?: Prisma.CustomerUpdateManyWithoutTenantNestedInput;
    invoices?: Prisma.InvoiceUpdateManyWithoutTenantNestedInput;
    categories?: Prisma.CategoryUpdateManyWithoutTenantNestedInput;
};
export type TenantUncheckedUpdateWithoutWarehousesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    slug?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    users?: Prisma.UserUncheckedUpdateManyWithoutTenantNestedInput;
    products?: Prisma.ProductUncheckedUpdateManyWithoutTenantNestedInput;
    customers?: Prisma.CustomerUncheckedUpdateManyWithoutTenantNestedInput;
    invoices?: Prisma.InvoiceUncheckedUpdateManyWithoutTenantNestedInput;
    categories?: Prisma.CategoryUncheckedUpdateManyWithoutTenantNestedInput;
};
export type TenantCreateWithoutCustomersInput = {
    id?: string;
    name: string;
    slug: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    users?: Prisma.UserCreateNestedManyWithoutTenantInput;
    products?: Prisma.ProductCreateNestedManyWithoutTenantInput;
    warehouses?: Prisma.WarehouseCreateNestedManyWithoutTenantInput;
    invoices?: Prisma.InvoiceCreateNestedManyWithoutTenantInput;
    categories?: Prisma.CategoryCreateNestedManyWithoutTenantInput;
};
export type TenantUncheckedCreateWithoutCustomersInput = {
    id?: string;
    name: string;
    slug: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    users?: Prisma.UserUncheckedCreateNestedManyWithoutTenantInput;
    products?: Prisma.ProductUncheckedCreateNestedManyWithoutTenantInput;
    warehouses?: Prisma.WarehouseUncheckedCreateNestedManyWithoutTenantInput;
    invoices?: Prisma.InvoiceUncheckedCreateNestedManyWithoutTenantInput;
    categories?: Prisma.CategoryUncheckedCreateNestedManyWithoutTenantInput;
};
export type TenantCreateOrConnectWithoutCustomersInput = {
    where: Prisma.TenantWhereUniqueInput;
    create: Prisma.XOR<Prisma.TenantCreateWithoutCustomersInput, Prisma.TenantUncheckedCreateWithoutCustomersInput>;
};
export type TenantUpsertWithoutCustomersInput = {
    update: Prisma.XOR<Prisma.TenantUpdateWithoutCustomersInput, Prisma.TenantUncheckedUpdateWithoutCustomersInput>;
    create: Prisma.XOR<Prisma.TenantCreateWithoutCustomersInput, Prisma.TenantUncheckedCreateWithoutCustomersInput>;
    where?: Prisma.TenantWhereInput;
};
export type TenantUpdateToOneWithWhereWithoutCustomersInput = {
    where?: Prisma.TenantWhereInput;
    data: Prisma.XOR<Prisma.TenantUpdateWithoutCustomersInput, Prisma.TenantUncheckedUpdateWithoutCustomersInput>;
};
export type TenantUpdateWithoutCustomersInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    slug?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    users?: Prisma.UserUpdateManyWithoutTenantNestedInput;
    products?: Prisma.ProductUpdateManyWithoutTenantNestedInput;
    warehouses?: Prisma.WarehouseUpdateManyWithoutTenantNestedInput;
    invoices?: Prisma.InvoiceUpdateManyWithoutTenantNestedInput;
    categories?: Prisma.CategoryUpdateManyWithoutTenantNestedInput;
};
export type TenantUncheckedUpdateWithoutCustomersInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    slug?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    users?: Prisma.UserUncheckedUpdateManyWithoutTenantNestedInput;
    products?: Prisma.ProductUncheckedUpdateManyWithoutTenantNestedInput;
    warehouses?: Prisma.WarehouseUncheckedUpdateManyWithoutTenantNestedInput;
    invoices?: Prisma.InvoiceUncheckedUpdateManyWithoutTenantNestedInput;
    categories?: Prisma.CategoryUncheckedUpdateManyWithoutTenantNestedInput;
};
export type TenantCreateWithoutInvoicesInput = {
    id?: string;
    name: string;
    slug: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    users?: Prisma.UserCreateNestedManyWithoutTenantInput;
    products?: Prisma.ProductCreateNestedManyWithoutTenantInput;
    warehouses?: Prisma.WarehouseCreateNestedManyWithoutTenantInput;
    customers?: Prisma.CustomerCreateNestedManyWithoutTenantInput;
    categories?: Prisma.CategoryCreateNestedManyWithoutTenantInput;
};
export type TenantUncheckedCreateWithoutInvoicesInput = {
    id?: string;
    name: string;
    slug: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    users?: Prisma.UserUncheckedCreateNestedManyWithoutTenantInput;
    products?: Prisma.ProductUncheckedCreateNestedManyWithoutTenantInput;
    warehouses?: Prisma.WarehouseUncheckedCreateNestedManyWithoutTenantInput;
    customers?: Prisma.CustomerUncheckedCreateNestedManyWithoutTenantInput;
    categories?: Prisma.CategoryUncheckedCreateNestedManyWithoutTenantInput;
};
export type TenantCreateOrConnectWithoutInvoicesInput = {
    where: Prisma.TenantWhereUniqueInput;
    create: Prisma.XOR<Prisma.TenantCreateWithoutInvoicesInput, Prisma.TenantUncheckedCreateWithoutInvoicesInput>;
};
export type TenantUpsertWithoutInvoicesInput = {
    update: Prisma.XOR<Prisma.TenantUpdateWithoutInvoicesInput, Prisma.TenantUncheckedUpdateWithoutInvoicesInput>;
    create: Prisma.XOR<Prisma.TenantCreateWithoutInvoicesInput, Prisma.TenantUncheckedCreateWithoutInvoicesInput>;
    where?: Prisma.TenantWhereInput;
};
export type TenantUpdateToOneWithWhereWithoutInvoicesInput = {
    where?: Prisma.TenantWhereInput;
    data: Prisma.XOR<Prisma.TenantUpdateWithoutInvoicesInput, Prisma.TenantUncheckedUpdateWithoutInvoicesInput>;
};
export type TenantUpdateWithoutInvoicesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    slug?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    users?: Prisma.UserUpdateManyWithoutTenantNestedInput;
    products?: Prisma.ProductUpdateManyWithoutTenantNestedInput;
    warehouses?: Prisma.WarehouseUpdateManyWithoutTenantNestedInput;
    customers?: Prisma.CustomerUpdateManyWithoutTenantNestedInput;
    categories?: Prisma.CategoryUpdateManyWithoutTenantNestedInput;
};
export type TenantUncheckedUpdateWithoutInvoicesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    slug?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    users?: Prisma.UserUncheckedUpdateManyWithoutTenantNestedInput;
    products?: Prisma.ProductUncheckedUpdateManyWithoutTenantNestedInput;
    warehouses?: Prisma.WarehouseUncheckedUpdateManyWithoutTenantNestedInput;
    customers?: Prisma.CustomerUncheckedUpdateManyWithoutTenantNestedInput;
    categories?: Prisma.CategoryUncheckedUpdateManyWithoutTenantNestedInput;
};
export type TenantCountOutputType = {
    users: number;
    products: number;
    warehouses: number;
    customers: number;
    invoices: number;
    categories: number;
};
export type TenantCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    users?: boolean | TenantCountOutputTypeCountUsersArgs;
    products?: boolean | TenantCountOutputTypeCountProductsArgs;
    warehouses?: boolean | TenantCountOutputTypeCountWarehousesArgs;
    customers?: boolean | TenantCountOutputTypeCountCustomersArgs;
    invoices?: boolean | TenantCountOutputTypeCountInvoicesArgs;
    categories?: boolean | TenantCountOutputTypeCountCategoriesArgs;
};
export type TenantCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TenantCountOutputTypeSelect<ExtArgs> | null;
};
export type TenantCountOutputTypeCountUsersArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UserWhereInput;
};
export type TenantCountOutputTypeCountProductsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ProductWhereInput;
};
export type TenantCountOutputTypeCountWarehousesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.WarehouseWhereInput;
};
export type TenantCountOutputTypeCountCustomersArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CustomerWhereInput;
};
export type TenantCountOutputTypeCountInvoicesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.InvoiceWhereInput;
};
export type TenantCountOutputTypeCountCategoriesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CategoryWhereInput;
};
export type TenantSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    slug?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    users?: boolean | Prisma.Tenant$usersArgs<ExtArgs>;
    products?: boolean | Prisma.Tenant$productsArgs<ExtArgs>;
    warehouses?: boolean | Prisma.Tenant$warehousesArgs<ExtArgs>;
    customers?: boolean | Prisma.Tenant$customersArgs<ExtArgs>;
    invoices?: boolean | Prisma.Tenant$invoicesArgs<ExtArgs>;
    categories?: boolean | Prisma.Tenant$categoriesArgs<ExtArgs>;
    _count?: boolean | Prisma.TenantCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["tenant"]>;
export type TenantSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    slug?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["tenant"]>;
export type TenantSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    slug?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["tenant"]>;
export type TenantSelectScalar = {
    id?: boolean;
    name?: boolean;
    slug?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type TenantOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "name" | "slug" | "createdAt" | "updatedAt", ExtArgs["result"]["tenant"]>;
export type TenantInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    users?: boolean | Prisma.Tenant$usersArgs<ExtArgs>;
    products?: boolean | Prisma.Tenant$productsArgs<ExtArgs>;
    warehouses?: boolean | Prisma.Tenant$warehousesArgs<ExtArgs>;
    customers?: boolean | Prisma.Tenant$customersArgs<ExtArgs>;
    invoices?: boolean | Prisma.Tenant$invoicesArgs<ExtArgs>;
    categories?: boolean | Prisma.Tenant$categoriesArgs<ExtArgs>;
    _count?: boolean | Prisma.TenantCountOutputTypeDefaultArgs<ExtArgs>;
};
export type TenantIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type TenantIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $TenantPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Tenant";
    objects: {
        users: Prisma.$UserPayload<ExtArgs>[];
        products: Prisma.$ProductPayload<ExtArgs>[];
        warehouses: Prisma.$WarehousePayload<ExtArgs>[];
        customers: Prisma.$CustomerPayload<ExtArgs>[];
        invoices: Prisma.$InvoicePayload<ExtArgs>[];
        categories: Prisma.$CategoryPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        name: string;
        slug: string;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["tenant"]>;
    composites: {};
};
export type TenantGetPayload<S extends boolean | null | undefined | TenantDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$TenantPayload, S>;
export type TenantCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<TenantFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: TenantCountAggregateInputType | true;
};
export interface TenantDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Tenant'];
        meta: {
            name: 'Tenant';
        };
    };
    findUnique<T extends TenantFindUniqueArgs>(args: Prisma.SelectSubset<T, TenantFindUniqueArgs<ExtArgs>>): Prisma.Prisma__TenantClient<runtime.Types.Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends TenantFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, TenantFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__TenantClient<runtime.Types.Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends TenantFindFirstArgs>(args?: Prisma.SelectSubset<T, TenantFindFirstArgs<ExtArgs>>): Prisma.Prisma__TenantClient<runtime.Types.Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends TenantFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, TenantFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__TenantClient<runtime.Types.Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends TenantFindManyArgs>(args?: Prisma.SelectSubset<T, TenantFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends TenantCreateArgs>(args: Prisma.SelectSubset<T, TenantCreateArgs<ExtArgs>>): Prisma.Prisma__TenantClient<runtime.Types.Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends TenantCreateManyArgs>(args?: Prisma.SelectSubset<T, TenantCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends TenantCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, TenantCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends TenantDeleteArgs>(args: Prisma.SelectSubset<T, TenantDeleteArgs<ExtArgs>>): Prisma.Prisma__TenantClient<runtime.Types.Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends TenantUpdateArgs>(args: Prisma.SelectSubset<T, TenantUpdateArgs<ExtArgs>>): Prisma.Prisma__TenantClient<runtime.Types.Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends TenantDeleteManyArgs>(args?: Prisma.SelectSubset<T, TenantDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends TenantUpdateManyArgs>(args: Prisma.SelectSubset<T, TenantUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends TenantUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, TenantUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends TenantUpsertArgs>(args: Prisma.SelectSubset<T, TenantUpsertArgs<ExtArgs>>): Prisma.Prisma__TenantClient<runtime.Types.Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends TenantCountArgs>(args?: Prisma.Subset<T, TenantCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], TenantCountAggregateOutputType> : number>;
    aggregate<T extends TenantAggregateArgs>(args: Prisma.Subset<T, TenantAggregateArgs>): Prisma.PrismaPromise<GetTenantAggregateType<T>>;
    groupBy<T extends TenantGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: TenantGroupByArgs['orderBy'];
    } : {
        orderBy?: TenantGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, TenantGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTenantGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: TenantFieldRefs;
}
export interface Prisma__TenantClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    users<T extends Prisma.Tenant$usersArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Tenant$usersArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    products<T extends Prisma.Tenant$productsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Tenant$productsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    warehouses<T extends Prisma.Tenant$warehousesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Tenant$warehousesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$WarehousePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    customers<T extends Prisma.Tenant$customersArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Tenant$customersArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    invoices<T extends Prisma.Tenant$invoicesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Tenant$invoicesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$InvoicePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    categories<T extends Prisma.Tenant$categoriesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Tenant$categoriesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface TenantFieldRefs {
    readonly id: Prisma.FieldRef<"Tenant", 'String'>;
    readonly name: Prisma.FieldRef<"Tenant", 'String'>;
    readonly slug: Prisma.FieldRef<"Tenant", 'String'>;
    readonly createdAt: Prisma.FieldRef<"Tenant", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"Tenant", 'DateTime'>;
}
export type TenantFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TenantSelect<ExtArgs> | null;
    omit?: Prisma.TenantOmit<ExtArgs> | null;
    include?: Prisma.TenantInclude<ExtArgs> | null;
    where: Prisma.TenantWhereUniqueInput;
};
export type TenantFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TenantSelect<ExtArgs> | null;
    omit?: Prisma.TenantOmit<ExtArgs> | null;
    include?: Prisma.TenantInclude<ExtArgs> | null;
    where: Prisma.TenantWhereUniqueInput;
};
export type TenantFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TenantSelect<ExtArgs> | null;
    omit?: Prisma.TenantOmit<ExtArgs> | null;
    include?: Prisma.TenantInclude<ExtArgs> | null;
    where?: Prisma.TenantWhereInput;
    orderBy?: Prisma.TenantOrderByWithRelationInput | Prisma.TenantOrderByWithRelationInput[];
    cursor?: Prisma.TenantWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TenantScalarFieldEnum | Prisma.TenantScalarFieldEnum[];
};
export type TenantFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TenantSelect<ExtArgs> | null;
    omit?: Prisma.TenantOmit<ExtArgs> | null;
    include?: Prisma.TenantInclude<ExtArgs> | null;
    where?: Prisma.TenantWhereInput;
    orderBy?: Prisma.TenantOrderByWithRelationInput | Prisma.TenantOrderByWithRelationInput[];
    cursor?: Prisma.TenantWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TenantScalarFieldEnum | Prisma.TenantScalarFieldEnum[];
};
export type TenantFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TenantSelect<ExtArgs> | null;
    omit?: Prisma.TenantOmit<ExtArgs> | null;
    include?: Prisma.TenantInclude<ExtArgs> | null;
    where?: Prisma.TenantWhereInput;
    orderBy?: Prisma.TenantOrderByWithRelationInput | Prisma.TenantOrderByWithRelationInput[];
    cursor?: Prisma.TenantWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TenantScalarFieldEnum | Prisma.TenantScalarFieldEnum[];
};
export type TenantCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TenantSelect<ExtArgs> | null;
    omit?: Prisma.TenantOmit<ExtArgs> | null;
    include?: Prisma.TenantInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TenantCreateInput, Prisma.TenantUncheckedCreateInput>;
};
export type TenantCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.TenantCreateManyInput | Prisma.TenantCreateManyInput[];
    skipDuplicates?: boolean;
};
export type TenantCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TenantSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.TenantOmit<ExtArgs> | null;
    data: Prisma.TenantCreateManyInput | Prisma.TenantCreateManyInput[];
    skipDuplicates?: boolean;
};
export type TenantUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TenantSelect<ExtArgs> | null;
    omit?: Prisma.TenantOmit<ExtArgs> | null;
    include?: Prisma.TenantInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TenantUpdateInput, Prisma.TenantUncheckedUpdateInput>;
    where: Prisma.TenantWhereUniqueInput;
};
export type TenantUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.TenantUpdateManyMutationInput, Prisma.TenantUncheckedUpdateManyInput>;
    where?: Prisma.TenantWhereInput;
    limit?: number;
};
export type TenantUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TenantSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.TenantOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TenantUpdateManyMutationInput, Prisma.TenantUncheckedUpdateManyInput>;
    where?: Prisma.TenantWhereInput;
    limit?: number;
};
export type TenantUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TenantSelect<ExtArgs> | null;
    omit?: Prisma.TenantOmit<ExtArgs> | null;
    include?: Prisma.TenantInclude<ExtArgs> | null;
    where: Prisma.TenantWhereUniqueInput;
    create: Prisma.XOR<Prisma.TenantCreateInput, Prisma.TenantUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.TenantUpdateInput, Prisma.TenantUncheckedUpdateInput>;
};
export type TenantDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TenantSelect<ExtArgs> | null;
    omit?: Prisma.TenantOmit<ExtArgs> | null;
    include?: Prisma.TenantInclude<ExtArgs> | null;
    where: Prisma.TenantWhereUniqueInput;
};
export type TenantDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TenantWhereInput;
    limit?: number;
};
export type Tenant$usersArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[];
    cursor?: Prisma.UserWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.UserScalarFieldEnum | Prisma.UserScalarFieldEnum[];
};
export type Tenant$productsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type Tenant$warehousesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WarehouseSelect<ExtArgs> | null;
    omit?: Prisma.WarehouseOmit<ExtArgs> | null;
    include?: Prisma.WarehouseInclude<ExtArgs> | null;
    where?: Prisma.WarehouseWhereInput;
    orderBy?: Prisma.WarehouseOrderByWithRelationInput | Prisma.WarehouseOrderByWithRelationInput[];
    cursor?: Prisma.WarehouseWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.WarehouseScalarFieldEnum | Prisma.WarehouseScalarFieldEnum[];
};
export type Tenant$customersArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CustomerSelect<ExtArgs> | null;
    omit?: Prisma.CustomerOmit<ExtArgs> | null;
    include?: Prisma.CustomerInclude<ExtArgs> | null;
    where?: Prisma.CustomerWhereInput;
    orderBy?: Prisma.CustomerOrderByWithRelationInput | Prisma.CustomerOrderByWithRelationInput[];
    cursor?: Prisma.CustomerWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CustomerScalarFieldEnum | Prisma.CustomerScalarFieldEnum[];
};
export type Tenant$invoicesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type Tenant$categoriesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CategorySelect<ExtArgs> | null;
    omit?: Prisma.CategoryOmit<ExtArgs> | null;
    include?: Prisma.CategoryInclude<ExtArgs> | null;
    where?: Prisma.CategoryWhereInput;
    orderBy?: Prisma.CategoryOrderByWithRelationInput | Prisma.CategoryOrderByWithRelationInput[];
    cursor?: Prisma.CategoryWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CategoryScalarFieldEnum | Prisma.CategoryScalarFieldEnum[];
};
export type TenantDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TenantSelect<ExtArgs> | null;
    omit?: Prisma.TenantOmit<ExtArgs> | null;
    include?: Prisma.TenantInclude<ExtArgs> | null;
};
export {};

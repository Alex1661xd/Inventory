"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.NullsOrder = exports.QueryMode = exports.SortOrder = exports.InvoiceItemScalarFieldEnum = exports.InvoiceScalarFieldEnum = exports.CustomerScalarFieldEnum = exports.StockScalarFieldEnum = exports.WarehouseScalarFieldEnum = exports.ProductScalarFieldEnum = exports.CategoryScalarFieldEnum = exports.UserScalarFieldEnum = exports.TenantScalarFieldEnum = exports.TransactionIsolationLevel = exports.ModelName = exports.AnyNull = exports.JsonNull = exports.DbNull = exports.NullTypes = exports.Decimal = void 0;
const runtime = __importStar(require("@prisma/client/runtime/index-browser"));
exports.Decimal = runtime.Decimal;
exports.NullTypes = {
    DbNull: runtime.objectEnumValues.classes.DbNull,
    JsonNull: runtime.objectEnumValues.classes.JsonNull,
    AnyNull: runtime.objectEnumValues.classes.AnyNull,
};
exports.DbNull = runtime.objectEnumValues.instances.DbNull;
exports.JsonNull = runtime.objectEnumValues.instances.JsonNull;
exports.AnyNull = runtime.objectEnumValues.instances.AnyNull;
exports.ModelName = {
    Tenant: 'Tenant',
    User: 'User',
    Category: 'Category',
    Product: 'Product',
    Warehouse: 'Warehouse',
    Stock: 'Stock',
    Customer: 'Customer',
    Invoice: 'Invoice',
    InvoiceItem: 'InvoiceItem'
};
exports.TransactionIsolationLevel = runtime.makeStrictEnum({
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
});
exports.TenantScalarFieldEnum = {
    id: 'id',
    name: 'name',
    slug: 'slug',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.UserScalarFieldEnum = {
    id: 'id',
    email: 'email',
    password: 'password',
    name: 'name',
    role: 'role',
    tenantId: 'tenantId'
};
exports.CategoryScalarFieldEnum = {
    id: 'id',
    name: 'name',
    tenantId: 'tenantId'
};
exports.ProductScalarFieldEnum = {
    id: 'id',
    name: 'name',
    description: 'description',
    barcode: 'barcode',
    sku: 'sku',
    imageUrl: 'imageUrl',
    costPrice: 'costPrice',
    salePrice: 'salePrice',
    isPublic: 'isPublic',
    tenantId: 'tenantId',
    categoryId: 'categoryId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.WarehouseScalarFieldEnum = {
    id: 'id',
    name: 'name',
    address: 'address',
    tenantId: 'tenantId'
};
exports.StockScalarFieldEnum = {
    id: 'id',
    quantity: 'quantity',
    productId: 'productId',
    warehouseId: 'warehouseId'
};
exports.CustomerScalarFieldEnum = {
    id: 'id',
    name: 'name',
    email: 'email',
    phone: 'phone',
    address: 'address',
    docNumber: 'docNumber',
    tenantId: 'tenantId'
};
exports.InvoiceScalarFieldEnum = {
    id: 'id',
    invoiceNumber: 'invoiceNumber',
    total: 'total',
    status: 'status',
    paymentMethod: 'paymentMethod',
    createdAt: 'createdAt',
    tenantId: 'tenantId',
    customerId: 'customerId',
    sellerId: 'sellerId'
};
exports.InvoiceItemScalarFieldEnum = {
    id: 'id',
    quantity: 'quantity',
    unitPrice: 'unitPrice',
    invoiceId: 'invoiceId',
    productId: 'productId'
};
exports.SortOrder = {
    asc: 'asc',
    desc: 'desc'
};
exports.QueryMode = {
    default: 'default',
    insensitive: 'insensitive'
};
exports.NullsOrder = {
    first: 'first',
    last: 'last'
};
//# sourceMappingURL=prismaNamespaceBrowser.js.map
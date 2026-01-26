export declare const Role: {
    readonly SUPER_ADMIN: "SUPER_ADMIN";
    readonly ADMIN: "ADMIN";
    readonly SELLER: "SELLER";
};
export type Role = (typeof Role)[keyof typeof Role];
export declare const PaymentMethod: {
    readonly CASH: "CASH";
    readonly CARD: "CARD";
    readonly TRANSFER: "TRANSFER";
    readonly OTHER: "OTHER";
};
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];
export declare const InvoiceStatus: {
    readonly PAID: "PAID";
    readonly PENDING: "PENDING";
    readonly CANCELLED: "CANCELLED";
};
export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];

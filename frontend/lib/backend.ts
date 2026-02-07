import { createClient } from '@/utils/supabase/client';

const getBackendUrl = () => {
    const url = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!url) throw new Error('NEXT_PUBLIC_BACKEND_URL is not set');
    return url;
};

async function getAccessToken() {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token;
}

async function backendFetch<T>(
    path: string,
    options: RequestInit & { json?: unknown } = {},
): Promise<T> {
    const token = await getAccessToken();

    const headers = new Headers(options.headers);

    if (options.json !== undefined) {
        headers.set('Content-Type', 'application/json');
    }

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const baseUrl = getBackendUrl().replace(/\/$/, ''); // Quita la barra final si existe
    const cleanPath = path.startsWith('/') ? path : `/${path}`; // Asegura que el path empiece con /

    const res = await fetch(`${baseUrl}${cleanPath}`, {
        ...options,
        headers,
        body: options.json !== undefined ? JSON.stringify(options.json) : options.body,
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
        throw new Error(data?.message || `Request failed: ${res.status}`);
    }

    return data as T;
}

export type Category = {
    id: string;
    name: string;
    description?: string | null;
    tenantId: string;
    createdAt: string;
    updatedAt: string;
};

export type Product = {
    id: string;
    name: string;
    description?: string | null;
    barcode?: string | null;
    sku?: string | null;
    imageUrl?: string | null;
    images?: string[];
    costPrice: string;
    salePrice: string;
    isPublic: boolean;
    tenantId: string;
    createdAt: string;
    updatedAt: string;
    categoryId?: string | null;
    totalStock?: number;
};

export type Warehouse = {
    id: string;
    name: string;
    address?: string | null;
    tenantId: string;
    isDefault: boolean;
};

export type StockRow = {
    id: string;
    quantity: number;
    productId: string;
    warehouseId: string;
    product: { id: string; name: string; barcode?: string | null; sku?: string | null; costPrice?: string | null; categoryId?: string | null };
    warehouse: { id: string; name: string };
};

export type Supplier = {
    id: string;
    name: string;
    contactName?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    taxId?: string | null;
    paymentTerms?: string | null;
    tenantId: string;
    createdAt: string;
    updatedAt: string;
};

export type CashShift = {
    id: string;
    openingTime: string;
    closingTime?: string;
    initialAmount: number;
    finalAmount?: number;
    systemAmount?: number;
    difference?: number;
    status: 'OPEN' | 'CLOSED';
    sellerId: string;
    seller?: { name: string };
    transactions: CashTransaction[];
};

export type CashTransaction = {
    id: string;
    amount: number;
    reason: string;
    type: 'DEPOSIT' | 'WITHDRAWAL' | 'EXPENSE';
    createdAt: string;
};

export type ExpenseCategory =
    | 'RENT'
    | 'UTILITIES'
    | 'PAYROLL'
    | 'SUPPLIES'
    | 'MAINTENANCE'
    | 'TRANSPORT'
    | 'MARKETING'
    | 'TAXES'
    | 'INSURANCE'
    | 'OTHER';

export type Expense = {
    id: string;
    amount: number;
    description: string;
    category: ExpenseCategory;
    date: string;
    supplierId?: string;
    supplier?: Supplier;
    createdById: string;
    createdBy?: { id: string; name: string };
    createdAt: string;
    updatedAt: string;
};

export type StockMovementType = 'PURCHASE' | 'SALE' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'ADJUSTMENT' | 'RETURN' | 'DAMAGE' | 'INITIAL';

export type StockMovement = {
    id: string;
    type: StockMovementType;
    quantity: number;
    balanceAfter: number;
    reference?: string | null;
    notes?: string | null;
    productId: string;
    warehouseId: string;
    userId?: string | null;
    createdAt: string;
    warehouse: { id: string; name: string };
    user?: { id: string; name: string };
};

export const api = {
    products: {
        list: () => backendFetch<Product[]>('/products'),
        get: (id: string) => backendFetch<Product>(`/products/${id}`),
        findByBarcode: (barcode: string) => {
            const search = new URLSearchParams();
            if (barcode) search.set('barcode', barcode);
            const q = search.toString();
            return backendFetch<Product>(`/products/by-barcode${q ? `?${q}` : ''}`);
        },
        create: (payload: {
            name: string;
            description?: string;
            sku?: string;
            imageUrl?: string;
            costPrice?: number;
            salePrice?: number;
            isPublic?: boolean;
            initialStock?: number;
            initialWarehouseId?: string;
            categoryId?: string;
        }) => backendFetch<Product>('/products', { method: 'POST', json: payload }),
        update: (id: string, payload: Partial<{
            name: string;
            description?: string;
            sku?: string;
            imageUrl?: string;
            costPrice?: number;
            salePrice?: number;
            isPublic?: boolean;
            categoryId?: string;
        }>) => backendFetch<Product>(`/products/${id}`, { method: 'PATCH', json: payload }),
        remove: (id: string) => backendFetch<Product>(`/products/${id}`, { method: 'DELETE' }),
    },
    warehouses: {
        list: () => backendFetch<Warehouse[]>('/warehouses'),
        create: (payload: { name: string; address?: string }) =>
            backendFetch<Warehouse>('/warehouses', { method: 'POST', json: payload }),
        update: (id: string, payload: Partial<{ name: string; address?: string }>) =>
            backendFetch<Warehouse>(`/warehouses/${id}`, { method: 'PATCH', json: payload }),
        remove: (id: string) => backendFetch<Warehouse>(`/warehouses/${id}`, { method: 'DELETE' }),
    },
    categories: {
        list: () => backendFetch<Category[]>('/categories'),
        get: (id: string) => backendFetch<Category>(`/categories/${id}`),
        create: (payload: {
            name: string;
            description?: string;
        }) => backendFetch<Category>('/categories', { method: 'POST', json: payload }),
        update: (id: string, payload: Partial<{
            name: string;
            description?: string;
        }>) => backendFetch<Category>(`/categories/${id}`, { method: 'PATCH', json: payload }),
        remove: (id: string) => backendFetch<Category>(`/categories/${id}`, { method: 'DELETE' }),
    },
    inventory: {
        updateStock: (payload: { productId: string; warehouseId: string; quantityDelta: number; type?: StockMovementType }) =>
            backendFetch<any>('/inventory/update-stock', { method: 'PATCH', json: payload }),
        transfer: (payload: { productId: string; fromWarehouseId: string; toWarehouseId: string; quantity: number }) =>
            backendFetch<any>('/inventory/transfer', { method: 'PATCH', json: payload }),
        stock: (params: { productId?: string; warehouseId?: string }) => {
            const search = new URLSearchParams();
            if (params.productId) search.set('productId', params.productId);
            if (params.warehouseId) search.set('warehouseId', params.warehouseId);
            const q = search.toString();
            return backendFetch<StockRow[]>(`/inventory/stock${q ? `?${q}` : ''}`);
        },
        kardex: (productId: string, warehouseId?: string) => {
            const search = new URLSearchParams();
            search.set('productId', productId);
            if (warehouseId) search.set('warehouseId', warehouseId);
            return backendFetch<StockMovement[]>(`/inventory/kardex?${search.toString()}`);
        },
    },
    auth: {
        me: () => backendFetch<any>('/auth/me'),
        registerBusiness: (payload: any) =>
            backendFetch<any>('/auth/register-business', { method: 'POST', json: payload }),
    },
    sellers: {
        list: () => backendFetch<any[]>('/users'),
        create: (payload: any) => backendFetch<any>('/users', { method: 'POST', json: payload }),
        update: (id: string, payload: any) => backendFetch<any>(`/users/${id}`, { method: 'PATCH', json: payload }),
        remove: (id: string) => backendFetch<any>(`/users/${id}`, { method: 'DELETE' }),
    },
    customers: {
        list: () => backendFetch<any[]>('/customers'),
        create: (payload: any) => backendFetch<any>('/customers', { method: 'POST', json: payload }),
        update: (id: string, payload: any) => backendFetch<any>(`/customers/${id}`, { method: 'PATCH', json: payload }),
        remove: (id: string) => backendFetch<any>(`/customers/${id}`, { method: 'DELETE' }),
    },
    invoices: {
        create: (payload: any) => backendFetch<any>('/invoices', { method: 'POST', json: payload }),
        list: () => backendFetch<any[]>('/invoices'),
        get: (id: string) => backendFetch<any>(`/invoices/${id}`),
        cancel: (id: string) => backendFetch<any>(`/invoices/${id}/cancel`, { method: 'POST' }),
    },
    suppliers: {
        list: () => backendFetch<Supplier[]>('/suppliers'),
        create: (payload: { name: string; contactName?: string; email?: string; phone?: string; address?: string; taxId?: string; paymentTerms?: string }) =>
            backendFetch<Supplier>('/suppliers', { method: 'POST', json: payload }),
        update: (id: string, payload: Partial<Supplier>) =>
            backendFetch<Supplier>(`/suppliers/${id}`, { method: 'PATCH', json: payload }),
        remove: (id: string) => backendFetch<Supplier>(`/suppliers/${id}`, { method: 'DELETE' }),
    },
    cashFlow: {
        open: (payload: { initialAmount: number }) => backendFetch<CashShift>('/cash-flow/open', { method: 'POST', json: payload }),
        close: (payload: { finalAmount: number }) => backendFetch<CashShift>('/cash-flow/close', { method: 'POST', json: payload }),
        getCurrent: () => backendFetch<CashShift | null>('/cash-flow/current'),
        summary: () => backendFetch<{
            initialAmount: number;
            totalSales: number;
            deposits: number;
            withdrawals: number;
            expenses: number;
            expected: number;
            openingTime: string;
            sellerName: string;
        } | null>('/cash-flow/summary'),
        addTransaction: (payload: { amount: number; reason: string; type: 'DEPOSIT' | 'WITHDRAWAL' | 'EXPENSE' }) =>
            backendFetch<CashTransaction>('/cash-flow/transaction', { method: 'POST', json: payload }),
        history: () => backendFetch<CashShift[]>('/cash-flow/history'),
    },
    expenses: {
        list: (filters?: { startDate?: string; endDate?: string; category?: string }) => {
            const params = new URLSearchParams();
            if (filters?.startDate) params.set('startDate', filters.startDate);
            if (filters?.endDate) params.set('endDate', filters.endDate);
            if (filters?.category) params.set('category', filters.category);
            const q = params.toString();
            return backendFetch<Expense[]>(`/expenses${q ? `?${q}` : ''}`);
        },
        create: (payload: { amount: number; description: string; category: ExpenseCategory; date?: string; supplierId?: string }) =>
            backendFetch<Expense>('/expenses', { method: 'POST', json: payload }),
        update: (id: string, payload: Partial<{ amount: number; description: string; category: ExpenseCategory; date?: string; supplierId?: string }>) =>
            backendFetch<Expense>(`/expenses/${id}`, { method: 'PUT', json: payload }),
        remove: (id: string) => backendFetch<void>(`/expenses/${id}`, { method: 'DELETE' }),
        summary: (startDate: string, endDate: string) =>
            backendFetch<{ byCategory: { category: string; total: number }[]; totalExpenses: number }>(
                `/expenses/summary?startDate=${startDate}&endDate=${endDate}`
            ),
        profitLoss: (startDate: string, endDate: string) =>
            backendFetch<{
                period: { startDate: string; endDate: string };
                revenue: { totalSales: number; salesCount: number };
                costOfGoodsSold: number;
                grossProfit: number;
                grossMargin: number;
                operatingExpenses: { byCategory: { category: string; total: number }[]; totalExpenses: number };
                netProfit: number;
                netMargin: number;
            }>(`/expenses/profit-loss?startDate=${startDate}&endDate=${endDate}`),
    },
};

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
    const method = (options.method || 'GET').toUpperCase();
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

    if (method !== 'GET') {
        // Any write may impact list ordering/counts, so clear prefetched page cache.
        paginatedResponseCache.clear();
        paginatedInFlight.clear();
    }

    return data as T;
}

type PageLike = { page?: number; totalPages?: number };

const PAGINATED_CACHE_TTL_MS = 120_000;
const paginatedResponseCache = new Map<string, { expiresAt: number; data: unknown }>();
const paginatedInFlight = new Map<string, Promise<unknown>>();

function getCachedPaginated<T>(path: string): T | null {
    const entry = paginatedResponseCache.get(path);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
        paginatedResponseCache.delete(path);
        return null;
    }
    return entry.data as T;
}

function setCachedPaginated(path: string, data: unknown) {
    paginatedResponseCache.set(path, {
        data,
        expiresAt: Date.now() + PAGINATED_CACHE_TTL_MS,
    });
}

async function fetchPaginatedCached<T>(path: string): Promise<T> {
    const cached = getCachedPaginated<T>(path);
    if (cached !== null) return cached;

    const inFlight = paginatedInFlight.get(path) as Promise<T> | undefined;
    if (inFlight) return inFlight;

    const request = backendFetch<T>(path)
        .then((response) => {
            setCachedPaginated(path, response);
            return response;
        })
        .finally(() => {
            paginatedInFlight.delete(path);
        });

    paginatedInFlight.set(path, request as Promise<unknown>);
    return request;
}

function prefetchPaginated(path: string) {
    const cached = getCachedPaginated(path);
    if (cached !== null || paginatedInFlight.has(path)) return;
    void fetchPaginatedCached(path).catch(() => {
        // Prefetch failures are non-blocking by design.
    });
}

function buildPath(basePath: string, params: URLSearchParams) {
    const query = params.toString();
    return `${basePath}${query ? `?${query}` : ''}`;
}

function prefetchNextPage(basePath: string, params: URLSearchParams, response: PageLike) {
    const currentPage = Number(response?.page || params.get('page') || 1);
    const totalPages = Number(response?.totalPages || 1);
    if (!Number.isFinite(currentPage) || !Number.isFinite(totalPages) || currentPage >= totalPages) return;

    const nextParams = new URLSearchParams(params);
    nextParams.set('page', String(currentPage + 1));
    prefetchPaginated(buildPath(basePath, nextParams));
}

async function fetchPaginatedWithPrefetch<T extends PageLike>(basePath: string, params: URLSearchParams): Promise<T> {
    const path = buildPath(basePath, params);
    const response = await fetchPaginatedCached<T>(path);
    prefetchNextPage(basePath, params, response);
    return response;
}

export type Category = {
    id: string;
    name: string;
    description?: string | null;
    tenantId: string;
    createdAt: string;
    updatedAt: string;
};

export type PurchaseStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'PARTIAL';

export type PurchaseItem = {
    id: string;
    quantity: number;
    costPrice: number;
    productId: string;
    product: {
        id: string;
        name: string;
        sku?: string | null;
        costPrice: number;
    };
};

export type PurchasePayment = {
    id: string;
    amount: number;
    date: string;
    notes?: string | null;
    createdById: string;
    createdBy?: { name: string };
};

export type Purchase = {
    id: string;
    purchaseNumber: number;
    subtotal: number;
    additionalCosts: number;
    total: number;
    amountPaid: number;
    status: PurchaseStatus;
    isPaid: boolean;
    notes?: string | null;
    date: string;
    supplierId: string;
    supplier: {
        id: string;
        name: string;
        taxId?: string | null;
        email?: string | null;
    };
    buyerId: string;
    buyer: {
        id: string;
        name: string;
    };
    warehouseId?: string | null;
    items: PurchaseItem[];
    payments?: PurchasePayment[];
    createdAt: string;
    _count?: {
        items: number;
        payments: number;
    };
};

export type Product = {
    id: string;
    name: string;
    description?: string | null;
    barcode?: string | null;
    sku?: string | null;
    images: string[];
    costPrice: string;
    salePrice: string;
    creditPrice?: string;
    allowCreditSale?: boolean;
    creditDownPayment?: string;
    isPublic: boolean;
    isSellable: boolean;
    tenantId: string;
    createdAt: string;
    updatedAt: string;
    categoryId?: string | null;
    totalStock?: number;
    activeCosts?: { cost: number; quantity: number }[];
    visualVariants?: Array<{
        id?: string;
        name: string;
        image: string;
        sortOrder?: number;
        isPublic?: boolean;
    }>;
};

export type CreditSaleStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export type CreditPayment = {
    id: string;
    amount: number;
    paymentMethod: 'CASH' | 'CARD' | 'TRANSFER' | 'OTHER';
    notes?: string | null;
    paidAt: string;
    createdById: string;
    createdBy?: { id: string; name: string };
    createdAt: string;
};

export type CreditSale = {
    id: string;
    invoiceId: string;
    tenantId: string;
    customerId: string;
    customer: Customer;
    totalAmount: number;
    downPayment: number;
    paidAmount: number;
    balance: number;
    installmentsCount: number;
    installmentAmount: number;
    nextDueDate?: string | null;
    status: CreditSaleStatus;
    notes?: string | null;
    createdAt: string;
    updatedAt: string;
    invoice?: any;
    payments?: CreditPayment[];
};

export type ComboPricingType = 'FIXED' | 'PERCENT_OFF';

export type ComboItem = {
    productId: string;
    productName: string;
    quantity: number;
    productSalePrice: number;
    productCostPrice: number;
    globalStock: number;
    warehouseStock?: number | null;
    productImage?: string | null;
};

export type Combo = {
    id: string;
    name: string;
    description?: string | null;
    image?: string | null;
    pricingType: ComboPricingType;
    fixedPrice: number;
    discountPercent: number;
    isActive: boolean;
    isPublic: boolean;
    items: ComboItem[];
    baseUnitPrice: number;
    finalUnitPrice: number;
    discountPerUnit: number;
    maxUnitsGlobal: number;
    maxUnitsInWarehouse: number | null;
    available: boolean;
    createdAt: string;
    updatedAt: string;
};

export type PaginatedResponse<T> = {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};

export type AuditLog = {
    id: string;
    action: string;
    entity: string;
    entityId?: string | null;
    oldValue?: any;
    newValue?: any;
    metadata?: any;
    userId?: string | null;
    userName?: string | null;
    userRole?: string | null;
    tenantId: string;
    createdAt: string;
};

export type Warehouse = {
    id: string;
    name: string;
    address?: string | null;
    tenantId: string;
    isDefault: boolean;
};

export type Customer = {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    docNumber?: string | null;
    address?: string | null;
    isBanned: boolean;
    bannedAt?: string | null;
    banReason?: string | null;
};

export type StockRow = {
    id: string;
    quantity: number;
    productId: string;
    warehouseId: string;
    product: { id: string; name: string; barcode?: string | null; sku?: string | null; costPrice?: string | null; salePrice?: string | null; categoryId?: string | null };
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
    | 'INVENTORY'       // Gastos generados por compras de inventario
    | 'CASH_REGISTER'   // Gastos registrados desde la caja registradora
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

export type InventoryValuation = {
    totalCost: number;
    totalValue: number;
    totalItems: number;
    potentialProfit: number;
    warehouseBreakdown: Array<{
        id: string;
        name: string;
        cost: number;
        value: number;
        items: number;
    }>;
};

export type AnalyticsDashboard = {
    period: { start: string; end: string };
    summary: {
        totalRevenue: number;
        totalProfit: number;
        totalExpenses: number;
        netProfit: number;
        salesCount: number;
        averageTicket: number;
        credit?: {
            soldInPeriod: number;
            creditSalesCount: number;
            collectionsInPeriod: number;
            collectionsCount: number;
            outstandingBalance: number;
            overdueBalance: number;
        };
    };
    salesOverTime: Array<{ date: string; total: number; profit: number }>;
    topProducts: Array<{ name: string; quantity: number; revenue: number; profit: number }>;
    topSellers: Array<{ name: string; total: number; profit: number; salesCount: number }>;
    warehouseStats: Array<{ name: string; total: number; profit: number; salesCount: number }>;
    categoryStats: Array<{ name: string; total: number; profit: number }>;
    paymentMethodStats: Array<{ name: string; total: number }>;
    comboStats: Array<{ name: string; total: number; profit: number; quantity: number; salesCount: number }>;
    deadStock: Array<{ id: string; name: string; sku: string | null; stock: number; value: number }>;
};

export const api = {
    products: {
        list: (options?: { page?: number; limit?: number; search?: string; categoryId?: string; minPrice?: number; maxPrice?: number; stockStatus?: string; refresh?: boolean; sellableOnly?: boolean }) => {
            const params = new URLSearchParams();
            if (options?.page) params.set('page', options.page.toString());
            if (options?.limit) params.set('limit', options.limit.toString());
            if (options?.search) params.set('search', options.search);
            if (options?.categoryId) params.set('categoryId', options.categoryId);
            if (options?.minPrice !== undefined) params.set('minPrice', options.minPrice.toString());
            if (options?.maxPrice !== undefined) params.set('maxPrice', options.maxPrice.toString());
            if (options?.stockStatus) params.set('stockStatus', options.stockStatus);
            if (options?.refresh) params.set('refresh', '1');
            if (options?.sellableOnly) params.set('sellableOnly', '1');
            if (options?.refresh) {
                return backendFetch<PaginatedResponse<Product>>(buildPath('/products', params));
            }
            return fetchPaginatedWithPrefetch<PaginatedResponse<Product>>('/products', params);
        },
        get: (id: string, refresh = false) => backendFetch<Product>(`/products/${id}${refresh ? '?refresh=1' : ''}`),
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
            images?: string[];
            costPrice?: number;
            salePrice?: number;
            creditPrice?: number;
            allowCreditSale?: boolean;
            creditDownPayment?: number;
            isPublic?: boolean;
            isSellable?: boolean;
            initialStock?: number;
            initialWarehouseId?: string;
            categoryId?: string;
            visualVariants?: Array<{ name: string; image: string; sortOrder?: number; isPublic?: boolean }>;
        }) => backendFetch<Product>('/products', { method: 'POST', json: payload }),
        update: (id: string, payload: Partial<{
            name: string;
            description?: string;
            sku?: string;
            images?: string[];
            costPrice?: number;
            salePrice?: number;
            creditPrice?: number;
            allowCreditSale?: boolean;
            creditDownPayment?: number;
            isPublic?: boolean;
            isSellable?: boolean;
            categoryId?: string;
            visualVariants?: Array<{ name: string; image: string; sortOrder?: number; isPublic?: boolean }>;
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
    combos: {
        list: (options?: { warehouseId?: string; includeInactive?: boolean; publicOnly?: boolean }) => {
            const params = new URLSearchParams();
            if (options?.warehouseId) params.set('warehouseId', options.warehouseId);
            if (options?.includeInactive) params.set('includeInactive', '1');
            if (options?.publicOnly) params.set('publicOnly', '1');
            const q = params.toString();
            return backendFetch<Combo[]>(`/combos${q ? `?${q}` : ''}`);
        },
        get: (id: string, options?: { warehouseId?: string }) => {
            const params = new URLSearchParams();
            if (options?.warehouseId) params.set('warehouseId', options.warehouseId);
            const q = params.toString();
            return backendFetch<Combo>(`/combos/${id}${q ? `?${q}` : ''}`);
        },
        create: (payload: {
            name: string;
            description?: string;
            image?: string;
            pricingType: ComboPricingType;
            fixedPrice?: number;
            discountPercent?: number;
            isActive?: boolean;
            isPublic?: boolean;
            items: Array<{ productId: string; quantity: number }>;
        }) => backendFetch<Combo>('/combos', { method: 'POST', json: payload }),
        update: (id: string, payload: Partial<{
            name: string;
            description?: string;
            image?: string;
            pricingType: ComboPricingType;
            fixedPrice?: number;
            discountPercent?: number;
            isActive?: boolean;
            isPublic?: boolean;
            items: Array<{ productId: string; quantity: number }>;
        }>) => backendFetch<Combo>(`/combos/${id}`, { method: 'PATCH', json: payload }),
        remove: (id: string) => backendFetch<{ success: boolean; message: string }>(`/combos/${id}`, { method: 'DELETE' }),
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
        stockPaginated: (params: { productId?: string; warehouseId?: string; page?: number; limit?: number; search?: string }) => {
            const search = new URLSearchParams();
            if (params.productId) search.set('productId', params.productId);
            if (params.warehouseId) search.set('warehouseId', params.warehouseId);
            if (params.page) search.set('page', params.page.toString());
            if (params.limit) search.set('limit', params.limit.toString());
            if (params.search) search.set('search', params.search);
            return fetchPaginatedWithPrefetch<PaginatedResponse<StockRow>>('/inventory/stock', search);
        },
        kardex: (productId: string, warehouseId?: string) => {
            const search = new URLSearchParams();
            search.set('productId', productId);
            if (warehouseId) search.set('warehouseId', warehouseId);
            return backendFetch<StockMovement[]>(`/inventory/kardex?${search.toString()}`);
        },
        valuation: () => backendFetch<InventoryValuation>('/inventory/valuation'),
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
        list: (options?: { page?: number; limit?: number; search?: string; refresh?: boolean }) => {
            const params = new URLSearchParams();
            if (options?.page) params.set('page', options.page.toString());
            if (options?.limit) params.set('limit', options.limit.toString());
            if (options?.search) params.set('search', options.search);
            if (options?.refresh) params.set('refresh', '1');
            if (options?.refresh) {
                return backendFetch<PaginatedResponse<Customer>>(buildPath('/customers', params));
            }
            return fetchPaginatedWithPrefetch<PaginatedResponse<Customer>>('/customers', params);
        },
        create: (payload: {
            name: string;
            docNumber: string;
            phone: string;
            email?: string;
            address?: string;
        }) => backendFetch<Customer>('/customers', { method: 'POST', json: payload }),
        update: (id: string, payload: Partial<{
            name: string;
            docNumber: string;
            phone: string;
            email?: string;
            address?: string;
        }>) => backendFetch<Customer>(`/customers/${id}`, { method: 'PATCH', json: payload }),
        setBan: (id: string, payload: { isBanned: boolean; banReason?: string }) =>
            backendFetch<Customer>(`/customers/${id}/ban`, { method: 'PATCH', json: payload }),
        remove: (id: string) => backendFetch<Customer>(`/customers/${id}`, { method: 'DELETE' }),
    },
    invoices: {
        create: (payload: any) => backendFetch<any>('/invoices', { method: 'POST', json: payload }),
        list: (options?: { page?: number; limit?: number; search?: string; from?: string; to?: string; status?: string }) => {
            const params = new URLSearchParams();
            if (options?.page) params.set('page', options.page.toString());
            if (options?.limit) params.set('limit', options.limit.toString());
            if (options?.search) params.set('search', options.search);
            if (options?.from) params.set('from', options.from);
            if (options?.to) params.set('to', options.to);
            if (options?.status) params.set('status', options.status);
            return fetchPaginatedWithPrefetch<PaginatedResponse<any>>('/invoices', params);
        },
        get: (id: string) => backendFetch<any>(`/invoices/${id}`),
        cancel: (id: string) => backendFetch<any>(`/invoices/${id}/cancel`, { method: 'POST' }),
    },
    suppliers: {
        list: (options?: { page?: number; limit?: number; search?: string }) => {
            const params = new URLSearchParams();
            if (options?.page) params.set('page', options.page.toString());
            if (options?.limit) params.set('limit', options.limit.toString());
            if (options?.search) params.set('search', options.search);
            return fetchPaginatedWithPrefetch<PaginatedResponse<Supplier>>('/suppliers', params);
        },
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
            cashSales?: number;
            totalSales: number;
            cashCreditCollections?: number;
            deposits: number;
            withdrawals: number;
            expenses: number;
            expected: number;
            openingTime: string;
            sellerName: string;
        } | null>('/cash-flow/summary'),
        addTransaction: (payload: { amount: number; reason: string; type: 'DEPOSIT' | 'WITHDRAWAL' | 'EXPENSE' }) =>
            backendFetch<CashTransaction>('/cash-flow/transaction', { method: 'POST', json: payload }),
        history: (filters?: { startDate?: string; endDate?: string }) => {
            const params = new URLSearchParams();
            if (filters?.startDate) params.append('from', filters.startDate);
            if (filters?.endDate) params.append('to', filters.endDate);
            const query = params.toString();
            return backendFetch<CashShift[]>(`/cash-flow/history${query ? `?${query}` : ''}`);
        },
    },
    expenses: {
        list: (filters?: { startDate?: string; endDate?: string; category?: string; page?: number; limit?: number }) => {
            const params = new URLSearchParams();
            if (filters?.startDate) params.set('startDate', filters.startDate);
            if (filters?.endDate) params.set('endDate', filters.endDate);
            if (filters?.category) params.set('category', filters.category);
            if (filters?.page) params.set('page', filters.page.toString());
            if (filters?.limit) params.set('limit', filters.limit.toString());
            return fetchPaginatedWithPrefetch<PaginatedResponse<Expense>>('/expenses', params);
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
                revenue: {
                    totalSales: number;
                    salesCount: number;
                    cashSales?: number;
                    creditSales?: number;
                    creditSalesCount?: number;
                    creditCollections?: number;
                    outstandingCreditBalance?: number;
                    overdueCreditBalance?: number;
                };
                costOfGoodsSold: number;
                grossProfit: number;
                grossMargin: number;
                operatingExpenses: { byCategory: { category: string; total: number }[]; totalExpenses: number };
                netProfit: number;
                netMargin: number;
            }>(`/expenses/profit-loss?startDate=${startDate}&endDate=${endDate}`),
    },
    analytics: {
        dashboard: (from?: string, to?: string) => {
            const params = new URLSearchParams();
            if (from) params.append('from', from);
            if (to) params.append('to', to);
            const query = params.toString();
            return backendFetch<AnalyticsDashboard>(`/analytics/dashboard${query ? `?${query}` : ''}`);
        },
        getProductStats: (productId: string, from?: string, to?: string) =>
            backendFetch<{
                totalSold: number;
                totalRevenue: number;
                totalProfit: number;
                margin: number;
            }>(`/analytics/product-stats?productId=${productId}${from ? `&from=${from}` : ''}${to ? `&to=${to}` : ''}`),
    },
    purchases: {
        list: (options?: { page?: number; limit?: number; search?: string; from?: string; to?: string }) => {
            const params = new URLSearchParams();
            if (options?.page) params.set('page', options.page.toString());
            if (options?.limit) params.set('limit', options.limit.toString());
            if (options?.search) params.set('search', options.search);
            if (options?.from) params.set('from', options.from);
            if (options?.to) params.set('to', options.to);
            return fetchPaginatedWithPrefetch<PaginatedResponse<Purchase>>('/purchases', params);
        },
        get: (id: string) => backendFetch<Purchase>(`/purchases/${id}`),
        create: (payload: {
            supplierId: string;
            warehouseId?: string;
            date?: string;
            items: { productId: string; quantity: number; costPrice: number }[];
            additionalCosts?: number;
            isPaid?: boolean;
            notes?: string;
        }) => backendFetch<Purchase>('/purchases', { method: 'POST', json: payload }),
        pay: (id: string) => backendFetch<Purchase>(`/purchases/${id}/pay`, { method: 'PATCH' }),
        addPayment: (id: string, payload: { amount: number; notes?: string }) =>
            backendFetch<PurchasePayment>(`/purchases/${id}/payments`, { method: 'POST', json: payload }),
    },
    credits: {
        list: (options?: { page?: number; limit?: number; search?: string; status?: CreditSaleStatus; from?: string; to?: string }) => {
            const params = new URLSearchParams();
            if (options?.page) params.set('page', options.page.toString());
            if (options?.limit) params.set('limit', options.limit.toString());
            if (options?.search) params.set('search', options.search);
            if (options?.status) params.set('status', options.status);
            if (options?.from) params.set('from', options.from);
            if (options?.to) params.set('to', options.to);
            return fetchPaginatedWithPrefetch<PaginatedResponse<CreditSale>>('/credits', params);
        },
        get: (id: string) => backendFetch<CreditSale>(`/credits/${id}`),
        addPayment: (id: string, payload: { amount: number; paymentMethod: 'CASH' | 'CARD' | 'TRANSFER' | 'OTHER'; notes?: string; paidAt?: string }) =>
            backendFetch<CreditSale>(`/credits/${id}/payments`, { method: 'POST', json: payload }),
    },
    catalog: {
        getSettings: () => backendFetch<{
            name: string;
            slug: string;
            catalogDescription: string;
            catalogBgColor: string;
            catalogAccentColor: string;
            catalogEnabled: boolean;
            catalogWhatsApp: string;
            catalogUrl: string;
        }>('/catalog/settings'),
        updateSettings: (payload: {
            catalogDescription?: string;
            catalogBgColor?: string;
            catalogAccentColor?: string;
            catalogEnabled?: boolean;
            catalogWhatsApp?: string;
        }) => backendFetch<{ success: boolean; message: string; catalogUrl: string }>('/catalog/settings', { method: 'PATCH', json: payload }),
    },
    superAdmin: {
        codes: {
            generate: (count: number, expiresInDays?: number) =>
                backendFetch<any[]>('/super-admin/codes/generate', { method: 'POST', json: { count, expiresInDays } }),
            list: () => backendFetch<any[]>('/super-admin/codes'),
            delete: (id: string) => backendFetch<any>(`/super-admin/codes/${id}`, { method: 'DELETE' }),
        },
        tenants: {
            list: () => backendFetch<any[]>('/super-admin/tenants'),
            ban: (id: string) => backendFetch<any>(`/super-admin/tenants/${id}/ban`, { method: 'POST' }),
            unban: (id: string) => backendFetch<any>(`/super-admin/tenants/${id}/unban`, { method: 'POST' }),
            deleteData: (id: string, payload: { password: string, confirmation: string }) =>
                backendFetch<any>(`/super-admin/tenants/${id}/delete-data`, { method: 'POST', json: payload }),
        },
        catalogImages: {
            generate: (formData: FormData) =>
                backendFetch<{
                    success: boolean;
                    message: string;
                    modelo: string;
                    modelos_usados?: {
                        analisis?: string;
                        refinado?: string;
                        generacion?: string | null;
                    };
                    timestamp: string;
                    whatsapp: string;
                    prompt_final: string;
                    count: number;
                    variant_states?: string[];
                    prompts_by_image?: Array<{
                        index: number;
                        prompt_used: string;
                    }>;
                    images: Array<{
                        index: number;
                        model: string;
                        image_base64: string;
                        image_url: string;
                    }>;
                    image_base64: string | null;
                    image_url: string | null;
                }>('/super-admin/catalog-images/generate', { method: 'POST', body: formData }),
        },
    },
    backup: {
        getAuthUrl: () => backendFetch<{ url: string }>('/backup/auth-url'),
        run: () => backendFetch<{ success: boolean; date: string }>('/backup/run', { method: 'POST' }),
        getStatus: () => backendFetch<{ connected: boolean; email?: string; lastBackupAt?: string }>('/backup/status'),

        // Super Admin Global Backups
        getGlobalAuthUrl: () => backendFetch<{ url: string }>('/backup/global/auth-url'),
        runGlobal: () => backendFetch<{ success: boolean; date: string }>('/backup/global/run', { method: 'POST' }),
        getGlobalStatus: () => backendFetch<{ connected: boolean; email?: string; lastBackupAt?: string }>('/backup/global/status'),

        restore: (file: File) => {
            const formData = new FormData();
            formData.append('file', file);
            return backendFetch<{ success: boolean; message: string }>('/backup/restore', {
                method: 'POST',
                body: formData,
            });
        },
    },
    audit: {
        list: (options?: { page?: number; limit?: number; entity?: string; action?: string; userId?: string; from?: string; to?: string }) => {
            const params = new URLSearchParams();
            if (options?.page) params.set('page', options.page.toString());
            if (options?.limit) params.set('limit', options.limit.toString());
            if (options?.entity) params.set('entity', options.entity);
            if (options?.action) params.set('action', options.action);
            if (options?.userId) params.set('userId', options.userId);
            if (options?.from) params.set('from', options.from);
            if (options?.to) params.set('to', options.to);
            return fetchPaginatedWithPrefetch<PaginatedResponse<AuditLog>>('/audit', params);
        }
    }
};

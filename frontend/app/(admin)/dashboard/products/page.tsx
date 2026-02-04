'use client'

import { ProductsManager } from '@/components/products/products-manager'

export default function ProductsPage() {
    return <ProductsManager readOnly={false} isAdminView={true} />
}

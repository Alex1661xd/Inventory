'use client'

import { useState, useEffect } from 'react'
import { api, type Product } from '@/lib/backend'
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from 'sonner'
import { Search, Package } from 'lucide-react'

export default function ProductsCatalogPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')

    useEffect(() => {
        loadProducts()
    }, [])

    const loadProducts = async () => {
        setLoading(true)
        try {
            const data = await api.products.list()
            setProducts(data)
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode?.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-bold">Catálogo de Productos</h1>
                <p className="text-muted-foreground">Consulta el inventario disponible</p>
            </div>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Search className="h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre, código o SKU..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {loading ? (
                        <div className="text-center py-20 text-muted-foreground">
                            Cargando productos...
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-20 text-muted-foreground">
                            <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No se encontraron productos</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-gray-50">
                                        <th className="text-left p-3 font-semibold text-sm">Producto</th>
                                        <th className="text-left p-3 font-semibold text-sm hidden md:table-cell">SKU</th>
                                        <th className="text-left p-3 font-semibold text-sm hidden sm:table-cell">Código</th>
                                        <th className="text-right p-3 font-semibold text-sm">Precio</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map(product => (
                                        <tr key={product.id} className="border-b hover:bg-gray-50">
                                            <td className="p-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                                                        {product.images?.[0] ? (
                                                            <img
                                                                src={product.images[0]}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <Package className="h-6 w-6 text-gray-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{product.name}</div>
                                                        <div className="text-xs text-muted-foreground sm:hidden">
                                                            {product.barcode}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3 text-sm text-muted-foreground hidden md:table-cell">
                                                {product.sku || '-'}
                                            </td>
                                            <td className="p-3 text-sm text-muted-foreground hidden sm:table-cell">
                                                {product.barcode || '-'}
                                            </td>
                                            <td className="p-3 text-right font-semibold">
                                                ${Number(product.salePrice).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

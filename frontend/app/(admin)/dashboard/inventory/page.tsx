'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { api, type Product, type StockRow, type Warehouse } from '@/lib/backend'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { KardexModal } from '@/components/inventory/KardexModal'
import { formatThousands } from '@/lib/utils'
import type { InventoryValuation } from '@/lib/backend'

interface AggregatedStock {
    productId: string
    product: {
        id: string
        name: string
        barcode?: string | null
        sku?: string | null
        costPrice?: string | null
        categoryId?: string | null
    } | null
    warehouseQuantities: Record<string, number>
    totalQuantity: number
}

export default function InventoryPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [warehouses, setWarehouses] = useState<Warehouse[]>([])
    const [stock, setStock] = useState<StockRow[]>([])
    const [loading, setLoading] = useState(false)

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    // Update stock modal state
    const [showUpdateStockModal, setShowUpdateStockModal] = useState(false)
    const [updateStockForm, setUpdateStockForm] = useState({
        productId: '',
        warehouseId: '',
        quantityDelta: 1,
        action: 'increase', // 'increase' or 'decrease'
        reason: 'ADJUSTMENT' // 'ADJUSTMENT', 'DAMAGE', 'RETURN'
    })
    const [currentStock, setCurrentStock] = useState<number | null>(null)
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [updating, setUpdating] = useState(false)

    // Filters
    const [selectedProduct, setSelectedProduct] = useState('')
    const [selectedWarehouse, setSelectedWarehouse] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const [selectedKardexProduct, setSelectedKardexProduct] = useState<{ id: string, name: string, warehouseId?: string } | null>(null)
    const [valuation, setValuation] = useState<InventoryValuation | null>(null)

    const loadData = async () => {
        setLoading(true)
        try {
            // Load base data, all stock and valuation
            const [p, w, s, v] = await Promise.all([
                api.products.list(),
                api.warehouses.list(),
                api.inventory.stock({}), // Fetch all stock initially
                api.inventory.valuation()
            ])
            setProducts(p)
            setWarehouses(w)
            setStock(s)
            setValuation(v)
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    useEffect(() => {
        setCurrentPage(1)
    }, [selectedProduct, selectedWarehouse, searchQuery])

    // Update current stock when product and warehouse are selected
    useEffect(() => {
        if (updateStockForm.productId && updateStockForm.warehouseId) {
            const stockItem = stock.find(item =>
                item.productId === updateStockForm.productId &&
                item.warehouseId === updateStockForm.warehouseId
            )
            setCurrentStock(stockItem?.quantity || 0)
        } else {
            setCurrentStock(null)
        }
    }, [updateStockForm.productId, updateStockForm.warehouseId, stock])

    const handleUpdateStock = async () => {
        const { productId, warehouseId, quantityDelta, action } = updateStockForm

        if (!productId || !warehouseId) {
            toast.error('Todos los campos son requeridos')
            return
        }

        const finalDelta = action === 'increase' ? quantityDelta : -quantityDelta

        setUpdating(true)
        try {
            await api.inventory.updateStock({
                productId,
                warehouseId,
                quantityDelta: finalDelta,
                type: updateStockForm.reason as any
            })

            toast.success(`Stock actualizado: ${action === 'increase' ? '+' : '-'}${quantityDelta} unidades`)
            setShowConfirmation(false)
            setShowUpdateStockModal(false)
            setUpdateStockForm({ productId: '', warehouseId: '', quantityDelta: 1, action: 'increase', reason: 'ADJUSTMENT' })
            setCurrentStock(null)
            await loadData()
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setUpdating(false)
        }
    }

    const handleConfirmUpdate = () => {
        const { productId, warehouseId, quantityDelta, action } = updateStockForm

        if (!productId || !warehouseId) {
            toast.error('Selecciona producto y almacén')
            return
        }

        if (action === 'decrease' && currentStock !== null && quantityDelta > currentStock) {
            toast.error('No puedes disminuir más unidades de las que existen')
            return
        }

        setShowConfirmation(true)
    }

    const aggregatedStock = useMemo(() => {
        const stockMap = new Map<string, AggregatedStock>()

        stock.forEach(item => {
            const productId = item.productId

            if (!stockMap.has(productId)) {
                stockMap.set(productId, {
                    productId,
                    product: item.product,
                    warehouseQuantities: {},
                    totalQuantity: 0
                })
            }

            const aggregated = stockMap.get(productId)!
            aggregated.warehouseQuantities[item.warehouseId] = item.quantity
            aggregated.totalQuantity += item.quantity
        })

        return Array.from(stockMap.values())
    }, [stock])

    const filteredAggregatedStock = useMemo(() => {
        return aggregatedStock.filter(item => {
            const matchesProduct = selectedProduct ? item.productId === selectedProduct : true

            const matchesWarehouse = selectedWarehouse
                ? (item.warehouseQuantities[selectedWarehouse] || 0) > 0
                : true

            const searchLower = searchQuery.toLowerCase()
            const productName = item.product?.name?.toLowerCase() || ''

            const matchesSearch = !searchQuery || productName.includes(searchLower)

            return matchesProduct && matchesWarehouse && matchesSearch
        })
    }, [aggregatedStock, selectedProduct, selectedWarehouse, searchQuery])

    // Pagination
    const paginatedStock = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return filteredAggregatedStock.slice(startIndex, endIndex)
    }, [filteredAggregatedStock, currentPage])

    const totalPages = Math.ceil(filteredAggregatedStock.length / itemsPerPage)

    const filteredValuation = useMemo(() => {
        if (!valuation) return null;
        if (!selectedWarehouse) return valuation;

        const wh = valuation.warehouseBreakdown.find(b => b.id === selectedWarehouse);
        if (!wh) return { totalCost: 0, totalValue: 0, totalItems: 0, potentialProfit: 0, warehouseBreakdown: [] };

        return {
            totalCost: wh.cost,
            totalValue: wh.value,
            totalItems: wh.items,
            potentialProfit: wh.value - wh.cost,
            warehouseBreakdown: [wh]
        };
    }, [valuation, selectedWarehouse]);


    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-4xl font-bold text-[hsl(var(--foreground))]" style={{ fontFamily: 'var(--font-display)' }}>
                        Inventario Detallado
                    </h2>
                    <p className="text-[hsl(var(--muted))] text-lg">
                        Consulta y filtra las existencias de todos tus almacenes en tiempo real.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="default"
                        onClick={() => setShowUpdateStockModal(true)}
                        className="group h-11"
                    >
                        <span className="mr-2">📦</span>
                        Actualizar Stock
                    </Button>
                    <Button variant="outline" onClick={loadData} disabled={loading} className="group h-11">
                        <span className={loading ? 'animate-spin mr-2' : 'group-hover:rotate-180 transition-transform duration-500 mr-2'}>⚙️</span>
                        {loading ? 'Sincronizando...' : 'Actualizar Datos'}
                    </Button>
                </div>
            </div>

            {/* Filters & Stats */}
            <div className="bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-[rgb(230,225,220)]">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2 lg:col-span-1 md:col-span-2">
                        <Label className="text-xs font-medium text-[hsl(var(--muted))]">Búsqueda</Label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                    <span className="text-lg">🔍</span>
                                </div>
                                <Input
                                    placeholder="Producto o almacén..."
                                    className="pl-10 h-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setShowFilters(!showFilters)}
                                className={cn("lg:hidden h-10 w-10 transition-colors", showFilters && "bg-[rgb(25,35,25)] text-white hover:bg-[rgb(45,55,45)]")}
                            >
                                <span className="text-lg">⚙️</span>
                            </Button>
                        </div>
                    </div>

                    {/* Stats Summary - Redesigned with Valuation */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:col-span-2 lg:col-span-4 mb-4">
                        <Card className="bg-[hsl(var(--surface-elevated))] border-none shadow-sm overflow-hidden">
                            <CardContent className="px-4 py-6 flex flex-col items-center justify-center min-h-[140px]">
                                <div className="flex flex-col items-center justify-center h-full w-full">
                                    <div className="text-[10px] font-black text-[hsl(var(--muted))] uppercase tracking-tighter opacity-70 mb-2 text-center">Inversión (Costo)</div>
                                    <div className="text-xl md:text-2xl font-black text-[hsl(var(--foreground))] text-center mb-3">
                                        ${formatThousands(filteredValuation?.totalCost || 0)}
                                    </div>
                                    <div className="h-1 w-full max-w-[80px] bg-amber-500/20 rounded-full mb-2 mx-auto">
                                        <div className="h-1 bg-amber-500 rounded-full" style={{ width: '100%' }}></div>
                                    </div>
                                    <div className="text-[9px] font-medium text-[hsl(var(--muted))] opacity-60 text-center">Capital invertido en compras</div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-[hsl(var(--surface-elevated))] border-none shadow-sm overflow-hidden">
                            <CardContent className="px-4 py-6 flex flex-col items-center justify-center min-h-[140px]">
                                <div className="flex flex-col items-center justify-center h-full w-full">
                                    <div className="text-[10px] font-black text-[hsl(var(--muted))] uppercase tracking-tighter opacity-70 mb-2 text-center">Valor Venta Est.</div>
                                    <div className="text-xl md:text-2xl font-black text-emerald-600 text-center mb-3">
                                        ${formatThousands(filteredValuation?.totalValue || 0)}
                                    </div>
                                    <div className="h-1 w-full max-w-[80px] bg-emerald-500/20 rounded-full mb-2 mx-auto">
                                        <div className="h-1 bg-emerald-500 rounded-full" style={{ width: '100%' }}></div>
                                    </div>
                                    <div className="text-[9px] font-medium text-[hsl(var(--muted))] opacity-60 text-center">Ingreso bruto potencial</div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-[hsl(var(--surface-elevated))] border-none shadow-sm overflow-hidden">
                            <CardContent className="px-4 py-6 flex flex-col items-center justify-center min-h-[140px]">
                                <div className="flex flex-col items-center justify-center h-full w-full">
                                    <div className="text-[10px] font-black text-[hsl(var(--muted))] uppercase tracking-tighter opacity-70 mb-2 text-center">Margen Potencial</div>
                                    <div className="text-xl md:text-2xl font-black text-blue-600 text-center mb-1">
                                        ${formatThousands(filteredValuation?.potentialProfit || 0)}
                                    </div>
                                    <div className="text-[10px] font-bold text-blue-500 mb-2 text-center">
                                        {filteredValuation?.totalCost ? ((filteredValuation.potentialProfit / filteredValuation.totalCost) * 100).toFixed(1) : 0}% sobre costo
                                    </div>
                                    <div className="text-[9px] font-medium text-[hsl(var(--muted))] opacity-60 text-center">Utilidad bruta esperada</div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-[hsl(var(--primary))] text-white border-none shadow-md overflow-hidden">
                            <CardContent className="px-4 py-6 flex flex-col items-center justify-center min-h-[140px]">
                                <div className="flex flex-col items-center justify-center h-full w-full">
                                    <div className="text-[10px] font-black opacity-80 uppercase tracking-tighter mb-2 text-center">Total Unidades</div>
                                    <div className="text-xl md:text-2xl font-black text-center mb-2">
                                        {formatThousands(filteredValuation?.totalItems || 0)}
                                    </div>
                                    <div className="text-[10px] font-bold opacity-70 mb-1 text-center">
                                        {selectedWarehouse ? 'En esta bodega' : `En ${filteredValuation?.warehouseBreakdown?.length || 0} Bodegas`}
                                    </div>
                                    <div className="text-[9px] font-medium opacity-50 text-center">Conteo físico de mercancía</div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Secondary Filters - Hidden on mobile unless showFilters is true */}
                    <div className={cn(
                        "grid gap-4 md:grid-cols-2 lg:grid-cols-2 lg:col-span-4 items-end",
                        !showFilters && "hidden lg:grid"
                    )}>
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-[rgb(120,115,110)]">Filtrar por Producto</Label>
                            <select
                                className="flex h-10 w-full rounded-lg border border-[rgb(230,225,220)] bg-white/90 px-3 py-2 text-sm focus:outline-none focus:border-[rgb(25,35,25)]"
                                value={selectedProduct}
                                onChange={(e) => setSelectedProduct(e.target.value)}
                                style={{ color: selectedProduct ? 'rgb(25,35,25)' : 'rgb(120,115,110)' }}
                            >
                                <option value="">Todos los productos</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-[rgb(120,115,110)]">Filtrar por Almacén</Label>
                            <select
                                className="flex h-10 w-full rounded-lg border border-[rgb(230,225,220)] bg-white/90 px-3 py-2 text-sm focus:outline-none focus:border-[rgb(25,35,25)]"
                                value={selectedWarehouse}
                                onChange={(e) => setSelectedWarehouse(e.target.value)}
                                style={{ color: selectedWarehouse ? 'rgb(25,35,25)' : 'rgb(120,115,110)' }}
                            >
                                <option value="">Todos los almacenes</option>
                                {warehouses.map(w => (
                                    <option key={w.id} value={w.id}>{w.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[rgb(230,225,220)]">
                    <div className="text-sm text-[rgb(120,115,110)] font-medium">
                        Mostrando {paginatedStock.length} de {filteredAggregatedStock.length} productos
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setSelectedProduct('')
                            setSelectedWarehouse('')
                            setSearchQuery('')
                            setCurrentPage(1)
                        }}
                        className="text-xs"
                    >
                        Limpiar Filtros
                    </Button>
                </div>
            </div>

            {/* Results Table */}
            <Card className="shadow-xl border-[hsl(var(--border))] overflow-hidden">
                <CardHeader className="bg-[hsl(var(--surface-elevated))] border-b border-[hsl(var(--border))]">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle style={{ fontFamily: 'var(--font-display)' }}>Existencias</CardTitle>
                            <CardDescription>
                                Mostrando {paginatedStock.length} de {filteredAggregatedStock.length} productos
                            </CardDescription>
                        </div>
                        {(selectedProduct || selectedWarehouse || searchQuery) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSelectedProduct('')
                                    setSelectedWarehouse('')
                                    setSearchQuery('')
                                    setCurrentPage(1)
                                }}
                            >
                                Limpiar Filtros
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-[hsl(var(--background))] border-b border-[hsl(var(--border))]">
                                    <th className="px-6 py-4 text-left text-xs font-black text-[hsl(var(--muted))] uppercase tracking-widest">Producto</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-[hsl(var(--muted))] uppercase tracking-widest">SKU</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-[hsl(var(--muted))] uppercase tracking-widest">Almacén</th>
                                    <th className="px-6 py-4 text-center text-xs font-black text-[hsl(var(--muted))] uppercase tracking-widest">Cantidad</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-[hsl(var(--muted))] uppercase tracking-widest">Estado</th>
                                    <th className="px-6 py-4 text-right text-xs font-black text-[hsl(var(--muted))] uppercase tracking-widest">Kardex</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[hsl(var(--border))]">
                                {paginatedStock.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-[hsl(var(--muted))]">
                                            <div className="text-4xl mb-4">🔍</div>
                                            <p className="font-medium">No se encontraron productos con los filtros seleccionados.</p>
                                        </td>
                                    </tr>
                                )}
                                {paginatedStock.flatMap((item) => {
                                    // Si hay filtros específicos, mostrar solo las filas que coinciden
                                    const relevantWarehouses = selectedWarehouse
                                        ? warehouses.filter(w => w.id === selectedWarehouse && (item.warehouseQuantities[w.id] || 0) > 0)
                                        : warehouses.filter(w => (item.warehouseQuantities[w.id] || 0) > 0);

                                    // Si un producto no tiene stock en ningún almacén y no hay filtros, mostrar una fila con "Sin Stock"
                                    if (relevantWarehouses.length === 0 && !selectedWarehouse && !selectedProduct) {
                                        return [
                                            <tr key={`${item.productId}-no-stock`} className="group hover:bg-[hsl(var(--surface-elevated))] transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-[hsl(var(--foreground))] text-base group-hover:text-[hsl(var(--primary))] transition-colors">
                                                        {item.product?.name ?? item.productId}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-[10px] font-mono text-[hsl(var(--muted))]">{item.product?.sku || 'N/A'}</div>
                                                </td>
                                                <td className="px-6 py-4 text-center text-[hsl(var(--muted))]">Todos los almacenes</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center justify-center min-w-[3rem] px-3 py-1 rounded-lg text-lg font-black shadow-sm bg-red-50 text-red-700 border border-red-100">
                                                        0
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-50 text-red-700 border border-red-100">
                                                        Sin Stock
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 text-[10px] font-black uppercase tracking-tighter border-indigo-200 bg-indigo-50/30 text-indigo-700 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all duration-300 shadow-sm flex items-center gap-1.5 rounded-full px-3 ml-auto"
                                                        onClick={() => item.product && setSelectedKardexProduct({
                                                            id: item.product.id,
                                                            name: item.product.name,
                                                            warehouseId: selectedWarehouse || undefined
                                                        })}
                                                    >
                                                        <span>📋</span> Ver Kardex
                                                    </Button>
                                                </td>
                                            </tr>
                                        ];
                                    }

                                    return relevantWarehouses.map(warehouse => {
                                        const quantity = item.warehouseQuantities[warehouse.id] || 0;
                                        const stockStatus = quantity > 10 ? 'Alto' : quantity > 0 ? 'Medio' : 'Sin Stock';
                                        const statusColor = quantity > 10 ? 'emerald' : quantity > 0 ? 'amber' : 'red';

                                        return (
                                            <tr key={`${item.productId}-${warehouse.id}`} className="group hover:bg-[hsl(var(--surface-elevated))] transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-[hsl(var(--foreground))] text-base group-hover:text-[hsl(var(--primary))] transition-colors">
                                                        {item.product?.name ?? item.productId}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-[10px] font-mono text-[hsl(var(--muted))]">{item.product?.sku || 'N/A'}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-[hsl(var(--foreground))">{warehouse.name}</div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={cn(
                                                        "inline-flex items-center justify-center min-w-[3rem] px-3 py-1 rounded-lg text-lg font-black shadow-sm",
                                                        quantity > 10 ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                                                            quantity > 0 ? "bg-amber-50 text-amber-700 border border-amber-100" :
                                                                "bg-red-50 text-red-700 border border-red-100"
                                                    )}>
                                                        {quantity}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-xs font-medium px-2 py-1 rounded-full bg-${statusColor}-50 text-${statusColor}-700 border border-${statusColor}-100`}>
                                                        {stockStatus}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 text-[10px] font-black uppercase tracking-tighter border-indigo-200 bg-indigo-50/30 text-indigo-700 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all duration-300 shadow-sm flex items-center gap-1.5 rounded-full px-3 ml-auto"
                                                        onClick={() => item.product && setSelectedKardexProduct({
                                                            id: item.product.id,
                                                            name: item.product.name,
                                                            warehouseId: warehouse.id
                                                        })}
                                                    >
                                                        <span>📋</span> Ver Kardex
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    });
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-[hsl(var(--muted))]">
                        Página {currentPage} de {totalPages} ({filteredAggregatedStock.length} productos totales)
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            ← Anterior
                        </Button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const pageNum = i + 1
                                return (
                                    <Button
                                        key={pageNum}
                                        variant={currentPage === pageNum ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setCurrentPage(pageNum)}
                                        className="w-8 h-8 p-0"
                                    >
                                        {pageNum}
                                    </Button>
                                )
                            })}
                            {totalPages > 5 && (
                                <>
                                    <span className="px-2 text-[hsl(var(--muted))]">...</span>
                                    <Button
                                        variant={currentPage === totalPages ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setCurrentPage(totalPages)}
                                        className="w-8 h-8 p-0"
                                    >
                                        {totalPages}
                                    </Button>
                                </>
                            )}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Siguiente →
                        </Button>
                    </div>
                </div>
            )}

            {/* Update Stock Modal */}
            {showUpdateStockModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowUpdateStockModal(false)} />
                    <div className="relative bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Actualizar Stock</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowUpdateStockModal(false)}
                                className="h-8 w-8 p-0"
                            >
                                ✕
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Producto</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    value={updateStockForm.productId}
                                    onChange={(e) => setUpdateStockForm(prev => ({ ...prev, productId: e.target.value }))}
                                    style={{ color: updateStockForm.productId ? 'inherit' : 'rgb(120,115,110)' }}
                                >
                                    <option value="">Selecciona un producto...</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Almacén</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    value={updateStockForm.warehouseId}
                                    onChange={(e) => setUpdateStockForm(prev => ({ ...prev, warehouseId: e.target.value }))}
                                    style={{ color: updateStockForm.warehouseId ? 'inherit' : 'rgb(120,115,110)' }}
                                >
                                    <option value="">Selecciona un almacén...</option>
                                    {warehouses.map(w => (
                                        <option key={w.id} value={w.id}>{w.name}</option>
                                    ))}
                                </select>
                            </div>

                            {currentStock !== null && (
                                <div className="bg-[hsl(var(--surface-elevated))] border border-[hsl(var(--border))] rounded-lg p-4">
                                    <div className="text-center">
                                        <div className="text-sm text-[hsl(var(--muted))] mb-1">Stock Actual</div>
                                        <div className="text-2xl font-bold text-[hsl(var(--foreground))]">{currentStock} unidades</div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Acción</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        type="button"
                                        variant={updateStockForm.action === 'increase' ? 'default' : 'outline'}
                                        onClick={() => setUpdateStockForm(prev => ({ ...prev, action: 'increase', reason: 'ADJUSTMENT' }))}
                                        className="h-10"
                                    >
                                        ➕ Aumentar
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={updateStockForm.action === 'decrease' ? 'default' : 'outline'}
                                        onClick={() => setUpdateStockForm(prev => ({ ...prev, action: 'decrease', reason: 'ADJUSTMENT' }))}
                                        className="h-10"
                                    >
                                        ➖ Disminuir
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Motivo del Movimiento</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2"
                                    value={updateStockForm.reason}
                                    onChange={(e) => setUpdateStockForm(prev => ({ ...prev, reason: e.target.value }))}
                                >
                                    <option value="ADJUSTMENT">Ajuste Manual (General)</option>
                                    {updateStockForm.action === 'increase' ? (
                                        <>
                                            <option value="PURCHASE">Ingreso por Compra</option>
                                            <option value="RETURN">Devolución de Cliente</option>
                                            <option value="INITIAL">Inventario Inicial</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="DAMAGE">Daño / Merma (Rotura)</option>
                                            <option value="RETURN">Devolución a Proveedor</option>
                                        </>
                                    )}
                                </select>
                                <p className="text-[10px] text-[hsl(var(--muted))] italic">
                                    Esto determinará cómo aparece etiquetado en el Kardex.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Cantidad</Label>
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setUpdateStockForm(prev => ({
                                            ...prev,
                                            quantityDelta: Math.max(1, prev.quantityDelta - 1)
                                        }))}
                                        className="h-8 w-8 p-0"
                                    >
                                        -
                                    </Button>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={updateStockForm.quantityDelta}
                                        onChange={(e) => setUpdateStockForm(prev => ({
                                            ...prev,
                                            quantityDelta: Math.max(1, parseInt(e.target.value) || 1)
                                        }))}
                                        className="h-10 text-center"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setUpdateStockForm(prev => ({
                                            ...prev,
                                            quantityDelta: prev.quantityDelta + 1
                                        }))}
                                        className="h-8 w-8 p-0"
                                    >
                                        +
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-6">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowUpdateStockModal(false)
                                    setShowConfirmation(false)
                                    setUpdateStockForm({ productId: '', warehouseId: '', quantityDelta: 1, action: 'increase', reason: 'ADJUSTMENT' })
                                    setCurrentStock(null)
                                }}
                                className="flex-1"
                                disabled={updating}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleConfirmUpdate}
                                disabled={updating || !updateStockForm.productId || !updateStockForm.warehouseId}
                                className="flex-1"
                            >
                                Siguiente
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowConfirmation(false)} />
                    <div className="relative bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Confirmar Actualización</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowConfirmation(false)}
                                className="h-8 w-8 p-0"
                            >
                                ✕
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">⚠️</span>
                                    <div>
                                        <h4 className="font-semibold text-yellow-800 mb-2">Advertencia</h4>
                                        <p className="text-sm text-yellow-700">
                                            Estás a punto de {updateStockForm.action === 'increase' ? 'aumentar' : 'disminuir'} el stock.
                                            {updateStockForm.action === 'decrease' && currentStock !== null && updateStockForm.quantityDelta >= currentStock && (
                                                <span className="block mt-1 font-medium">
                                                    ¡Esto dejará el producto sin unidades en este almacén!
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[hsl(var(--surface-elevated))] border border-[hsl(var(--border))] rounded-lg p-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-[hsl(var(--muted))]">Producto:</span>
                                        <span className="text-sm font-medium">
                                            {products.find(p => p.id === updateStockForm.productId)?.name || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-[hsl(var(--muted))]">Almacén:</span>
                                        <span className="text-sm font-medium">
                                            {warehouses.find(w => w.id === updateStockForm.warehouseId)?.name || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-[hsl(var(--muted))]">Stock Actual:</span>
                                        <span className="text-sm font-medium">{currentStock || 0} unidades</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-[hsl(var(--muted))]">Acción:</span>
                                        <span className="text-sm font-medium">
                                            {updateStockForm.action === 'increase' ? '+' : '-'}{updateStockForm.quantityDelta} unidades
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-[hsl(var(--muted))]">Motivo:</span>
                                        <span className="text-sm font-bold text-indigo-600">
                                            {updateStockForm.reason === 'DAMAGE' ? 'DAÑO / MERMA' :
                                                updateStockForm.reason === 'RETURN' ? 'DEVOLUCIÓN' :
                                                    updateStockForm.reason === 'PURCHASE' ? 'COMPRA' : 'AJUSTE MANUAL'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-[hsl(var(--border))]">
                                        <span className="text-sm font-semibold">Stock Final:</span>
                                        <span className="text-sm font-bold">
                                            {(currentStock || 0) + (updateStockForm.action === 'increase' ? updateStockForm.quantityDelta : -updateStockForm.quantityDelta)} unidades
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-6">
                            <Button
                                variant="outline"
                                onClick={() => setShowConfirmation(false)}
                                className="flex-1"
                                disabled={updating}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleUpdateStock}
                                disabled={updating}
                                className="flex-1"
                                variant={updateStockForm.action === 'decrease' ? 'destructive' : 'default'}
                            >
                                {updating ? (
                                    <span className="flex items-center gap-2">
                                        <span className="animate-spin">⚙️</span>
                                        Actualizando...
                                    </span>
                                ) : (
                                    'Confirmar Actualización'
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <KardexModal
                isOpen={!!selectedKardexProduct}
                onClose={() => setSelectedKardexProduct(null)}
                product={selectedKardexProduct}
                warehouseId={selectedKardexProduct?.warehouseId}
            />
        </div>
    )
}
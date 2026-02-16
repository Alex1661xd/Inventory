'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api, type Supplier, type Warehouse, type Product } from '@/lib/backend'
import { toast } from 'sonner'
import {
    Plus,
    Trash2,
    Search,
    ArrowLeft,
    Box,
    Truck,
    Calendar,
    DollarSign
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { formatThousands } from '@/lib/utils'

interface PurchaseLineItem {
    productId: string
    name: string
    quantity: number
    costPrice: number
}

export default function NewPurchasePage() {
    const router = useRouter()
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [warehouses, setWarehouses] = useState<Warehouse[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [loadingData, setLoadingData] = useState(true)

    // Form state
    const [selectedSupplier, setSelectedSupplier] = useState('')
    const [selectedWarehouse, setSelectedWarehouse] = useState('')
    const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0])
    const [items, setItems] = useState<PurchaseLineItem[]>([])
    const [additionalCosts, setAdditionalCosts] = useState(0)
    const [isPaid, setIsPaid] = useState(true)
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(false)

    // Product search
    const [productSearch, setProductSearch] = useState('')
    const [showResults, setShowResults] = useState(false)

    useEffect(() => {
        const loadInitialData = async () => {
            setLoadingData(true)
            console.log('📦 [NewPurchase] Iniciando carga de datos base...')
            try {
                const [sRes, w, pRes] = await Promise.all([
                    api.suppliers.list({ limit: 500 }),
                    api.warehouses.list(),
                    api.products.list({ limit: 1000 })
                ])
                const s = Array.isArray(sRes) ? sRes : (sRes?.data || [])
                const p = Array.isArray(pRes) ? pRes : (pRes?.data || [])
                console.log(`✅ [NewPurchase] Datos cargados: ${s.length} proveedores, ${w.length} almacenes, ${p.length} productos`)
                setSuppliers(s)
                setWarehouses(w)
                setProducts(p)
            } catch (error: any) {
                console.error('❌ [NewPurchase] Error cargando datos base:', error)
                toast.error('Error al cargar datos base: ' + error.message)
            } finally {
                setLoadingData(false)
            }
        }
        loadInitialData()
    }, [])

    const filteredProducts = products.filter(p => {
        if (!p.name) return false;
        if (!productSearch) return true; // Mostrar todos si no hay búsqueda
        const nameMatch = p.name.toLowerCase().includes(productSearch.toLowerCase());
        const skuMatch = p.sku?.toLowerCase().includes(productSearch.toLowerCase()) || false;
        return nameMatch || skuMatch;
    }).slice(0, 10)

    useEffect(() => {
        if (showResults) {
            console.log(`🔍 [NewPurchase] Resultados visibles: ${filteredProducts.length} items (búsqueda: "${productSearch}")`)
        }
    }, [productSearch, filteredProducts.length, showResults])

    const addItem = (product: Product) => {
        if (items.find(i => i.productId === product.id)) {
            toast.error('Este producto ya está en la lista')
            return
        }

        setItems([...items, {
            productId: product.id,
            name: product.name,
            quantity: 1,
            costPrice: Number(product.costPrice) || 0
        }])
        setProductSearch('')
        setShowResults(false)
    }

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index))
    }

    const updateItem = (index: number, field: keyof PurchaseLineItem, value: any) => {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], [field]: value }
        setItems(newItems)
    }

    const itemsSubtotal = items.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0)
    const total = itemsSubtotal + Number(additionalCosts || 0)

    const handleSave = async () => {
        if (!selectedSupplier) return toast.error('Selecciona un proveedor')
        if (!selectedWarehouse) return toast.error('Selecciona un almacén de entrada')
        if (items.length === 0) return toast.error('Añade al menos un producto')
        if (items.some(i => i.quantity <= 0 || i.costPrice <= 0)) return toast.error('Revisa cantidades y precios')

        setLoading(true)
        try {
            await api.purchases.create({
                supplierId: selectedSupplier,
                warehouseId: selectedWarehouse,
                date: purchaseDate,
                additionalCosts: Number(additionalCosts),
                isPaid,
                notes,
                items: items.map(i => ({
                    productId: i.productId,
                    quantity: i.quantity,
                    costPrice: i.costPrice
                }))
            })
            toast.success('Compra registrada exitosamente e inventario actualizado')
            router.push('/dashboard/purchases')
        } catch (error: any) {
            toast.error(error.message || 'Error al guardar la compra')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full h-11 w-11 shadow-sm">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h2 className="text-4xl font-bold text-[hsl(var(--foreground))]" style={{ fontFamily: 'var(--font-display)' }}>
                            Nueva Compra
                        </h2>
                        <div className="flex items-center gap-2 text-[hsl(var(--muted))] text-lg font-medium opacity-80">
                            <span>Ingresa los datos de la factura y recibe mercancía.</span>
                            {!loadingData && (
                                <span className="text-xs bg-[hsl(var(--surface-elevated))] px-2 py-0.5 rounded-full border">
                                    {products.length} productos • {suppliers.length} prov.
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-xs font-black text-[hsl(var(--muted))] uppercase tracking-widest mb-1">Total Inversión</span>
                    <span className="text-4xl font-black text-[hsl(var(--primary))] tracking-tighter shadow-sm border px-4 py-2 rounded-2xl bg-white">
                        ${formatThousands(total)}
                    </span>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* General Information Card */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="shadow-lg border-[hsl(var(--border))] overflow-hidden rounded-3xl">
                        <CardHeader className="bg-[hsl(var(--surface-elevated))] border-b border-[hsl(var(--border))]">
                            <CardTitle className="flex items-center gap-2">
                                <Truck className="h-5 w-5 text-blue-500" />
                                Datos Generales
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-5">
                            <div className="space-y-2">
                                <Label className="text-xs font-black text-[hsl(var(--muted))] uppercase">Proveedor</Label>
                                <select
                                    className="w-full h-11 rounded-xl border border-[hsl(var(--border))] bg-white px-3 font-medium focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none disabled:opacity-50"
                                    value={selectedSupplier}
                                    onChange={(e) => setSelectedSupplier(e.target.value)}
                                    disabled={loadingData}
                                >
                                    <option value="">{loadingData ? 'Cargando proveedores...' : 'Selecciona proveedor...'}</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-black text-[hsl(var(--muted))] uppercase">Almacén de Entrada</Label>
                                <select
                                    className="w-full h-11 rounded-xl border border-[hsl(var(--border))] bg-white px-3 font-medium focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none disabled:opacity-50"
                                    value={selectedWarehouse}
                                    onChange={(e) => setSelectedWarehouse(e.target.value)}
                                    disabled={loadingData}
                                >
                                    <option value="">{loadingData ? 'Cargando almacenes...' : 'Selecciona almacén...'}</option>
                                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-black text-[hsl(var(--muted))] uppercase">Fecha de Compra</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted))]" />
                                    <Input
                                        type="date"
                                        className="pl-10 h-11 rounded-xl border-[hsl(var(--border))]"
                                        value={purchaseDate}
                                        onChange={(e) => setPurchaseDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-[hsl(var(--border))] space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-xs font-black text-[hsl(var(--muted))] uppercase">Condición de Pago</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button
                                            type="button"
                                            variant={isPaid ? 'default' : 'outline'}
                                            onClick={() => setIsPaid(true)}
                                            className={`rounded-xl h-11 font-bold ${isPaid ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                                        >
                                            <DollarSign className="w-4 h-4 mr-2" />
                                            Contado
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={!isPaid ? 'default' : 'outline'}
                                            onClick={() => setIsPaid(false)}
                                            className={`rounded-xl h-11 font-bold ${!isPaid ? 'bg-amber-600 hover:bg-amber-700' : ''}`}
                                        >
                                            <Calendar className="w-4 h-4 mr-2" />
                                            Crédito
                                        </Button>
                                    </div>
                                    <p className="text-[10px] text-[hsl(var(--muted))] font-medium italic mt-1">
                                        {isPaid ? 'Se generará un gasto automático por el total.' : 'No genera gasto ahora. Se pagará después.'}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-black text-[hsl(var(--muted))] uppercase italic flex justify-between">
                                        Fletes / Otros Gastos
                                        <span className="text-[hsl(var(--primary))]">${formatThousands(additionalCosts || 0)}</span>
                                    </Label>
                                    <div className="relative">
                                        <Truck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted))]" />
                                        <Input
                                            type="number"
                                            className="pl-10 h-11 rounded-xl border-[hsl(var(--border))] font-bold"
                                            placeholder="Ej: 50.00"
                                            value={additionalCosts || ''}
                                            onChange={(e) => setAdditionalCosts(parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-black text-[hsl(var(--muted))] uppercase">Notas Adicionales</Label>
                                    <textarea
                                        className="w-full rounded-xl border border-[hsl(var(--border))] bg-white p-3 text-sm font-medium focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none min-h-[80px]"
                                        placeholder="Detalles sobre el crédito o flete..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full h-16 rounded-3xl text-xl font-black bg-[hsl(var(--primary))] hover:opacity-90 shadow-xl transition-all hover:scale-[1.02] active:scale-95 text-white"
                    >
                        {loading ? 'Procesando...' : 'Finalizar Compra'}
                    </Button>
                </div>

                {/* Products & Items Card */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="shadow-lg border-[hsl(var(--border))] overflow-hidden rounded-3xl">
                        <CardHeader className="bg-[hsl(var(--surface-elevated))] border-b border-[hsl(var(--border))]">
                            <CardTitle className="flex items-center gap-2">
                                <Box className="h-5 w-5 text-emerald-500" />
                                Detalle de Productos
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {/* Search Product Box */}
                            <div className="relative mb-8">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted))]" />
                                    <Input
                                        placeholder={loadingData ? "Cargando catálogo..." : "Buscar producto a ingresar..."}
                                        className="h-14 pl-12 rounded-2xl text-lg font-medium border-2 focus:border-[hsl(var(--primary))] disabled:opacity-50"
                                        value={productSearch}
                                        disabled={loadingData}
                                        onChange={(e) => {
                                            setProductSearch(e.target.value)
                                            setShowResults(true)
                                        }}
                                        onFocus={() => setShowResults(true)}
                                    />
                                    {loadingData && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <div className="w-5 h-5 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    )}
                                </div>

                                {showResults && (
                                    <div className="absolute z-50 w-full mt-2 bg-white border border-[hsl(var(--border))] rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
                                        {products.length === 0 && !loadingData ? (
                                            <div className="p-8 text-center space-y-3">
                                                <div className="text-4xl">📭</div>
                                                <p className="font-bold text-[hsl(var(--foreground))]">Tu catálogo está vacío</p>
                                                <p className="text-sm text-[hsl(var(--muted))]">Debes crear productos en el módulo de Inventario antes de poder registrar compras.</p>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => router.push('/dashboard/inventory')}
                                                    className="mt-2 rounded-full font-bold"
                                                >
                                                    Ir a Inventario
                                                </Button>
                                            </div>
                                        ) : filteredProducts.length === 0 ? (
                                            <div className="p-4 text-center text-[hsl(var(--muted))] font-medium">
                                                {loadingData ? 'Cargando catálogo...' : 'No se encontraron productos que coincidan'}
                                            </div>
                                        ) : (
                                            filteredProducts.map(p => (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    onClick={() => addItem(p)}
                                                    className="w-full flex items-center justify-between p-4 hover:bg-[hsl(var(--surface-elevated))] transition-colors border-b last:border-0"
                                                >
                                                    <div className="text-left">
                                                        <p className="font-bold text-[hsl(var(--foreground))]">{p.name}</p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <p className="text-[10px] text-[hsl(var(--muted))] font-bold uppercase tracking-tighter italic">{p.sku || 'SIN SKU'}</p>
                                                            <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-black border border-emerald-200">
                                                                Costo Ref: ${formatThousands(p.costPrice)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Plus className="h-5 w-5 text-[hsl(var(--primary))]" />
                                                </button>
                                            ))
                                        )}
                                        {!productSearch && products.length > filteredProducts.length && (
                                            <div className="p-2 text-center bg-[hsl(var(--surface-elevated))] text-[10px] font-bold text-[hsl(var(--muted))] uppercase tracking-widest">
                                                Escribe para filtrar más de {products.length} productos
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Table of Items */}
                            <div className="rounded-2xl border border-[hsl(var(--border))] overflow-hidden h-[400px] overflow-y-auto bg-white/50">
                                <table className="w-full">
                                    <thead className="sticky top-0 bg-[hsl(var(--surface-elevated))] z-10 border-b">
                                        <tr>
                                            <th className="px-4 py-4 text-left text-xs font-black text-[hsl(var(--muted))] uppercase tracking-widest">Producto</th>
                                            <th className="px-4 py-4 text-center text-xs font-black text-[hsl(var(--muted))] uppercase tracking-widest">Cant.</th>
                                            <th className="px-4 py-4 text-right text-xs font-black text-[hsl(var(--muted))] uppercase tracking-widest">Costo Unit.</th>
                                            <th className="px-4 py-4 text-right text-xs font-black text-[hsl(var(--muted))] uppercase tracking-widest">Subtotal</th>
                                            <th className="px-4 py-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[hsl(var(--border))]">
                                        {items.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="py-20 text-center">
                                                    <div className="text-4xl mb-4">🛒</div>
                                                    <p className="text-[hsl(var(--muted))] font-bold italic">La lista está vacía. Añade productos para comenzar.</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            items.map((item, index) => (
                                                <tr key={index} className="group hover:bg-white transition-colors">
                                                    <td className="px-4 py-4">
                                                        <div className="font-bold text-[hsl(var(--foreground))]">{item.name}</div>
                                                    </td>
                                                    <td className="px-4 py-4 w-24">
                                                        <Input
                                                            type="number"
                                                            className="h-10 text-center font-bold rounded-lg border-[hsl(var(--border))]"
                                                            value={item.quantity}
                                                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-4 w-32 text-right">
                                                        <div className="relative">
                                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-[hsl(var(--muted))]">$</span>
                                                            <Input
                                                                type="number"
                                                                className="h-10 text-right font-bold pl-5 rounded-lg border-[hsl(var(--border))]"
                                                                value={item.costPrice}
                                                                onChange={(e) => updateItem(index, 'costPrice', parseFloat(e.target.value) || 0)}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-right">
                                                        <div className="font-black text-[hsl(var(--foreground))]">
                                                            ${formatThousands(item.quantity * item.costPrice)}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeItem(index)}
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

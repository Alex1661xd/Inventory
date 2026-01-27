'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { api, type Product, type Warehouse, type StockRow } from '@/lib/backend'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function TransfersPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [warehouses, setWarehouses] = useState<Warehouse[]>([])
    const [stock, setStock] = useState<StockRow[]>([])
    const [loading, setLoading] = useState(false)
    const [processing, setProcessing] = useState(false)

    // Form
    const [productId, setProductId] = useState('')
    const [fromWarehouseId, setFromWarehouseId] = useState('')
    const [toWarehouseId, setToWarehouseId] = useState('')
    const [quantity, setQuantity] = useState('1')

    const availableStock = useMemo(() => {
        if (!productId || !fromWarehouseId) return null;

        const stockItem = stock.find(item =>
            item.productId === productId && item.warehouseId === fromWarehouseId
        );
        return stockItem?.quantity || 0;
    }, [productId, fromWarehouseId, stock])

    const canSubmit = useMemo(() => {
        const qty = Number(quantity)
        const available = availableStock || 0
        return productId && fromWarehouseId && toWarehouseId &&
            fromWarehouseId !== toWarehouseId &&
            Number.isInteger(qty) && qty > 0 && qty <= available
    }, [productId, fromWarehouseId, toWarehouseId, quantity, availableStock])

    const loadData = async () => {
        setLoading(true)
        try {
            const [p, w, s] = await Promise.all([
                api.products.list(),
                api.warehouses.list(),
                api.inventory.stock({})
            ])
            setProducts(p)
            setWarehouses(w)
            setStock(s)
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const handleTransfer = async () => {
        if (!canSubmit) return

        setProcessing(true)
        try {
            await api.inventory.transfer({
                productId,
                fromWarehouseId,
                toWarehouseId,
                quantity: Number(quantity)
            })

            toast.success('¡Traslado exitoso!')

            // Reset form partly
            setQuantity('1')
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setProcessing(false)
        }
    }

    const swapWarehouses = () => {
        const temp = fromWarehouseId
        setFromWarehouseId(toWarehouseId)
        setToWarehouseId(temp)
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4">
                <h2 className="text-4xl font-bold text-[hsl(var(--foreground))]" style={{ fontFamily: 'var(--font-display)' }}>
                    Traslado de Mercancía
                </h2>
                <p className="text-[hsl(var(--muted))] text-lg">
                    Mueve productos entre almacenes de forma segura.
                </p>
            </div>

            <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-[rgb(230,225,220)] max-w-2xl mx-auto">
                <div className="space-y-6">
                    <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold text-[rgb(25,35,25)]" style={{ fontFamily: 'var(--font-display)' }}>Nuevo Traslado</h3>
                        <p className="text-[rgb(120,115,110)] mt-2">Mueve productos entre almacenes de forma segura</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-[rgb(120,115,110)]">Producto</Label>
                            <select
                                className="flex h-11 w-full rounded-lg border-2 border-[rgb(230,225,220)] bg-white/90 px-4 py-2.5 text-sm font-medium shadow-sm transition-all duration-300 focus:outline-none focus:border-[rgb(25,35,25)] [&>option:first-child]:text-[rgb(120,115,110)]"
                                value={productId}
                                onChange={(e) => setProductId(e.target.value)}
                                style={{ color: productId ? 'rgb(25,35,25)' : 'rgb(120,115,110)' }}
                            >
                                <option value="">Selecciona un producto...</option>
                                {products.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku || 'N/A'})</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-[rgb(120,115,110)]">Cantidad</Label>
                            <Input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="h-11 rounded-lg border-2 border-[rgb(230,225,220)] bg-white/90 px-4 py-2.5 text-sm font-medium shadow-sm transition-all duration-300 focus:outline-none focus:border-[rgb(25,35,25)]"
                                min="1"
                                placeholder="1"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3 items-end">
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-[rgb(120,115,110)]">Almacén Origen</Label>
                            <select
                                className="flex h-11 w-full rounded-lg border-2 border-[rgb(230,225,220)] bg-white/90 px-4 py-2.5 text-sm font-medium shadow-sm transition-all duration-300 focus:outline-none focus:border-[rgb(25,35,25)] [&>option:first-child]:text-[rgb(120,115,110)]"
                                value={fromWarehouseId}
                                onChange={(e) => setFromWarehouseId(e.target.value)}
                                style={{ color: fromWarehouseId ? 'rgb(25,35,25)' : 'rgb(120,115,110)' }}
                            >
                                <option value="">Selecciona origen...</option>
                                {warehouses.map((w) => (
                                    <option key={w.id} value={w.id} disabled={w.id === toWarehouseId}>{w.name}</option>
                                ))}
                            </select>
                            {productId && fromWarehouseId && (
                                <div className="text-xs text-[rgb(120,115,110)] mt-1">
                                    Stock actual: <span className="font-bold text-[rgb(25,35,25)]">{availableStock || 0} unidades</span>
                                    {quantity && Number(quantity) <= (availableStock || 0) && (
                                        <span className="block mt-1">
                                            Después del traslado: <span className="font-bold text-amber-600">{(availableStock || 0) - Number(quantity)} unidades</span>
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={swapWarehouses}
                            className="hidden md:flex w-11 h-11 rounded-full bg-white/90 border-2 border-[rgb(230,225,220)] items-center justify-center hover:bg-[rgb(25,35,25)] hover:text-white transition-all duration-300 text-lg shadow-sm mx-auto"
                            title="Intercambiar almacenes"
                        >
                            ⇄
                        </button>

                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-[rgb(120,115,110)]">Almacén Destino</Label>
                            <select
                                className="flex h-11 w-full rounded-lg border-2 border-[rgb(230,225,220)] bg-white/90 px-4 py-2.5 text-sm font-medium shadow-sm transition-all duration-300 focus:outline-none focus:border-[rgb(25,35,25)] [&>option:first-child]:text-[rgb(120,115,110)]"
                                value={toWarehouseId}
                                onChange={(e) => setToWarehouseId(e.target.value)}
                                style={{ color: toWarehouseId ? 'rgb(25,35,25)' : 'rgb(120,115,110)' }}
                            >
                                <option value="">Selecciona destino...</option>
                                {warehouses.map((w) => (
                                    <option key={w.id} value={w.id} disabled={w.id === fromWarehouseId}>{w.name}</option>
                                ))}
                            </select>
                            {productId && toWarehouseId && (
                                <div className="text-xs text-[rgb(120,115,110)] mt-1">
                                    Stock actual: <span className="font-bold text-[rgb(25,35,25)]">
                                        {(() => {
                                            const stockItem = stock.find(item =>
                                                item.productId === productId && item.warehouseId === toWarehouseId
                                            );
                                            return stockItem?.quantity || 0;
                                        })()} unidades
                                    </span>
                                    {quantity && Number(quantity) <= (availableStock || 0) && (
                                        <span className="block mt-1">
                                            Después del traslado: <span className="font-bold text-emerald-600">
                                                {(() => {
                                                    const currentStock = stock.find(item =>
                                                        item.productId === productId && item.warehouseId === toWarehouseId
                                                    )?.quantity || 0;
                                                    return currentStock + Number(quantity);
                                                })()} unidades
                                            </span>
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <Button
                        onClick={handleTransfer}
                        disabled={!canSubmit || processing}
                        className="w-full h-12 text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 bg-[rgb(25,35,25)] hover:bg-[rgb(45,55,45)]"
                    >
                        {processing ? (
                            <span className="flex items-center gap-2">
                                <span className="animate-spin">⚙️</span>
                                Procesando traslado...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                📦 Realizar Traslado
                            </span>
                        )}
                    </Button>
                </div>
            </div>

            {/* Instructions / Info */}
            <div className="max-w-2xl mx-auto mt-8 space-y-6">
                <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-[rgb(230,225,220)]">
                    <div className="flex gap-4">
                        <div className="text-4xl">💡</div>
                        <div>
                            <h3 className="font-bold text-lg mb-2 text-[rgb(25,35,25)]">¿Cómo funciona?</h3>
                            <p className="text-[rgb(120,115,110)] leading-relaxed">
                                Al confirmar el traslado, el sistema verificará automáticamente si hay suficiente stock en el almacén de origen.
                                Si es exitoso, descontará las unidades del origen y las sumará al destino inmediatamente.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50/80 backdrop-blur-sm p-4 rounded-xl border border-blue-100">
                        <div className="font-bold text-blue-700 mb-1">📤 Origen</div>
                        <div className="text-sm text-blue-600">Las unidades se restan de este inventario.</div>
                    </div>
                    <div className="bg-emerald-50/80 backdrop-blur-sm p-4 rounded-xl border border-emerald-100">
                        <div className="font-bold text-emerald-700 mb-1">📥 Destino</div>
                        <div className="text-sm text-emerald-600">Las unidades se suman a este inventario.</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

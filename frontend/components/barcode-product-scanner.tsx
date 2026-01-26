'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { api, type Product, type StockRow, type Warehouse } from '@/lib/backend'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type StockByWarehouseRow = {
    warehouseId: string
    warehouseName: string
    quantity: number
}

type Props = {
    className?: string
}

export function BarcodeProductScanner({ className }: Props) {
    const [barcode, setBarcode] = useState('')
    const [loading, setLoading] = useState(false)
    const [product, setProduct] = useState<Product | null>(null)
    const [warehouses, setWarehouses] = useState<Warehouse[]>([])
    const [stockRows, setStockRows] = useState<StockRow[]>([])

    const [scanning, setScanning] = useState(false)
    const [cameraError, setCameraError] = useState<string | null>(null)

    const streamRef = useRef<MediaStream | null>(null)
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const rafRef = useRef<number | null>(null)

    const hasBarcodeDetector = useMemo(() => {
        return typeof window !== 'undefined' && typeof (window as any).BarcodeDetector !== 'undefined'
    }, [])

    const formatCurrency = (value: string | number) => {
        const num = typeof value === 'string' ? Number(value) : value
        const safe = Number.isFinite(num) ? num : 0
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(safe)
    }

    const totalStock = useMemo(() => {
        const byWarehouse = new Map<string, number>()
        for (const row of stockRows) {
            byWarehouse.set(row.warehouseId, (byWarehouse.get(row.warehouseId) ?? 0) + (row.quantity ?? 0))
        }
        return Array.from(byWarehouse.values()).reduce((acc, q) => acc + q, 0)
    }, [stockRows])

    const stockByWarehouse = useMemo<StockByWarehouseRow[]>(() => {
        const quantities = new Map<string, number>()
        for (const row of stockRows) {
            quantities.set(row.warehouseId, (quantities.get(row.warehouseId) ?? 0) + (row.quantity ?? 0))
        }
        return warehouses
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((w) => ({
                warehouseId: w.id,
                warehouseName: w.name,
                quantity: quantities.get(w.id) ?? 0,
            }))
    }, [stockRows, warehouses])

    const stopScan = useCallback(() => {
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current)
            rafRef.current = null
        }
        if (streamRef.current) {
            for (const track of streamRef.current.getTracks()) track.stop()
            streamRef.current = null
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null
        }
        setScanning(false)
    }, [])

    const startScan = async () => {
        setCameraError(null)
        setProduct(null)
        setStockRows([])

        if (!hasBarcodeDetector) {
            setCameraError('Tu navegador no soporta escaneo nativo (BarcodeDetector).')
            return
        }

        if (!navigator.mediaDevices?.getUserMedia) {
            setCameraError('Tu navegador no permite acceso a la cámara.')
            return
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            streamRef.current = stream

            const video = document.createElement('video')
            video.playsInline = true
            video.muted = true
            video.srcObject = stream
            videoRef.current = video

            await video.play()
            setScanning(true)

            const detector = new (window as any).BarcodeDetector({ formats: ['code_128', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'qr_code'] })
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')

            const tick = async () => {
                if (!videoRef.current || !ctx) return
                if (videoRef.current.readyState < 2) {
                    rafRef.current = requestAnimationFrame(tick)
                    return
                }

                canvas.width = videoRef.current.videoWidth
                canvas.height = videoRef.current.videoHeight
                ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)

                try {
                    const codes = await detector.detect(canvas)
                    const raw = codes?.[0]?.rawValue
                    if (raw) {
                        setBarcode(raw)
                        stopScan()
                        await fetchByBarcode(raw)
                        return
                    }
                } catch {
                }

                rafRef.current = requestAnimationFrame(tick)
            }

            rafRef.current = requestAnimationFrame(tick)
        } catch (e: any) {
            setCameraError(e?.message ?? 'No se pudo iniciar la cámara')
            stopScan()
        }
    }

    const fetchByBarcode = async (code?: string) => {
        const finalCode = (code ?? barcode).trim()
        if (!finalCode) {
            toast.error('Ingresa o escanea un código de barras')
            return
        }

        setLoading(true)
        try {
            const [ws, p] = await Promise.all([
                api.warehouses.list(),
                api.products.findByBarcode(finalCode),
            ])
            setWarehouses(ws)
            setProduct(p)

            const s = await api.inventory.stock({ productId: p.id })
            setStockRows(s)
        } catch (e: any) {
            setProduct(null)
            setStockRows([])
            toast.error(e?.message ?? 'No se pudo cargar el producto')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        return () => {
            stopScan()
        }
    }, [stopScan])

    return (
        <div className={className}>
            <Card className="border-[hsl(var(--border))]">
                <CardHeader>
                    <CardTitle style={{ fontFamily: 'var(--font-display)' }}>Escanear Producto</CardTitle>
                    <CardDescription>Escanea o escribe el código de barras para ver la información del producto y sus existencias.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-3 items-end">
                        <div className="md:col-span-2 space-y-2">
                            <Label className="text-sm font-medium">Código de barras</Label>
                            <Input
                                value={barcode}
                                onChange={(e) => setBarcode(e.target.value)}
                                placeholder="Escanea o escribe..."
                                className="h-11"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') fetchByBarcode()
                                }}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button className="h-11 flex-1" onClick={() => fetchByBarcode()} disabled={loading || scanning}>
                                {loading ? 'Buscando...' : 'Buscar'}
                            </Button>
                            <Button
                                variant="outline"
                                className="h-11"
                                onClick={() => (scanning ? stopScan() : startScan())}
                                disabled={loading}
                                title={!hasBarcodeDetector ? 'BarcodeDetector no disponible en este navegador' : undefined}
                            >
                                {scanning ? 'Detener' : 'Cámara'}
                            </Button>
                        </div>
                    </div>

                    {cameraError && (
                        <div className="text-sm text-red-600">{cameraError}</div>
                    )}

                    {product && (
                        <Card className="border-[hsl(var(--border))]">
                            <CardHeader>
                                <CardTitle className="text-xl" style={{ fontFamily: 'var(--font-display)' }}>{product.name}</CardTitle>
                                <CardDescription>
                                    {product.barcode ? `Código: ${product.barcode}` : ''}
                                    {product.sku ? ` · SKU: ${product.sku}` : ''}
                                    {` · Total: ${totalStock} unidades`}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-1">
                                        <div className="text-xs text-[hsl(var(--muted))] uppercase tracking-widest">Precio</div>
                                        <div className="text-2xl font-black">{formatCurrency(product.salePrice)}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-xs text-[hsl(var(--muted))] uppercase tracking-widest">Descripción</div>
                                        <div className="text-sm text-[hsl(var(--foreground))]">
                                            {product.description || 'Sin descripción'}
                                        </div>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-[hsl(var(--background))] border-b border-[hsl(var(--border))]">
                                                <th className="px-4 py-3 text-left text-xs font-black text-[hsl(var(--muted))] uppercase tracking-widest">Almacén</th>
                                                <th className="px-4 py-3 text-right text-xs font-black text-[hsl(var(--muted))] uppercase tracking-widest">Cantidad</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[hsl(var(--border))]">
                                            {stockByWarehouse.map((r) => (
                                                <tr key={r.warehouseId}>
                                                    <td className="px-4 py-3 text-sm font-medium">{r.warehouseName}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <span className={
                                                            r.quantity > 10
                                                                ? 'inline-flex min-w-[3rem] justify-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 text-sm font-black'
                                                                : r.quantity > 0
                                                                    ? 'inline-flex min-w-[3rem] justify-center rounded-lg bg-amber-50 text-amber-700 border border-amber-100 px-3 py-1 text-sm font-black'
                                                                    : 'inline-flex min-w-[3rem] justify-center rounded-lg bg-red-50 text-red-700 border border-red-100 px-3 py-1 text-sm font-black'
                                                        }>
                                                            {r.quantity}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

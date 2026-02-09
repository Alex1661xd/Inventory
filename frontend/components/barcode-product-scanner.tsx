'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { NotFoundException } from '@zxing/library'
import { api, type Product, type StockRow, type Warehouse } from '@/lib/backend'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ImageSlider } from '@/components/ui/image-slider'
import { cn } from '@/lib/utils'

type StockByWarehouseRow = {
    warehouseId: string
    warehouseName: string
    quantity: number
}

type Props = {
    className?: string
    onScan?: (code: string) => void
}

export function BarcodeProductScanner({ className, onScan }: Props) {
    const [barcode, setBarcode] = useState('')
    const [loading, setLoading] = useState(false)
    const [product, setProduct] = useState<Product | null>(null)
    const [warehouses, setWarehouses] = useState<Warehouse[]>([])
    const [stockRows, setStockRows] = useState<StockRow[]>([])

    const [scanning, setScanning] = useState(false)
    const [cameraError, setCameraError] = useState<string | null>(null)
    const [scanMethod, setScanMethod] = useState<'zxing' | 'native'>('zxing')

    const streamRef = useRef<MediaStream | null>(null)
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const scannerControlsRef = useRef<any | null>(null)

    const [showProductModal, setShowProductModal] = useState(false)

    // Check if we're on HTTPS or localhost
    const isSecureContext = useMemo(() => {
        if (typeof window === 'undefined') return false
        return window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    }, [])

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
        // Stop ZXing scanner controls
        if (scannerControlsRef.current) {
            try {
                scannerControlsRef.current.stop()
            } catch (e) {
                console.error('Error stopping ZXing scanner:', e)
            }
            scannerControlsRef.current = null
        }

        // Stop media stream
        if (streamRef.current) {
            for (const track of streamRef.current.getTracks()) {
                track.stop()
            }
            streamRef.current = null
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null
        }

        setScanning(false)
    }, [])

    const startScanWithZXing = async () => {
        setCameraError(null)
        setProduct(null)
        setStockRows([])

        if (!isSecureContext) {
            setCameraError('⚠️ Se requiere HTTPS para acceder a la cámara. Por favor, accede desde https:// o localhost.')
            return
        }

        if (!navigator.mediaDevices?.getUserMedia) {
            setCameraError('Tu navegador no permite acceso a la cámara.')
            return
        }

        // First set scanning to true so the video element is rendered
        setScanning(true)

        // Wait for next render cycle to ensure video element exists
        await new Promise(resolve => setTimeout(resolve, 100))

        try {
            const codeReader = new BrowserMultiFormatReader()

            // Get video devices
            const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices()

            if (videoInputDevices.length === 0) {
                setCameraError('No se encontraron cámaras disponibles.')
                setScanning(false)
                return
            }

            // Try to use back camera on mobile
            const backCamera = videoInputDevices.find((device: MediaDeviceInfo) =>
                device.label.toLowerCase().includes('back') ||
                device.label.toLowerCase().includes('trasera') ||
                device.label.toLowerCase().includes('rear')
            )

            const selectedDeviceId = backCamera?.deviceId || videoInputDevices[0].deviceId

            // Make sure video element is available
            if (!videoRef.current) {
                setCameraError('Error: elemento de video no disponible.')
                setScanning(false)
                return
            }

            // Start decoding from video device and store the scanner controls
            const controls = await codeReader.decodeFromVideoDevice(
                selectedDeviceId,
                videoRef.current,
                (result, error) => {
                    if (result) {
                        const code = result.getText()
                        setBarcode(code)
                        stopScan()
                        if (onScan) {
                            onScan(code)
                        } else {
                            fetchByBarcode(code)
                        }
                    }
                    // Ignore NotFoundException - it just means no barcode was found in this frame
                    if (error && !(error instanceof NotFoundException)) {
                        console.error('Scan error:', error)
                    }
                }
            )

            // Store the scanner controls so we can stop it later
            scannerControlsRef.current = controls

            // Store the stream reference
            if (videoRef.current?.srcObject) {
                streamRef.current = videoRef.current.srcObject as MediaStream
            }

        } catch (e: any) {
            console.error('Camera error:', e)
            let errorMessage = 'No se pudo iniciar la cámara.'

            if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
                errorMessage = '❌ Permiso de cámara denegado. Por favor, permite el acceso a la cámara en la configuración de tu navegador.'
            } else if (e.name === 'NotFoundError' || e.name === 'DevicesNotFoundError') {
                errorMessage = '❌ No se encontró ninguna cámara en tu dispositivo.'
            } else if (e.name === 'NotReadableError' || e.name === 'TrackStartError') {
                errorMessage = '❌ La cámara está siendo usada por otra aplicación.'
            } else if (e.name === 'OverconstrainedError') {
                errorMessage = '❌ No se pudo acceder a la cámara trasera. Intentando con otra cámara...'
            } else if (e.name === 'NotSupportedError') {
                errorMessage = '❌ Tu navegador no soporta acceso a la cámara.'
            } else if (e.message) {
                errorMessage = `❌ ${e.message}`
            }

            setCameraError(errorMessage)
            stopScan()
        }
    }

    const startScan = async () => {
        // Always use ZXing as it's more compatible
        await startScanWithZXing()
    }

    const fetchByBarcode = async (code?: string) => {
        const finalCode = (code ?? barcode).trim()
        if (!finalCode) {
            toast.error('Ingresa o escanea un código de barras')
            return
        }

        setLoading(true)
        setShowProductModal(false)
        try {
            const [ws, simplifiedProduct] = await Promise.all([
                api.warehouses.list(),
                api.products.findByBarcode(finalCode),
            ])
            setWarehouses(ws)

            // Get full details to have all images
            const p = await api.products.get(simplifiedProduct.id, true)
            setProduct(p)

            const s = await api.inventory.stock({ productId: p.id })
            setStockRows(s)
            setShowProductModal(true)
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

    // GLOBAL BARCODE LISTENER (USB/Bluetooth Scanners)
    useEffect(() => {
        let buffer = ''
        let lastKeyTime = Date.now()

        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            // Ignore if user is typing in an input field
            const target = e.target as HTMLElement
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                return
            }

            const currentTime = Date.now()

            // If time between keystrokes is too long (>100ms), it's likely manual typing
            if (currentTime - lastKeyTime > 100) {
                buffer = ''
            }

            lastKeyTime = currentTime

            if (e.key === 'Enter') {
                if (buffer.length > 2) {
                    e.preventDefault()
                    if (onScan) {
                        onScan(buffer)
                    } else {
                        fetchByBarcode(buffer)
                    }
                    buffer = ''
                }
            } else if (e.key.length === 1) {
                buffer += e.key
            }
        }

        window.addEventListener('keydown', handleGlobalKeyDown)
        return () => window.removeEventListener('keydown', handleGlobalKeyDown)
    }, [onScan, fetchByBarcode])

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
                                    if (e.key === 'Enter') {
                                        if (onScan) {
                                            onScan(barcode)
                                        } else {
                                            fetchByBarcode()
                                        }
                                    }
                                }}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button className="h-11 flex-1" onClick={() => onScan ? onScan(barcode) : fetchByBarcode()} disabled={loading}>
                                {loading ? 'Buscando...' : 'Buscar'}
                            </Button>
                            <Button
                                variant="outline"
                                className="h-11"
                                onClick={() => startScan()}
                                disabled={loading || scanning}
                                title={!hasBarcodeDetector ? 'BarcodeDetector no disponible en este navegador' : undefined}
                            >
                                📷 Cámara
                            </Button>
                        </div>
                    </div>

                    {cameraError && (
                        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{cameraError}</div>
                    )}
                </CardContent>
            </Card>

            {/* Scanner Modal */}
            {scanning && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
                    <div className="relative w-full max-w-lg bg-black rounded-3xl overflow-hidden shadow-2xl animate-scale-in">
                        <div className="absolute top-4 right-4 z-10">
                            <Button
                                variant="destructive"
                                size="icon"
                                onClick={stopScan}
                                className="rounded-full h-10 w-10 shadow-lg"
                            >
                                ✕
                            </Button>
                        </div>
                        <video
                            ref={videoRef}
                            className="w-full aspect-[4/3] object-cover"
                            playsInline
                            muted
                        />
                        <div className="absolute bottom-6 left-0 right-0 text-center">
                            <span className="bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                                Encuadra el código de barras
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {showProductModal && product && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowProductModal(false)}>
                    <Card className="w-full max-w-2xl relative z-10 animate-scale-in max-h-[90vh] flex flex-col border-[hsl(var(--border))]" onClick={(e) => e.stopPropagation()}>
                        <CardHeader className="shrink-0 border-b border-[hsl(var(--border))] flex flex-row items-center justify-between bg-[hsl(var(--background))] rounded-t-xl py-4">
                            <div>
                                <CardTitle className="text-xl" style={{ fontFamily: 'var(--font-display)' }}>Detalles del Producto</CardTitle>
                                <CardDescription>Información detallada y existencias</CardDescription>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setShowProductModal(false)} className="rounded-full">✕</Button>
                        </CardHeader>

                        <CardContent className="p-6 overflow-y-auto custom-scrollbar flex-grow space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Image Section */}
                                <div className="aspect-square rounded-2xl overflow-hidden border border-[hsl(var(--border))] shadow-inner flex items-center justify-center bg-[hsl(var(--muted))/0.1] relative group">
                                    <ImageSlider
                                        images={product.images && product.images.length > 0 ? product.images : (product.imageUrl ? [product.imageUrl] : [])}
                                        name={product.name}
                                        className="w-full h-full"
                                        imageClassName="object-contain" // Contain to show the full image
                                        allowZoom={true}
                                        showControls={true}
                                    />
                                    <div className="absolute top-2 right-2 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="bg-black/60 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm">🔍 Toca para ampliar</span>
                                    </div>
                                </div>

                                {/* Info Section */}
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-bold leading-tight">{product.name}</h3>
                                    <div className="space-y-1">
                                        <div className="text-xs text-[hsl(var(--muted))] uppercase tracking-widest font-bold">Código / SKU</div>
                                        <div className="flex gap-2 text-sm">
                                            {product.barcode && <span className="bg-stone-100 px-2 py-1 rounded font-mono text-xs">{product.barcode}</span>}
                                            {product.sku && <span className="bg-stone-100 px-2 py-1 rounded font-mono text-xs">{product.sku}</span>}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="text-xs text-[hsl(var(--muted))] uppercase tracking-widest font-bold">Precio</div>
                                        <div className="text-3xl font-black text-[hsl(var(--primary))]">{formatCurrency(product.salePrice)}</div>
                                    </div>

                                    <div className="p-4 bg-[hsl(var(--foreground))] text-[hsl(var(--background))] rounded-xl flex items-center justify-between shadow-lg">
                                        <span className="text-sm font-medium">Stock Total</span>
                                        <span className="text-2xl font-black">{totalStock}</span>
                                    </div>
                                </div>
                            </div>

                            {product.description && (
                                <div className="space-y-2">
                                    <div className="text-xs text-[hsl(var(--muted))] uppercase tracking-widest font-bold">Descripción</div>
                                    <div className="text-sm p-4 bg-stone-50 rounded-xl leading-relaxed text-gray-700">
                                        {product.description}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                <div className="text-xs text-[hsl(var(--muted))] uppercase tracking-widest font-bold">Disponibilidad por Almacén</div>
                                <div className="overflow-hidden rounded-xl border border-[hsl(var(--border))]">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-stone-50 border-b border-[hsl(var(--border))]">
                                                <th className="px-4 py-3 text-left text-[10px] font-black text-[hsl(var(--muted))] uppercase tracking-widest">Almacén</th>
                                                <th className="px-4 py-3 text-right text-[10px] font-black text-[hsl(var(--muted))] uppercase tracking-widest">Cant.</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[hsl(var(--border))] bg-white">
                                            {stockByWarehouse.map((r) => (
                                                <tr key={r.warehouseId} className="hover:bg-stone-50/50 transition-colors">
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{r.warehouseName}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <span className={cn(
                                                            "inline-flex min-w-[3rem] justify-center rounded-lg px-3 py-1 text-xs font-black",
                                                            r.quantity > 5
                                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                                                : r.quantity > 0
                                                                    ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                                                    : 'bg-red-50 text-red-700 border border-red-100'
                                                        )}>
                                                            {r.quantity}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {stockByWarehouse.length === 0 && (
                                                <tr>
                                                    <td colSpan={2} className="px-4 py-8 text-center text-sm text-[hsl(var(--muted))] italic">
                                                        No hay información de stock disponible
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}

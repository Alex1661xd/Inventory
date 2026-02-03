'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api, type Product } from '@/lib/backend'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from 'sonner'
import { CustomerSelector } from '@/components/customer-selector'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Scan, X, Plus, Minus, Trash2, ChevronLeft, ChevronRight, Pause, Play, UserPlus, Camera } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { NotFoundException } from '@zxing/library'
import { Label } from '@/components/ui/label'

interface CartItem extends Product {
    quantity: number
}

interface Customer {
    id: string
    name: string
    docNumber?: string
}

// Scanner Modal Component with Camera Support
function ScannerModal(props: {
    onClose: () => void;
    onScan: (code: string) => void;
    scanning: boolean;
    setScanning: (b: boolean) => void;
    cameraError: string | null;
    setCameraError: (e: string | null) => void;
    barcodeInput: string;
    setBarcodeInput: (s: string) => void;
    videoRef: React.RefObject<HTMLVideoElement | null>;
    streamRef: React.MutableRefObject<MediaStream | null>;
    scannerControlsRef: React.MutableRefObject<any | null>;
}) {
    const {
        onClose,
        onScan,
        scanning,
        setScanning,
        cameraError,
        setCameraError,
        barcodeInput,
        setBarcodeInput,
        videoRef,
        streamRef,
        scannerControlsRef,
    } = props;

    const isSecureContext = useMemo(() => {
        if (typeof window === 'undefined') return false
        return window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    }, [])

    const stopScan = useCallback(() => {
        if (scannerControlsRef.current) {
            try {
                scannerControlsRef.current.stop()
            } catch (e) {
                console.error('Error stopping ZXing scanner:', e)
            }
            scannerControlsRef.current = null
        }

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
    }, [scannerControlsRef, streamRef, videoRef, setScanning])

    const startScan = async () => {
        setCameraError(null)

        if (!isSecureContext) {
            setCameraError('⚠️ Se requiere HTTPS para acceder a la cámara. Por favor, accede desde https:// o localhost.')
            return
        }

        if (!navigator.mediaDevices?.getUserMedia) {
            setCameraError('Tu navegador no permite acceso a la cámara.')
            return
        }

        setScanning(true)

        await new Promise(resolve => setTimeout(resolve, 100))

        try {
            const codeReader = new BrowserMultiFormatReader()
            const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices()

            if (videoInputDevices.length === 0) {
                setCameraError('No se encontraron cámaras disponibles.')
                setScanning(false)
                return
            }

            const backCamera = videoInputDevices.find((device: MediaDeviceInfo) =>
                device.label.toLowerCase().includes('back') ||
                device.label.toLowerCase().includes('trasera') ||
                device.label.toLowerCase().includes('rear')
            )

            const selectedDeviceId = backCamera?.deviceId || videoInputDevices[0].deviceId

            if (!videoRef.current) {
                setCameraError('Error: elemento de video no disponible.')
                setScanning(false)
                return
            }

            const controls = await codeReader.decodeFromVideoDevice(
                selectedDeviceId,
                videoRef.current,
                (result, error) => {
                    if (result) {
                        const code = result.getText()
                        stopScan()
                        onScan(code)
                        onClose()
                    }
                    if (error && !(error instanceof NotFoundException)) {
                        console.error('Scan error:', error)
                    }
                }
            )

            scannerControlsRef.current = controls

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
                errorMessage = '❌ No se pudo acceder a la cámara trasera.'
            } else if (e.name === 'NotSupportedError') {
                errorMessage = '❌ Tu navegador no soporta acceso a la cámara.'
            } else if (e.message) {
                errorMessage = `❌ ${e.message}`
            }

            setCameraError(errorMessage)
            stopScan()
        }
    }

    useEffect(() => {
        return () => {
            stopScan()
        }
    }, [stopScan])

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-black/50">
                <h3 className="text-lg font-bold text-white">Escanear Producto</h3>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                        stopScan()
                        onClose()
                    }}
                    className="text-white hover:bg-white/20"
                >
                    <X className="h-6 w-6" />
                </Button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
                {scanning ? (
                    <div className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl">
                        <video
                            ref={videoRef}
                            className="w-full aspect-[4/3] object-cover bg-gray-900"
                            playsInline
                            muted
                        />
                        <div className="absolute bottom-4 left-0 right-0 text-center">
                            <span className="bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                                Encuadra el código de barras
                            </span>
                        </div>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={stopScan}
                            className="absolute top-4 right-4"
                        >
                            Detener
                        </Button>
                    </div>
                ) : (
                    <Card className="w-full max-w-md">
                        <CardContent className="p-6 space-y-4">
                            {cameraError && (
                                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                                    {cameraError}
                                </div>
                            )}

                            <div className="text-center space-y-4">
                                <div className="text-6xl">📷</div>
                                <p className="text-gray-500 text-sm">
                                    Usa la cámara para escanear el código de barras del producto
                                </p>
                                <Button
                                    size="lg"
                                    className="w-full h-14"
                                    onClick={startScan}
                                >
                                    <Camera className="mr-2 h-5 w-5" />
                                    Abrir Cámara
                                </Button>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white px-2 text-gray-500">
                                        o ingresa manualmente
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Código de barras</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Ingresa el código..."
                                        value={barcodeInput}
                                        onChange={(e) => setBarcodeInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && barcodeInput.trim()) {
                                                onScan(barcodeInput.trim())
                                                setBarcodeInput('')
                                                onClose()
                                            }
                                        }}
                                        className="flex-1"
                                    />
                                    <Button
                                        onClick={() => {
                                            if (barcodeInput.trim()) {
                                                onScan(barcodeInput.trim())
                                                setBarcodeInput('')
                                                onClose()
                                            }
                                        }}
                                        disabled={!barcodeInput.trim()}
                                    >
                                        Buscar
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}

function POSMobileView(props: {
    mobileStep: number;
    setMobileStep: (n: number) => void;
    selectedCustomer: Customer | null;
    setSelectedCustomer: (c: Customer | null) => void;
    cart: CartItem[];
    grandTotal: number;
    search: string;
    setSearch: (s: string) => void;
    filteredProducts: Product[];
    addToCart: (p: Product) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    pauseSale: () => void;
    processing: boolean;
    canProceedToStep2: boolean;
    canProceedToStep3: boolean;
    setShowScanner: (b: boolean) => void;
    handleCheckout: () => void;
    paymentMethod: 'CASH' | 'CARD' | 'TRANSFER' | 'OTHER';
    setPaymentMethod: (m: 'CASH' | 'CARD' | 'TRANSFER' | 'OTHER') => void;
    onCreateNewCustomer: () => void;
}) {
    const {
        mobileStep,
        setMobileStep,
        selectedCustomer,
        setSelectedCustomer,
        cart,
        grandTotal,
        search,
        setSearch,
        filteredProducts,
        addToCart,
        removeFromCart,
        updateQuantity,
        pauseSale,
        processing,
        canProceedToStep2,
        canProceedToStep3,
        setShowScanner,
        handleCheckout,
        paymentMethod,
        setPaymentMethod,
        onCreateNewCustomer,
    } = props;

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] bg-gray-50">
            {/* Progress Steps */}
            <div className="bg-white border-b px-4 py-3 flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                    {[1, 2, 3].map((step) => (
                        <div key={step} className="flex items-center flex-1">
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors",
                                mobileStep >= step ? "bg-primary text-white" : "bg-gray-200 text-gray-500"
                            )}>
                                {step}
                            </div>
                            {step < 3 && (
                                <div className={cn(
                                    "flex-1 h-1 mx-2 rounded transition-colors",
                                    mobileStep > step ? "bg-primary" : "bg-gray-200"
                                )} />
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                    <span>Cliente</span>
                    <span>Productos</span>
                    <span>Pago</span>
                </div>
            </div>

            {/* Step Content */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 pb-24">
                {mobileStep === 1 && (
                    <div className="space-y-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Seleccionar Cliente</CardTitle>
                                <CardDescription>Elige un cliente existente o crea uno nuevo</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-0">
                                <CustomerSelector onSelect={setSelectedCustomer} />

                                {/* Botón visible para crear cliente en móvil */}
                                <Button
                                    variant="outline"
                                    className="w-full h-11 border-dashed border-2 text-gray-500 hover:text-gray-900 hover:border-primary"
                                    onClick={onCreateNewCustomer}
                                >
                                    <UserPlus className="h-5 w-5 mr-2" />
                                    Crear Nuevo Cliente
                                </Button>
                            </CardContent>
                        </Card>

                        {selectedCustomer && (
                            <Card className="bg-emerald-50 border-emerald-200">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3 text-emerald-700">
                                        <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xl">✓</div>
                                        <div>
                                            <div className="font-bold">{selectedCustomer.name}</div>
                                            {selectedCustomer.docNumber && (
                                                <div className="text-sm opacity-80">{selectedCustomer.docNumber}</div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {mobileStep === 2 && (
                    <div className="space-y-4">
                        {/* Search */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Buscar producto..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="flex-1"
                                    />
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setShowScanner(true)}
                                        className="h-10 w-10"
                                    >
                                        <Camera className="h-5 w-5" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Cart Summary */}
                        {cart.length > 0 && (
                            <Card className="bg-primary text-white">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="text-sm opacity-90">{cart.length} producto(s)</div>
                                            <div className="text-2xl font-bold">${grandTotal.toLocaleString()}</div>
                                        </div>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={pauseSale}
                                            disabled={processing}
                                        >
                                            <Pause className="h-4 w-4 mr-1" />
                                            Pausar
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Products List */}
                        <div className="space-y-2">
                            {filteredProducts.map(product => (
                                <Card key={product.id} className="overflow-hidden">
                                    <CardContent className="p-3">
                                        <div className="flex gap-3">
                                            <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                {product.images?.[0] ? (
                                                    <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-2xl">📦</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm">{product.name}</div>
                                                <div className="text-xs text-gray-500">{product.barcode}</div>
                                                <div className="font-bold text-primary mt-1">
                                                    ${Number(product.salePrice).toLocaleString()}
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                onClick={() => addToCart(product)}
                                                className="self-center"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        {cart.find(item => item.id === product.id) && (
                                            <div className="mt-3 pt-3 border-t flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            const item = cart.find(i => i.id === product.id)
                                                            if (item) updateQuantity(product.id, item.quantity - 1)
                                                        }}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </Button>
                                                    <span className="w-12 text-center font-semibold">
                                                        {cart.find(item => item.id === product.id)?.quantity}
                                                    </span>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            const item = cart.find(i => i.id === product.id)
                                                            if (item) updateQuantity(product.id, item.quantity + 1)
                                                        }}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeFromCart(product.id)}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {mobileStep === 3 && (
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Resumen de Venta</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Customer */}
                                <div className="p-3 bg-gray-50 rounded">
                                    <div className="text-xs text-gray-500 mb-1">Cliente</div>
                                    <div className="font-medium">{selectedCustomer?.name}</div>
                                </div>

                                {/* Items */}
                                <div>
                                    <div className="text-xs text-gray-500 mb-2">Productos ({cart.length})</div>
                                    <div className="space-y-2">
                                        {cart.map(item => (
                                            <div key={item.id} className="flex justify-between text-sm">
                                                <span>{item.quantity}x {item.name}</span>
                                                <span className="font-semibold">
                                                    ${(Number(item.salePrice) * item.quantity).toLocaleString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="pt-3 border-t">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-semibold">TOTAL</span>
                                        <span className="text-3xl font-bold text-primary">
                                            ${grandTotal.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div>
                                    <div className="text-sm font-medium mb-2">Método de Pago</div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { value: 'CASH', label: 'Efectivo', icon: '💵' },
                                            { value: 'CARD', label: 'Tarjeta', icon: '💳' },
                                            { value: 'TRANSFER', label: 'Transferencia', icon: '📱' },
                                            { value: 'OTHER', label: 'Otro', icon: '📝' }
                                        ].map(method => (
                                            <Button
                                                key={method.value}
                                                variant={paymentMethod === method.value ? 'default' : 'outline'}
                                                onClick={() => setPaymentMethod(method.value as any)}
                                                className="h-16 flex flex-col gap-1"
                                            >
                                                <span className="text-2xl">{method.icon}</span>
                                                <span className="text-xs">{method.label}</span>
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            {/* Bottom Navigation - Fixed */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 shadow-lg z-40 safe-area-inset-bottom">
                <div className="flex gap-2">
                    {mobileStep > 1 && (
                        <Button
                            variant="outline"
                            size="lg"
                            className="flex-shrink-0"
                            onClick={() => setMobileStep(mobileStep - 1)}
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    )}

                    {mobileStep === 3 ? (
                        <Button
                            size="lg"
                            className="flex-1 h-12 text-base font-bold"
                            onClick={handleCheckout}
                            disabled={processing}
                        >
                            {processing ? 'Procesando...' : 'CONFIRMAR VENTA'}
                        </Button>
                    ) : (
                        <Button
                            size="lg"
                            className="flex-1 h-12 text-base font-bold"
                            onClick={() => setMobileStep(mobileStep + 1)}
                            disabled={
                                (mobileStep === 1 && !canProceedToStep2) ||
                                (mobileStep === 2 && !canProceedToStep3)
                            }
                        >
                            Continuar
                            <ChevronRight className="ml-2 h-5 w-5" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}

function POSDesktopView(props: {
    loading: boolean;
    filteredProducts: Product[];
    search: string;
    setSearch: (s: string) => void;
    setShowScanner: (b: boolean) => void;
    goToSales: () => void;
    addToCart: (p: Product) => void;
    cart: CartItem[];
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    grandTotal: number;
    selectedCustomer: Customer | null;
    setSelectedCustomer: (c: Customer | null) => void;
    pauseSale: () => void;
    processing: boolean;
    setIsCheckoutOpen: (b: boolean) => void;
}) {
    const {
        loading,
        filteredProducts,
        search,
        setSearch,
        setShowScanner,
        goToSales,
        addToCart,
        cart,
        removeFromCart,
        updateQuantity,
        grandTotal,
        selectedCustomer,
        setSelectedCustomer,
        pauseSale,
        processing,
        setIsCheckoutOpen,
    } = props;

    return (
        <div className="h-[calc(100vh-80px)] flex gap-4">
            {/* Left: Products List */}
            <div className="flex-1 flex flex-col bg-white rounded-lg shadow-sm border overflow-hidden">
                {/* Search Header */}
                <div className="p-4 border-b bg-gray-50 space-y-3">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Buscar por nombre, código o SKU..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1 h-11"
                        />
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => setShowScanner(true)}
                            className="px-4"
                        >
                            <Scan className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="secondary"
                            size="lg"
                            onClick={goToSales}
                            className="px-4"
                        >
                            <Play className="h-5 w-5 mr-2" />
                            Pendientes
                        </Button>
                    </div>
                </div>

                {/* Products Table */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            Cargando productos...
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            No se encontraron productos
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr className="border-b">
                                    <th className="text-left p-3 font-semibold text-sm">Producto</th>
                                    <th className="text-left p-3 font-semibold text-sm hidden sm:table-cell">SKU</th>
                                    <th className="text-right p-3 font-semibold text-sm">Precio</th>
                                    <th className="w-24"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map(product => (
                                    <tr
                                        key={product.id}
                                        className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={() => addToCart(product)}
                                    >
                                        <td className="p-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                    {product.images?.[0] ? (
                                                        <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-lg">📦</span>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-medium text-sm">{product.name}</div>
                                                    <div className="text-xs text-gray-500 truncate">{product.barcode}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3 text-sm text-gray-500 hidden sm:table-cell">
                                            {product.sku || '-'}
                                        </td>
                                        <td className="p-3 text-right font-semibold text-sm">
                                            ${Number(product.salePrice).toLocaleString()}
                                        </td>
                                        <td className="p-3">
                                            <Button
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    addToCart(product)
                                                }}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Right: Cart */}
            <div className="w-96 flex flex-col bg-white rounded-lg shadow-lg border overflow-hidden">
                {/* Cart Header */}
                <div className="p-4 border-b bg-gray-50">
                    <h2 className="font-bold text-lg mb-3">Venta Actual</h2>
                    <CustomerSelector onSelect={setSelectedCustomer} />
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <div className="text-5xl mb-2">🛒</div>
                            <p className="text-sm">Carrito vacío</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1 min-w-0 pr-2">
                                        <div className="font-medium text-sm">{item.name}</div>
                                        <div className="text-xs text-gray-500">
                                            ${Number(item.salePrice).toLocaleString()} c/u
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="h-8 w-8 p-0"
                                        >
                                            <Minus className="h-3 w-3" />
                                        </Button>
                                        <span className="w-12 text-center font-semibold">{item.quantity}</span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="h-8 w-8 p-0"
                                        >
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </div>
                                    <div className="font-bold">
                                        ${(Number(item.salePrice) * item.quantity).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Cart Footer */}
                <div className="border-t bg-gray-50 p-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">TOTAL:</span>
                        <span className="text-3xl font-bold text-primary">
                            ${grandTotal.toLocaleString()}
                        </span>
                    </div>
                    <Button
                        size="lg"
                        className="w-full h-14 text-lg font-bold"
                        disabled={cart.length === 0 || !selectedCustomer}
                        onClick={() => setIsCheckoutOpen(true)}
                    >
                        COBRAR
                    </Button>
                    {cart.length > 0 && (
                        <Button
                            variant="secondary"
                            size="lg"
                            className="w-full"
                            onClick={pauseSale}
                            disabled={processing}
                        >
                            <Pause className="mr-2 h-5 w-5" />
                            Pausar Venta
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function POSPage() {
    const searchParams = useSearchParams()
    const router = useRouter()

    const resumeId = searchParams.get('resume')

    const [products, setProducts] = useState<Product[]>([])
    const [cart, setCart] = useState<CartItem[]>([])
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
    const [processing, setProcessing] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'TRANSFER' | 'OTHER'>('CASH')
    const [warehouseId, setWarehouseId] = useState<string>('')
    const [showScanner, setShowScanner] = useState(false)

    // Mobile stepper state
    const [mobileStep, setMobileStep] = useState(1) // 1: Cliente, 2: Productos, 3: Pago

    // Resume sale state
    const [resumedSaleId, setResumedSaleId] = useState<string | null>(null)

    const [isMobile, setIsMobile] = useState<boolean | null>(null)

    // Create new customer modal state
    const [showCreateCustomer, setShowCreateCustomer] = useState(false)
    const [newCustomerName, setNewCustomerName] = useState('')
    const [newCustomerDoc, setNewCustomerDoc] = useState('')
    const [creatingCustomer, setCreatingCustomer] = useState(false)

    // Camera scanner state
    const [scanning, setScanning] = useState(false)
    const [cameraError, setCameraError] = useState<string | null>(null)
    const [barcodeInput, setBarcodeInput] = useState('')
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const scannerControlsRef = useRef<any | null>(null)

    useEffect(() => {
        const mql = window.matchMedia('(max-width: 767px)')
        const onChange = () => setIsMobile(mql.matches)
        onChange()
        mql.addEventListener('change', onChange)
        return () => mql.removeEventListener('change', onChange)
    }, [])

    useEffect(() => {
        loadData()
    }, [])

    useEffect(() => {
        if (resumeId) {
            loadResumedSale(resumeId)
        }
    }, [resumeId])

    const loadData = async () => {
        setLoading(true)
        try {
            const [prods, warehouses] = await Promise.all([
                api.products.list(),
                api.warehouses.list()
            ])
            setProducts(prods)
            if (warehouses.length > 0) {
                setWarehouseId(warehouses[0].id)
            } else {
                toast.error('No hay almacenes registrados')
            }
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    const loadResumedSale = async (id: string) => {
        try {
            const invoice = await api.invoices.get(id)
            if (invoice) {
                setResumedSaleId(invoice.id)
                if (invoice.customer) setSelectedCustomer(invoice.customer)

                const cartItems = invoice.items.map((item: any) => ({
                    ...item.product,
                    quantity: item.quantity,
                    salePrice: item.unitPrice
                }))
                setCart(cartItems)

                setMobileStep(2) // Jump to products step
                toast.success('Venta reanudada desde la base de datos')
            }
        } catch (e) {
            console.error(e)
            toast.error('Error cargando la venta pendiente')
        }
    }

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id)
            if (existing) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            }
            return [...prev, { ...product, quantity: 1 }]
        })
    }

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(item => item.id !== id))
    }

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(id)
            return
        }
        setCart(prev => prev.map(item =>
            item.id === id ? { ...item, quantity } : item
        ))
    }

    const grandTotal = cart.reduce((acc, item) => acc + (Number(item.salePrice) * item.quantity), 0)

    const handleScan = (code: string) => {
        const found = products.find(p => p.barcode === code)
        if (found) {
            addToCart(found)
            setShowScanner(false)
            toast.success(`${found.name} agregado`)
        } else {
            toast.error(`Producto no encontrado: ${code}`)
        }
    }

    const pauseSale = async () => {
        if (cart.length === 0) {
            toast.error('El carrito está vacío')
            return
        }

        if (!warehouseId) {
            toast.error('No hay almacén seleccionado')
            return
        }

        setProcessing(true)
        try {
            // Create a NEW pending invoice
            await api.invoices.create({
                total: grandTotal,
                status: 'PENDING',
                paymentMethod: 'CASH', // Default for pending
                customerId: selectedCustomer?.id,
                warehouseId,
                items: cart.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    unitPrice: Number(item.salePrice)
                }))
            })

            // If we were resuming an old one, cancel it
            if (resumedSaleId) {
                await api.invoices.cancel(resumedSaleId)
            }

            toast.success('Venta pausada y guardada en la nube ☁️')

            // Reset
            setCart([])
            setSelectedCustomer(null)
            setResumedSaleId(null)
            setMobileStep(1)
            router.push('/sales') // Redirect to history to see it
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setProcessing(false)
        }
    }

    const handleCheckout = async () => {
        if (!selectedCustomer) {
            toast.error('Debes seleccionar un cliente')
            return
        }
        if (!warehouseId) {
            toast.error('No hay almacén seleccionado')
            return
        }

        setProcessing(true)
        try {
            // Create the FINAL paid invoice
            await api.invoices.create({
                total: grandTotal,
                status: 'PAID',
                paymentMethod,
                customerId: selectedCustomer.id,
                warehouseId,
                items: cart.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    unitPrice: Number(item.salePrice)
                }))
            })

            // If we resumed a pending sale, cancel the pending one
            if (resumedSaleId) {
                await api.invoices.cancel(resumedSaleId)
            }

            toast.success('Venta registrada exitosamente')
            setCart([])
            setSelectedCustomer(null)
            setResumedSaleId(null)
            setIsCheckoutOpen(false)
            setMobileStep(1)
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setProcessing(false)
        }
    }

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode?.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase())
    )

    const canProceedToStep2 = selectedCustomer !== null
    const canProceedToStep3 = cart.length > 0

    if (isMobile === null) {
        return null
    }

    return (
        <>
            {isMobile ? (
                <POSMobileView
                    mobileStep={mobileStep}
                    setMobileStep={setMobileStep}
                    selectedCustomer={selectedCustomer}
                    setSelectedCustomer={setSelectedCustomer}
                    cart={cart}
                    grandTotal={grandTotal}
                    search={search}
                    setSearch={setSearch}
                    filteredProducts={filteredProducts}
                    addToCart={addToCart}
                    removeFromCart={removeFromCart}
                    updateQuantity={updateQuantity}
                    pauseSale={pauseSale}
                    processing={processing}
                    canProceedToStep2={canProceedToStep2}
                    canProceedToStep3={canProceedToStep3}
                    setShowScanner={setShowScanner}
                    handleCheckout={handleCheckout}
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                    onCreateNewCustomer={() => setShowCreateCustomer(true)}
                />
            ) : (
                <POSDesktopView
                    loading={loading}
                    filteredProducts={filteredProducts}
                    search={search}
                    setSearch={setSearch}
                    setShowScanner={setShowScanner}
                    goToSales={() => router.push('/sales')}
                    addToCart={addToCart}
                    cart={cart}
                    removeFromCart={removeFromCart}
                    updateQuantity={updateQuantity}
                    grandTotal={grandTotal}
                    selectedCustomer={selectedCustomer}
                    setSelectedCustomer={setSelectedCustomer}
                    pauseSale={pauseSale}
                    processing={processing}
                    setIsCheckoutOpen={setIsCheckoutOpen}
                />
            )}

            {/* Scanner Modal with Camera */}
            {showScanner && (
                <ScannerModal
                    onClose={() => setShowScanner(false)}
                    onScan={handleScan}
                    scanning={scanning}
                    setScanning={setScanning}
                    cameraError={cameraError}
                    setCameraError={setCameraError}
                    barcodeInput={barcodeInput}
                    setBarcodeInput={setBarcodeInput}
                    videoRef={videoRef}
                    streamRef={streamRef}
                    scannerControlsRef={scannerControlsRef}
                />
            )}

            {/* Create New Customer Modal */}
            {showCreateCustomer && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserPlus className="h-5 w-5" />
                                Nuevo Cliente
                            </CardTitle>
                            <CardDescription>Crea un cliente rápidamente para esta venta</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nombre Completo *</label>
                                <Input
                                    placeholder="Ej: Juan Pérez"
                                    value={newCustomerName}
                                    onChange={(e) => setNewCustomerName(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">DNI / CC (Opcional)</label>
                                <Input
                                    placeholder="Ej: 1234567890"
                                    value={newCustomerDoc}
                                    onChange={(e) => setNewCustomerDoc(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => {
                                        setShowCreateCustomer(false)
                                        setNewCustomerName('')
                                        setNewCustomerDoc('')
                                    }}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={async () => {
                                        if (!newCustomerName.trim()) {
                                            toast.error('El nombre es obligatorio')
                                            return
                                        }
                                        setCreatingCustomer(true)
                                        try {
                                            const created = await api.customers.create({
                                                name: newCustomerName.trim(),
                                                docNumber: newCustomerDoc.trim() || undefined
                                            })
                                            setSelectedCustomer(created)
                                            setShowCreateCustomer(false)
                                            setNewCustomerName('')
                                            setNewCustomerDoc('')
                                            toast.success('Cliente creado exitosamente')
                                        } catch (e: any) {
                                            toast.error(e.message || 'Error al crear cliente')
                                        } finally {
                                            setCreatingCustomer(false)
                                        }
                                    }}
                                    disabled={creatingCustomer || !newCustomerName.trim()}
                                >
                                    {creatingCustomer ? 'Creando...' : 'Crear Cliente'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </>
    )
}

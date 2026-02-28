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
import { Scan, X, Plus, Minus, Trash2, ChevronLeft, ChevronRight, Pause, Play, UserPlus, Camera, Loader2, Wallet } from 'lucide-react'
import { cn, formatThousands, parseThousands } from '@/lib/utils';
import { BrowserMultiFormatReader } from '@zxing/browser'
import { NotFoundException } from '@zxing/library'
import { Label } from '@/components/ui/label'
import { CashOpenDialog, CashCloseDialog, CashTransactionDialog } from '@/components/pos/cash-control'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const COUNTRIES = [
    { code: '57', name: 'Colombia', flag: '🇨🇴' },
    { code: '58', name: 'Venezuela', flag: '🇻🇪' },
    { code: '34', name: 'España', flag: '🇪🇸' },
    { code: '1', name: 'USA/Canadá', flag: '🇺🇸' },
    { code: '52', name: 'México', flag: '🇲🇽' },
    { code: '507', name: 'Panamá', flag: '🇵🇦' },
    { code: '593', name: 'Ecuador', flag: '🇪🇨' },
    { code: '51', name: 'Perú', flag: '🇵🇪' },
    { code: '54', name: 'Argentina', flag: '🇦🇷' },
    { code: '56', name: 'Chile', flag: '🇨🇱' },
    { code: '506', name: 'Costa Rica', flag: '🇨🇷' },
    { code: '502', name: 'Guatemala', flag: '🇬🇹' },
]

interface CartItem extends Product {
    quantity: number
}

interface ComboItemRequirement {
    productId: string
    productName: string
    quantity: number
}

interface ComboForPOS {
    id: string
    name: string
    description?: string | null
    image?: string | null
    finalUnitPrice: number
    baseUnitPrice: number
    available: boolean
    maxUnitsInWarehouse: number | null
    items: ComboItemRequirement[]
}

interface ComboCartItem {
    comboId: string
    comboName: string
    quantity: number
    unitPrice: number
    baseUnitPrice: number
    items: ComboItemRequirement[]
}

// Stock map type: { productId: availableQuantity }
type StockMap = { [productId: string]: number }

interface Customer {
    id: string
    name: string
    docNumber?: string
    isBanned?: boolean
    banReason?: string | null
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
            setCameraError('️ Se requiere HTTPS para acceder a la cámara. Por favor, accede desde https:// o localhost.')
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
                errorMessage = ' Permiso de cámara denegado. Por favor, permite el acceso a la cámara en la configuración de tu navegador.'
            } else if (e.name === 'NotFoundError' || e.name === 'DevicesNotFoundError') {
                errorMessage = ' No se encontró ninguna cámara en tu dispositivo.'
            } else if (e.name === 'NotReadableError' || e.name === 'TrackStartError') {
                errorMessage = ' La cámara está siendo usada por otra aplicación.'
            } else if (e.name === 'OverconstrainedError') {
                errorMessage = ' No se pudo acceder a la cámara trasera.'
            } else if (e.name === 'NotSupportedError') {
                errorMessage = ' Tu navegador no soporta acceso a la cámara.'
            } else if (e.message) {
                errorMessage = ` ${e.message}`
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
                                <div className="text-6xl"></div>
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
    comboCart: ComboCartItem[];
    grandTotal: number;
    search: string;
    setSearch: (s: string) => void;
    filteredProducts: Product[];
    filteredCombos: ComboForPOS[];
    addToCart: (p: Product) => void;
    addComboToCart: (combo: ComboForPOS) => void;
    removeFromCart: (id: string) => void;
    removeComboFromCart: (comboId: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    updateComboQuantity: (comboId: string, quantity: number) => void;
    getAvailableProductStock: (productId: string) => number;
    getComboAvailableUnits: (combo: ComboForPOS) => number;
    pauseSale: () => void;
    processing: boolean;
    canProceedToStep2: boolean;
    canProceedToStep3: boolean;
    setShowScanner: (b: boolean) => void;
    handleCheckout: () => void;
    paymentMethod: 'CASH' | 'CARD' | 'TRANSFER' | 'OTHER';
    setPaymentMethod: (m: 'CASH' | 'CARD' | 'TRANSFER' | 'OTHER') => void;
    onCreateNewCustomer: () => void;
    mobilePage: number;
    setMobilePage: (n: number) => void;
    stockMap: StockMap;
    onReset: () => void;
    onShowCashControl: () => void;
    onShowCashTransaction: () => void;
    amountReceived: number | string;
    setAmountReceived: (val: number | string) => void;
    discountApplied: number | string;
    setDiscountApplied: (val: number | string) => void;
    subtotal: number;
    comboSubtotal: number;
}) {
    const {
        mobileStep,
        setMobileStep,
        selectedCustomer,
        setSelectedCustomer,
        cart,
        comboCart,
        grandTotal,
        search,
        setSearch,
        filteredProducts,
        filteredCombos,
        addToCart,
        addComboToCart,
        removeFromCart,
        removeComboFromCart,
        updateQuantity,
        updateComboQuantity,
        getAvailableProductStock,
        getComboAvailableUnits,
        pauseSale,
        processing,
        canProceedToStep2,
        canProceedToStep3,
        setShowScanner,
        handleCheckout,
        paymentMethod,
        setPaymentMethod,
        onCreateNewCustomer,
        mobilePage,
        setMobilePage,
        onReset,
        stockMap,
        onShowCashControl,
        onShowCashTransaction,
        amountReceived,
        setAmountReceived,
        discountApplied,
        setDiscountApplied,
        subtotal,
        comboSubtotal
    } = props;

    const stepLabels = [
        { step: 1, label: 'Cliente', icon: '' },
        { step: 2, label: 'Productos', icon: '' },
        { step: 3, label: 'Pago', icon: '' },
    ]

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] bg-gray-50">
            {/* Progress Steps - Redesigned */}
            <div className="bg-white border-b px-3 py-4 flex-shrink-0">
                <div className="flex items-center justify-center">
                    {stepLabels.map((item, idx) => (
                        <div key={item.step} className="flex items-center">
                            {/* Step Circle + Label */}
                            <div className="flex flex-col items-center">
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-300 shadow-sm",
                                    mobileStep > item.step
                                        ? "bg-emerald-500 text-white"
                                        : mobileStep === item.step
                                            ? "bg-primary text-white ring-4 ring-primary/20"
                                            : "bg-gray-100 text-gray-400 border border-gray-200"
                                )}>
                                    {mobileStep > item.step ? '' : item.icon}
                                </div>
                                <span className={cn(
                                    "text-xs mt-1.5 font-medium transition-colors",
                                    mobileStep >= item.step ? "text-gray-900" : "text-gray-400"
                                )}>
                                    {item.label}
                                </span>
                            </div>

                            {/* Connector Line */}
                            {idx < stepLabels.length - 1 && (
                                <div className={cn(
                                    "w-12 sm:w-16 h-0.5 mx-2 mb-5 rounded-full transition-all duration-300",
                                    mobileStep > item.step ? "bg-emerald-500" : "bg-gray-200"
                                )} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 pb-24">
                {mobileStep === 1 && (
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 h-14 bg-white border-2 shadow-sm rounded-xl"
                                onClick={onShowCashTransaction}
                            >
                                <Wallet className="h-6 w-6 mr-2 text-primary" />
                                <div className="flex flex-col items-start leading-tight">
                                    <span className="text-[10px] text-gray-500 font-normal uppercase">Registrar</span>
                                    <span className="text-sm font-bold">Movimiento</span>
                                </div>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 h-14 bg-white border-2 shadow-sm rounded-xl"
                                onClick={onShowCashControl}
                            >
                                <X className="h-6 w-6 mr-2 text-red-500" />
                                <div className="flex flex-col items-start leading-tight">
                                    <span className="text-[10px] text-gray-500 font-normal uppercase">Cerrar turno</span>
                                    <span className="text-sm font-bold">Caja</span>
                                </div>
                            </Button>
                        </div>

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
                            <Card className={cn(
                                selectedCustomer.isBanned ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"
                            )}>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className={cn(
                                            "flex items-center gap-3",
                                            selectedCustomer.isBanned ? "text-red-700" : "text-emerald-700"
                                        )}>
                                            <div className={cn(
                                                "w-10 h-10 rounded-full text-white flex items-center justify-center text-xl",
                                                selectedCustomer.isBanned ? "bg-red-500" : "bg-emerald-500"
                                            )}></div>
                                            <div>
                                                <div className="font-bold">{selectedCustomer.name}</div>
                                                {selectedCustomer.docNumber && (
                                                    <div className="text-sm opacity-80">{selectedCustomer.docNumber}</div>
                                                )}
                                                {selectedCustomer.isBanned && (
                                                    <div className="text-xs font-semibold">Cliente vetado: no se puede vender.</div>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => setSelectedCustomer(null)}
                                            className={cn(
                                                "h-8 w-8",
                                                selectedCustomer.isBanned
                                                    ? "text-red-700 hover:text-red-900 hover:bg-red-100"
                                                    : "text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100",
                                            )}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {selectedCustomer.isBanned && selectedCustomer.banReason && (
                                        <p className="mt-2 text-xs text-red-700">Motivo: {selectedCustomer.banReason}</p>
                                    )}
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
                        {(cart.length > 0 || comboCart.length > 0) && (
                            <Card className="bg-primary text-white">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="text-sm opacity-90">{cart.length + comboCart.length} item(s)</div>
                                            <div className="text-2xl font-bold">${formatThousands(grandTotal)}</div>
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

                        {/* Products List & Pagination */}
                        <div className="space-y-4">
                            {filteredCombos.length > 0 && (
                                <div className="space-y-2">
                                    <div className="text-xs font-bold uppercase tracking-wider text-amber-700">Combos disponibles</div>
                                    {filteredCombos.slice(0, 6).map(combo => {
                                        const inCart = comboCart.find(c => c.comboId === combo.id)?.quantity ?? 0
                                        const maxUnits = getComboAvailableUnits(combo)
                                        return (
                                            <Card key={`combo-${combo.id}`} className="overflow-hidden border-amber-200">
                                                <CardContent className="p-3">
                                                    <div className="flex gap-3">
                                                        <div className="w-16 h-16 bg-amber-50 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                            {combo.image ? (
                                                                <img src={combo.image} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="text-2xl"></span>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-semibold text-sm">{combo.name}</div>
                                                            <div className="text-xs text-gray-500 line-clamp-2">
                                                                {combo.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                                                            </div>
                                                            <div className="text-xs text-gray-400 mt-0.5">
                                                                Disponibles: {maxUnits}
                                                            </div>
                                                            <div className="font-black text-amber-700 mt-1">
                                                                ${formatThousands(Number(combo.finalUnitPrice))}
                                                            </div>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => addComboToCart(combo)}
                                                            className="self-center"
                                                            disabled={inCart >= maxUnits}
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    {inCart > 0 && (
                                                        <div className="mt-3 pt-3 border-t flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => updateComboQuantity(combo.id, inCart - 1)}
                                                                    className="h-8 w-8 p-0"
                                                                >
                                                                    <Minus className="h-3 w-3" />
                                                                </Button>
                                                                <span className="w-12 text-center font-semibold">{inCart}</span>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => updateComboQuantity(combo.id, inCart + 1)}
                                                                    className="h-8 w-8 p-0"
                                                                    disabled={inCart >= maxUnits}
                                                                >
                                                                    <Plus className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removeComboFromCart(combo.id)}
                                                                className="text-red-600"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        )
                                    })}
                                </div>
                            )}

                            <div className="space-y-2">
                                {filteredProducts.slice((mobilePage - 1) * 3, mobilePage * 3).map(product => (
                                    <Card key={product.id} className="overflow-hidden">
                                        <CardContent className="p-3">
                                            <div className="flex gap-3">
                                                <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                    {product.images?.[0] ? (
                                                        <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-2xl"></span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-sm">{product.name}</div>
                                                    <div className="text-xs text-gray-500">{product.barcode}</div>
                                                    <div className="text-xs text-gray-400 mt-0.5">
                                                        Stock: {getAvailableProductStock(product.id)}
                                                    </div>
                                                    <div className="font-bold text-gray-900 mt-1">
                                                        ${formatThousands(Number(product.salePrice))}
                                                    </div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    onClick={() => addToCart(product)}
                                                    className="self-center"
                                                    disabled={getAvailableProductStock(product.id) <= (cart.find(i => i.id === product.id)?.quantity ?? 0)}
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
                                                            disabled={(cart.find(i => i.id === product.id)?.quantity ?? 0) >= getAvailableProductStock(product.id)}
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

                            {/* Pagination Controls */}
                            {filteredProducts.length > 3 && (
                                <div className="flex items-center justify-between bg-white p-3 rounded-lg border shadow-sm sticky bottom-0 z-10">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setMobilePage(Math.max(1, mobilePage - 1))}
                                        disabled={mobilePage === 1}
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                        Anterior
                                    </Button>

                                    <span className="text-sm font-medium text-gray-600">
                                        Página {mobilePage} de {Math.ceil(filteredProducts.length / 3)}
                                    </span>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setMobilePage(mobilePage + 1)}
                                        disabled={mobilePage * 3 >= filteredProducts.length}
                                    >
                                        Siguiente
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {mobileStep === 3 && (
                    <div className="space-y-4">
                        <Card>
                            <CardHeader className="space-y-3 pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle>Resumen de Venta</CardTitle>
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
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
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
                                                    ${formatThousands(Number(item.salePrice) * item.quantity)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {comboCart.length > 0 && (
                                    <div>
                                        <div className="text-xs text-amber-700 mb-2 font-bold uppercase tracking-wider">Combos ({comboCart.length})</div>
                                        <div className="space-y-2">
                                            {comboCart.map(comboLine => (
                                                <div key={comboLine.comboId} className="flex justify-between text-sm">
                                                    <span>{comboLine.quantity}x {comboLine.comboName}</span>
                                                    <span className="font-semibold text-amber-700">
                                                        ${formatThousands(Number(comboLine.unitPrice) * comboLine.quantity)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Subtotal y Descuento */}
                                <div className="space-y-3 pt-3 border-t">
                                    <div className="flex justify-between items-center text-sm text-gray-500">
                                        <span>Subtotal productos</span>
                                        <span>${formatThousands(subtotal - comboSubtotal)}</span>
                                    </div>
                                    {comboSubtotal > 0 && (
                                        <div className="flex justify-between items-center text-sm text-amber-700">
                                            <span>Subtotal combos</span>
                                            <span>${formatThousands(comboSubtotal)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center text-sm text-gray-500">
                                        <span>Subtotal</span>
                                        <span>${formatThousands(subtotal)}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium">Descuento aplicado</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                            <Input
                                                type="text"
                                                inputMode="numeric"
                                                className="pl-8 h-11 text-lg"
                                                placeholder="0"
                                                value={discountApplied === 0 ? '' : discountApplied}
                                                onChange={(e) => setDiscountApplied(formatThousands(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                        <span className="text-lg font-bold">TOTAL NETO</span>
                                        <span className="text-3xl font-black text-gray-900">
                                            ${formatThousands(grandTotal)}
                                        </span>
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div>
                                    <div className="text-sm font-medium mb-2">Método de Pago</div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['CASH', 'CARD', 'TRANSFER', 'OTHER'].map((m) => (
                                            <Button
                                                key={m}
                                                variant={paymentMethod === m ? 'default' : 'outline'}
                                                onClick={() => setPaymentMethod(m as any)}
                                                className="h-16"
                                            >
                                                {m}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Cambio / Vuelto (Mobile) */}
                                {paymentMethod === 'CASH' && (
                                    <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="space-y-1">
                                            <Label className="text-sm text-gray-500 font-medium">Monto Recibido</Label>
                                            <Input
                                                type="text"
                                                inputMode="numeric"
                                                placeholder="Ej: 50.000"
                                                value={amountReceived}
                                                onChange={(e) => setAmountReceived(formatThousands(e.target.value))}
                                                className="h-12 text-lg font-bold border-2 focus:ring-primary"
                                                autoFocus
                                            />
                                        </div>
                                        {parseThousands(String(amountReceived)) >= grandTotal && (
                                            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex justify-between items-center animate-in zoom-in duration-300">
                                                <span className="text-emerald-700 font-medium">Cambio a devolver:</span>
                                                <span className="text-2xl font-black text-emerald-700">
                                                    ${formatThousands(parseThousands(String(amountReceived)) - grandTotal)}
                                                </span>
                                            </div>
                                        )}
                                        {amountReceived && parseThousands(String(amountReceived)) < grandTotal && (
                                            <p className="text-xs text-red-500 font-medium">El monto recibido es menor al total</p>
                                        )}
                                    </div>
                                )}
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

                    {!processing && (
                        <Button
                            variant="outline"
                            size="lg"
                            className="flex-shrink-0 text-red-500 border-red-200 hover:bg-red-50"
                            onClick={onReset}
                            disabled={cart.length === 0 && comboCart.length === 0 && !selectedCustomer}
                        >
                            <Trash2 className="h-5 w-5" />
                        </Button>
                    )}

                    {mobileStep === 3 ? (
                        <Button
                            size="lg"
                            className="flex-1 h-12 text-sm font-bold uppercase tracking-wide"
                            onClick={handleCheckout}
                            disabled={processing || !selectedCustomer || !!selectedCustomer?.isBanned || (cart.length === 0 && comboCart.length === 0)}
                        >
                            {processing ? 'Procesando...' : 'FINALIZAR'}
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
    filteredCombos: ComboForPOS[];
    allCombos: ComboForPOS[];
    search: string;
    setSearch: (s: string) => void;
    setShowScanner: (b: boolean) => void;
    goToSales: () => void;
    addToCart: (p: Product) => void;
    addComboToCart: (combo: ComboForPOS) => void;
    cart: CartItem[];
    comboCart: ComboCartItem[];
    removeFromCart: (id: string) => void;
    removeComboFromCart: (comboId: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    updateComboQuantity: (comboId: string, quantity: number) => void;
    getAvailableProductStock: (productId: string) => number;
    getComboAvailableUnits: (combo: ComboForPOS) => number;
    grandTotal: number;
    selectedCustomer: Customer | null;
    stockMap: StockMap;
    setSelectedCustomer: (c: Customer | null) => void;
    pauseSale: () => void;
    onReset: () => void;
    processing: boolean;
    setIsCheckoutOpen: (b: boolean) => void;
    onShowCashControl: () => void;
    onShowCashTransaction: () => void;
    onCreateNewCustomer: () => void;
    amountReceived: string | number;
    setAmountReceived: (val: string | number) => void;
    discountApplied: string | number;
    setDiscountApplied: (val: string | number) => void;
    subtotal: number;
    comboSubtotal: number;
}) {
    const {
        loading,
        filteredProducts,
        filteredCombos,
        allCombos,
        search,
        setSearch,
        setShowScanner,
        goToSales,
        addToCart,
        addComboToCart,
        cart,
        comboCart,
        removeFromCart,
        removeComboFromCart,
        updateQuantity,
        updateComboQuantity,
        getAvailableProductStock,
        getComboAvailableUnits,
        grandTotal,
        selectedCustomer,
        setSelectedCustomer,
        pauseSale,
        onReset,
        processing,
        setIsCheckoutOpen,
        stockMap,
        onShowCashControl,
        onShowCashTransaction,
        onCreateNewCustomer,
        discountApplied,
        setDiscountApplied,
        subtotal,
        comboSubtotal
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
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={onShowCashTransaction}
                            className="px-4"
                        >
                            <Wallet className="h-5 w-5 mr-2" />
                            Movimiento
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={onShowCashControl}
                            className="px-4"
                        >
                            <X className="h-5 w-5 mr-2" />
                            Caja
                        </Button>
                    </div>
                </div>

                {filteredCombos.length > 0 && (
                    <div className="px-4 pt-3 pb-2 border-b bg-amber-50/50">
                        <div className="text-xs font-black uppercase tracking-wider text-amber-700 mb-2">Combos</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {filteredCombos.slice(0, 6).map(combo => {
                                const inCart = comboCart.find(c => c.comboId === combo.id)?.quantity ?? 0
                                const maxUnits = getComboAvailableUnits(combo)
                                return (
                                    <div key={`desktop-combo-${combo.id}`} className="rounded-lg border border-amber-200 bg-white p-2">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="min-w-0">
                                                <div className="font-semibold text-sm truncate">{combo.name}</div>
                                                <div className="text-[11px] text-gray-500 truncate">{combo.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}</div>
                                                <div className="text-[11px] text-gray-400">Disponibles: {maxUnits}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-black text-amber-700">${formatThousands(Number(combo.finalUnitPrice))}</div>
                                                <Button
                                                    size="sm"
                                                    className="mt-1"
                                                    onClick={() => addComboToCart(combo)}
                                                    disabled={inCart >= maxUnits}
                                                >
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    {inCart > 0 ? inCart : 'Agregar'}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

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
                                                        <span className="text-lg"></span>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-medium text-sm">{product.name}</div>
                                                    <div className="text-xs text-gray-500 truncate">{product.barcode}</div>
                                                    <div className="text-xs text-gray-400">Stock: {getAvailableProductStock(product.id)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3 text-sm text-gray-500 hidden sm:table-cell">
                                            {product.sku || '-'}
                                        </td>
                                        <td className="p-3 text-right font-semibold text-sm">
                                            ${formatThousands(Number(product.salePrice))}
                                        </td>
                                        <td className="p-3">
                                            <Button
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    addToCart(product)
                                                }}
                                                disabled={getAvailableProductStock(product.id) <= (cart.find(i => i.id === product.id)?.quantity ?? 0)}
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
                    <CustomerSelector
                        onSelect={setSelectedCustomer}
                        selectedCustomer={selectedCustomer}
                        onCreateNew={onCreateNewCustomer}
                    />
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {(cart.length === 0 && comboCart.length === 0) ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <div className="text-5xl mb-2"></div>
                            <p className="text-sm">Carrito vacío</p>
                        </div>
                    ) : (
                        <>
                            {comboCart.map(comboLine => {
                                const comboDef = allCombos.find(c => c.id === comboLine.comboId)
                                const maxUnits = comboDef ? getComboAvailableUnits(comboDef) : comboLine.quantity
                                return (
                                    <div key={`cart-combo-${comboLine.comboId}`} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1 min-w-0 pr-2">
                                                <div className="font-semibold text-sm text-amber-800"> {comboLine.comboName}</div>
                                                <div className="text-xs text-amber-700">
                                                    ${formatThousands(Number(comboLine.unitPrice))} c/u
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeComboFromCart(comboLine.comboId)}
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
                                                    onClick={() => updateComboQuantity(comboLine.comboId, comboLine.quantity - 1)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="w-12 text-center font-semibold">{comboLine.quantity}</span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => updateComboQuantity(comboLine.comboId, comboLine.quantity + 1)}
                                                    className="h-8 w-8 p-0"
                                                    disabled={comboLine.quantity >= maxUnits}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <div className="font-bold text-amber-700">
                                                ${formatThousands(Number(comboLine.unitPrice) * comboLine.quantity)}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}

                            {cart.map(item => (
                                <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1 min-w-0 pr-2">
                                            <div className="font-medium text-sm">{item.name}</div>
                                            <div className="text-xs text-gray-500">
                                                ${formatThousands(Number(item.salePrice))} c/u
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
                                                disabled={item.quantity >= getAvailableProductStock(item.id)}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        <div className="font-bold">
                                            ${formatThousands(Number(item.salePrice) * item.quantity)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>

                {/* Cart Footer */}
                <div className="border-t bg-gray-50 p-4 space-y-3">
                    <div className="space-y-2 pb-2">
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>Subtotal productos</span>
                            <span>${formatThousands(subtotal - comboSubtotal)}</span>
                        </div>
                        {comboSubtotal > 0 && (
                            <div className="flex justify-between text-sm text-amber-700">
                                <span>Subtotal combos</span>
                                <span>${formatThousands(comboSubtotal)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>Subtotal</span>
                            <span>${formatThousands(subtotal)}</span>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Descuento</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                <Input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="0"
                                    value={discountApplied === 0 ? '' : discountApplied}
                                    onChange={(e) => setDiscountApplied(formatThousands(e.target.value))}
                                    className="pl-7 h-10 font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center border-t pt-2">
                        <span className="text-lg font-semibold text-gray-700">TOTAL:</span>
                        <span className="text-3xl font-black text-gray-900">
                            ${formatThousands(grandTotal)}
                        </span>
                    </div>
                    <Button
                        size="lg"
                        className="w-full h-14 text-lg font-bold shadow-lg"
                        disabled={(cart.length === 0 && comboCart.length === 0) || !selectedCustomer || !!selectedCustomer?.isBanned}
                        onClick={() => setIsCheckoutOpen(true)}
                    >
                        COBRAR
                    </Button>
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
                    {(cart.length > 0 || comboCart.length > 0 || selectedCustomer) && (
                        <Button
                            variant="ghost"
                            size="lg"
                            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={onReset}
                            disabled={processing}
                        >
                            <Trash2 className="mr-2 h-5 w-5" />
                            Cancelar Venta
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
    const [combos, setCombos] = useState<ComboForPOS[]>([])
    const [cart, setCart] = useState<CartItem[]>([])
    const [comboCart, setComboCart] = useState<ComboCartItem[]>([])
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
    const [processing, setProcessing] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'TRANSFER' | 'OTHER'>('CASH')
    const [amountReceived, setAmountReceived] = useState<number | string>('')
    const [discountApplied, setDiscountApplied] = useState<number | string>(0)
    const [warehouseId, setWarehouseId] = useState<string>('')
    const [stockMap, setStockMap] = useState<StockMap>({})
    const [showScanner, setShowScanner] = useState(false)
    const [showResetConfirm, setShowResetConfirm] = useState(false)

    // Mobile stepper state
    const [mobileStep, setMobileStep] = useState(1) // 1: Cliente, 2: Productos, 3: Pago
    const [mobilePage, setMobilePage] = useState(1)

    // Resume sale state
    // Resume sale state
    const [resumedSaleId, setResumedSaleId] = useState<string | null>(null)
    const [isResuming, setIsResuming] = useState(false)

    const [isMobile, setIsMobile] = useState<boolean | null>(null)

    // Create new customer modal state
    const [showCreateCustomer, setShowCreateCustomer] = useState(false)
    const [newCustomerName, setNewCustomerName] = useState('')
    const [newCustomerDoc, setNewCustomerDoc] = useState('')
    const [newCustomerPhone, setNewCustomerPhone] = useState('')
    const [newCustomerCountryCode, setNewCustomerCountryCode] = useState('57')
    const [creatingCustomer, setCreatingCustomer] = useState(false)

    // Camera scanner state
    const [scanning, setScanning] = useState(false)
    const [cameraError, setCameraError] = useState<string | null>(null)

    // Cash Flow State
    const [showOpenCash, setShowOpenCash] = useState(false)
    const [showCloseCash, setShowCloseCash] = useState(false)
    const [showCashTransaction, setShowCashTransaction] = useState(false)

    useEffect(() => {
        checkCashStatus()
    }, [])

    const checkCashStatus = async () => {
        try {
            const shift = await api.cashFlow.getCurrent()
            if (!shift) {
                setShowOpenCash(true)
            }
        } catch (error) {
            console.error('Error checking cash status:', error)
        }
    }
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
            setIsResuming(true)
            loadResumedSale(resumeId)
        }
    }, [resumeId])

    const loadData = async () => {
        setLoading(true)
        try {
            // Get current user's warehouse assignment
            const me = await api.auth.me()
            const userWarehouseId = me.warehouseId

            if (!userWarehouseId) {
                toast.error('No tienes un almacén asignado. Contacta al administrador.')
                setLoading(false)
                return
            }

            setWarehouseId(userWarehouseId)

            // Load products, combos and stock for the user's warehouse
            const [prodsRes, combosRes, stockData] = await Promise.all([
                api.products.list({ limit: 1000, sellableOnly: true }),
                api.combos.list({ warehouseId: userWarehouseId }),
                api.inventory.stock({ warehouseId: userWarehouseId })
            ])

            const prods = Array.isArray(prodsRes) ? prodsRes : (prodsRes?.data || [])
            setProducts(prods)
            const comboList = (combosRes || []).map((combo: any) => ({
                id: combo.id,
                name: combo.name,
                description: combo.description,
                image: combo.image,
                finalUnitPrice: Number(combo.finalUnitPrice || 0),
                baseUnitPrice: Number(combo.baseUnitPrice || 0),
                available: !!combo.available,
                maxUnitsInWarehouse: combo.maxUnitsInWarehouse,
                items: (combo.items || []).map((item: any) => ({
                    productId: item.productId,
                    productName: item.productName,
                    quantity: Number(item.quantity || 0),
                }))
            }))
            setCombos(comboList)

            // Build stock map: { productId: quantity }
            const stockMapData: StockMap = {}
            stockData.forEach((row) => {
                stockMapData[row.productId] = row.quantity
            })
            setStockMap(stockMapData)
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    const loadResumedSale = async (id: string) => {
        try {
            // 1. Obtener la factura pausada
            const invoice = await api.invoices.get(id)
            if (invoice) {
                setResumedSaleId(invoice.id)
                if (invoice.customer) setSelectedCustomer(invoice.customer)

                // 2. Obtener el stock fresco de este almacén para validar
                const me = await api.auth.me()
                const currentWarehouseId = me.warehouseId

                if (!currentWarehouseId) {
                    toast.error('No tienes un almacén asignado para validar esta venta.')
                    return
                }

                const stockData = await api.inventory.stock({ warehouseId: currentWarehouseId })
                const currentStockMap: StockMap = {}
                stockData.forEach((row: any) => {
                    currentStockMap[row.productId] = row.quantity
                })

                // 3. Rehidratar combos pendientes (si existen)
                const virtualStockMap: StockMap = { ...currentStockMap }
                let hasAdjustments = false

                const comboLines: ComboCartItem[] = []
                for (const comboLine of (invoice.comboLines || [])) {
                    const comboId = comboLine.comboId
                    if (!comboId) continue

                    let comboDef: any = null
                    try {
                        comboDef = await api.combos.get(comboId, { warehouseId: currentWarehouseId })
                    } catch {
                        comboDef = null
                    }

                    const comboItems: ComboItemRequirement[] = (comboDef?.items || [])
                        .map((item: any) => ({
                            productId: item.productId,
                            productName: item.productName,
                            quantity: Number(item.quantity || 0),
                        }))
                        .filter((item: any) => item.quantity > 0)

                    // Fallback: reconstruir items desde invoice.items si el combo ya no existe
                    if (comboItems.length === 0) {
                        const grouped: Record<string, { name: string; qty: number }> = {}
                        const lineQty = Math.max(1, Number(comboLine.quantity || 1))
                        ;(invoice.items || []).forEach((item: any) => {
                            if (item.comboId !== comboId) return
                            const key = item.productId
                            const baseQty = Math.max(1, Math.round(Number(item.quantity || 0) / lineQty))
                            if (!grouped[key]) {
                                grouped[key] = { name: item.product?.name || 'Producto', qty: baseQty }
                            }
                        })
                        Object.entries(grouped).forEach(([productId, data]) => {
                            comboItems.push({
                                productId,
                                productName: data.name,
                                quantity: data.qty,
                            })
                        })
                    }

                    if (comboItems.length === 0) continue

                    let maxUnits = Number.POSITIVE_INFINITY
                    comboItems.forEach(item => {
                        const available = virtualStockMap[item.productId] ?? 0
                        maxUnits = Math.min(maxUnits, Math.floor(available / Math.max(1, item.quantity)))
                    })
                    const requestedQty = Number(comboLine.quantity || 0)
                    const finalQty = Math.max(0, Math.min(requestedQty, Number.isFinite(maxUnits) ? maxUnits : 0))

                    if (finalQty < requestedQty) hasAdjustments = true

                    comboItems.forEach(item => {
                        virtualStockMap[item.productId] = (virtualStockMap[item.productId] ?? 0) - (item.quantity * finalQty)
                    })

                    comboLines.push({
                        comboId,
                        comboName: comboLine.comboName,
                        quantity: finalQty,
                        unitPrice: Number(comboLine.finalUnitPrice || comboDef?.finalUnitPrice || 0),
                        baseUnitPrice: Number(comboLine.baseUnitPrice || comboDef?.baseUnitPrice || 0),
                        items: comboItems,
                    })
                }

                // 4. Cruzar productos directos pausados con stock restante actual
                const adjustedItems = (invoice.items || [])
                    .filter((item: any) => !item.comboId)
                    .map((item: any) => {
                        const available = virtualStockMap[item.productId] ?? 0
                        let finalQuantity = Number(item.quantity || 0)

                        if (finalQuantity > available) {
                            hasAdjustments = true
                            finalQuantity = Math.max(0, available)
                        }

                        virtualStockMap[item.productId] = available - finalQuantity

                        return {
                            ...item.product,
                            quantity: finalQuantity,
                            salePrice: item.unitPrice
                        }
                    })

                setComboCart(comboLines.filter(line => line.quantity > 0))
                setCart(adjustedItems)
                setStockMap(currentStockMap)

                if (hasAdjustments) {
                    toast.error('️ ATENCIÓN: Esta venta fue iniciada en otra sede o el stock cambió. Se han ajustado las cantidades según la disponibilidad actual.', {
                        duration: 8000,
                        position: 'top-center'
                    })
                } else {
                    toast.success('Venta reanudada con éxito')
                }

                setMobileStep(2) // Saltar a la pestaña de productos
            }
        } catch (e) {
            console.error(e)
            toast.error('Error al reanudar la venta')
        } finally {
            setIsResuming(false)
        }
    }

    const getReservedByCombos = (productId: string, source: ComboCartItem[] = comboCart) => {
        return source.reduce((sum, comboLine) => {
            const item = comboLine.items.find(i => i.productId === productId)
            if (!item) return sum
            return sum + (item.quantity * comboLine.quantity)
        }, 0)
    }

    const getAvailableProductStock = (productId: string, comboSource: ComboCartItem[] = comboCart) => {
        const totalStock = stockMap[productId] ?? 0
        const reservedByCombos = getReservedByCombos(productId, comboSource)
        return Math.max(0, totalStock - reservedByCombos)
    }

    const getComboAvailableUnits = (combo: ComboForPOS, currentComboQty = 0, comboSource: ComboCartItem[] = comboCart) => {
        if (!combo.items.length) return 0

        let maxUnits = Number.POSITIVE_INFINITY
        for (const item of combo.items) {
            const totalStock = stockMap[item.productId] ?? 0
            const directQty = cart.find(p => p.id === item.productId)?.quantity ?? 0
            const reservedByCombos = getReservedByCombos(item.productId, comboSource) - (currentComboQty * item.quantity)
            const availableUnits = Math.floor((totalStock - directQty - Math.max(0, reservedByCombos)) / Math.max(1, item.quantity))
            maxUnits = Math.min(maxUnits, availableUnits)
        }

        return Number.isFinite(maxUnits) ? Math.max(0, maxUnits) : 0
    }

    const addToCart = (product: Product) => {
        if (!product.isSellable) {
            toast.error(`"${product.name}" no está habilitado para venta`)
            return
        }
        const availableStock = getAvailableProductStock(product.id)
        const currentInCart = cart.find(item => item.id === product.id)?.quantity ?? 0

        if (availableStock <= 0) {
            toast.error(`"${product.name}" no tiene stock disponible en tu almacén`)
            return
        }

        if (currentInCart >= availableStock) {
            toast.error(`Stock máximo alcanzado para "${product.name}" (${availableStock} unidades)`)
            return
        }

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

    const addComboToCart = (combo: ComboForPOS) => {
        const existing = comboCart.find(c => c.comboId === combo.id)
        const currentQty = existing?.quantity ?? 0
        const maxQty = getComboAvailableUnits(combo, currentQty)

        if (maxQty <= currentQty) {
            toast.error(`No hay stock suficiente para agregar más unidades del combo "${combo.name}"`)
            return
        }

        setComboCart(prev => {
            const found = prev.find(c => c.comboId === combo.id)
            if (found) {
                return prev.map(c => c.comboId === combo.id ? { ...c, quantity: c.quantity + 1 } : c)
            }
            return [
                ...prev,
                {
                    comboId: combo.id,
                    comboName: combo.name,
                    quantity: 1,
                    unitPrice: Number(combo.finalUnitPrice),
                    baseUnitPrice: Number(combo.baseUnitPrice),
                    items: combo.items,
                }
            ]
        })
    }

    const removeComboFromCart = (comboId: string) => {
        setComboCart(prev => prev.filter(c => c.comboId !== comboId))
    }

    const updateComboQuantity = (comboId: string, quantity: number) => {
        if (quantity < 1) {
            removeComboFromCart(comboId)
            return
        }

        const comboDef = combos.find(c => c.id === comboId)
        if (!comboDef) {
            toast.error('No se encontró la definición del combo')
            return
        }

        const currentQty = comboCart.find(c => c.comboId === comboId)?.quantity ?? 0
        const maxQty = getComboAvailableUnits(comboDef, currentQty)

        if (quantity > maxQty) {
            toast.error(`Stock máximo para este combo: ${maxQty} unidades`)
            return
        }

        setComboCart(prev => prev.map(c => c.comboId === comboId ? { ...c, quantity } : c))
    }

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(item => item.id !== id))
    }

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(id)
            return
        }

        const availableStock = getAvailableProductStock(id)
        if (quantity > availableStock) {
            toast.error(`Stock máximo: ${availableStock} unidades`)
            return
        }

        setCart(prev => prev.map(item =>
            item.id === id ? { ...item, quantity } : item
        ))
    }

    const productSubtotal = cart.reduce((acc, item) => acc + (Number(item.salePrice) * item.quantity), 0)
    const comboSubtotal = comboCart.reduce((acc, comboLine) => acc + (Number(comboLine.unitPrice) * comboLine.quantity), 0)
    const subtotal = productSubtotal + comboSubtotal
    const grandTotal = Math.max(0, subtotal - parseThousands(String(discountApplied)))

    const handleScan = (code: string) => {
        const found = products.find(p => p.barcode === code)
        if (!found) {
            toast.error(`Producto no encontrado: ${code}`)
            return
        }

        const availableStock = getAvailableProductStock(found.id)
        if (availableStock <= 0) {
            toast.error(`"${found.name}" no tiene stock disponible en tu almacén`)
            setShowScanner(false)
            return
        }

        const currentInCart = cart.find(item => item.id === found.id)?.quantity ?? 0
        if (currentInCart >= availableStock) {
            toast.error(`Stock máximo alcanzado para "${found.name}" (${availableStock} unidades)`)
            setShowScanner(false)
            return
        }

        addToCart(found)
        setShowScanner(false)
        toast.success(`${found.name} agregado (${currentInCart + 1}/${availableStock})`)
    }

    const pauseSale = async () => {
        if (cart.length === 0 && comboCart.length === 0) {
            toast.error('El carrito está vacío')
            return
        }
        if (selectedCustomer?.isBanned) {
            toast.error('No se puede guardar ni vender con un cliente vetado')
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
                discount: parseThousands(String(discountApplied)),
                status: 'PENDING',
                paymentMethod: 'CASH', // Default for pending
                customerId: selectedCustomer?.id,
                warehouseId,
                items: cart.filter(item => item.quantity > 0).map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    unitPrice: Number(item.salePrice)
                })),
                comboLines: comboCart.map(comboLine => ({
                    comboId: comboLine.comboId,
                    quantity: comboLine.quantity,
                })),
            })

            // If we were resuming an old one, cancel it
            if (resumedSaleId) {
                await api.invoices.cancel(resumedSaleId)
            }

            toast.success('Venta pausada y guardada en la nube ️')

            // Reset
            setCart([])
            setComboCart([])
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

    const resetSale = async () => {
        if (resumedSaleId) {
            try {
                await api.invoices.cancel(resumedSaleId)
                toast.success('Venta pendiente eliminada de la base de datos')
            } catch (e) {
                console.error('Error cancelling resumed sale:', e)
            }
        }

        setCart([])
        setComboCart([])
        setSelectedCustomer(null)
        setResumedSaleId(null)
        setMobileStep(1)
        setMobilePage(1)
        setSearch('')
        setShowResetConfirm(false)
        toast.info('Venta local cancelada')
    }

    const handleCheckout = async () => {
        if (!selectedCustomer) {
            toast.error('Debes seleccionar un cliente')
            return
        }
        if (selectedCustomer.isBanned) {
            const reason = selectedCustomer.banReason?.trim()
            toast.error(reason ? `Cliente vetado. Motivo: ${reason}` : 'Cliente vetado. No se puede vender.')
            return
        }
        if (cart.length === 0 && comboCart.length === 0) {
            toast.error('Debes agregar productos o combos')
            return
        }
        if (!warehouseId) {
            toast.error('No hay almacén seleccionado')
            return
        }

        setProcessing(true)
        try {
            const newInvoice = await api.invoices.create({
                total: grandTotal,
                discount: parseThousands(String(discountApplied)),
                status: 'PAID',
                paymentMethod,
                customerId: selectedCustomer.id,
                warehouseId,
                items: cart.filter(item => item.quantity > 0).map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    unitPrice: Number(item.salePrice)
                })),
                comboLines: comboCart.map(comboLine => ({
                    comboId: comboLine.comboId,
                    quantity: comboLine.quantity,
                })),
                amountReceived: paymentMethod === 'CASH' ? parseThousands(String(amountReceived)) : undefined,
                amountReturned: paymentMethod === 'CASH' ? (parseThousands(String(amountReceived)) - grandTotal) : undefined
            })

            // If we resumed a pending sale, cancel the pending one
            if (resumedSaleId) {
                await api.invoices.cancel(resumedSaleId)
            }

            toast.success('Venta registrada exitosamente')
            setCart([])
            setComboCart([])
            setSelectedCustomer(null)
            setResumedSaleId(null)
            setIsCheckoutOpen(false)
            setMobileStep(1)
            setAmountReceived('')
            setDiscountApplied(0)

            // Redirect to sales history with the new invoice ID to show WhatsApp share
            router.push(`/sales?newSaleId=${newInvoice.id}`)
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

    const filteredCombos = combos.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase())
    )

    // Reset mobile pagination when search changes
    useEffect(() => {
        setMobilePage(1)
    }, [search])

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

            // If time between keystrokes is too long (>100ms), it's likely manual typing, not a scanner
            // Scanners type VERY fast
            if (currentTime - lastKeyTime > 100) {
                buffer = ''
            }

            lastKeyTime = currentTime

            if (e.key === 'Enter') {
                if (buffer.length > 2) { // Minimum length to consider it a barcode
                    e.preventDefault()
                    // Create a synthetic event or just call the handler directly if possible?
                    // Calling handler directly is safer
                    handleScan(buffer)
                    buffer = ''
                }
            } else if (e.key.length === 1) { // Only printable characters
                buffer += e.key
            }
        }

        window.addEventListener('keydown', handleGlobalKeyDown)
        return () => window.removeEventListener('keydown', handleGlobalKeyDown)
    }, [handleScan])

    const canProceedToStep2 = selectedCustomer !== null && !selectedCustomer.isBanned
    const canProceedToStep3 = cart.length > 0 || comboCart.length > 0

    if (isMobile === null) {
        return null
    }

    return (
        <>
            {isResuming && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center animate-spin">
                            <Loader2 className="h-8 w-8 text-white" />
                        </div>
                        <div className="text-center">
                            <p className="font-semibold text-gray-900 text-lg">Reanudando venta</p>
                            <p className="text-sm text-gray-500 mt-1">Por favor espera...</p>
                        </div>
                    </div>
                </div>
            )}

            {isMobile ? (
                <POSMobileView
                    mobileStep={mobileStep}
                    setMobileStep={setMobileStep}
                    selectedCustomer={selectedCustomer}
                    setSelectedCustomer={setSelectedCustomer}
                    cart={cart}
                    comboCart={comboCart}
                    grandTotal={grandTotal}
                    search={search}
                    setSearch={setSearch}
                    filteredProducts={filteredProducts}
                    filteredCombos={filteredCombos}
                    addToCart={addToCart}
                    addComboToCart={addComboToCart}
                    removeFromCart={removeFromCart}
                    removeComboFromCart={removeComboFromCart}
                    updateQuantity={updateQuantity}
                    updateComboQuantity={updateComboQuantity}
                    getAvailableProductStock={getAvailableProductStock}
                    getComboAvailableUnits={getComboAvailableUnits}
                    pauseSale={pauseSale}
                    processing={processing}
                    canProceedToStep2={canProceedToStep2}
                    canProceedToStep3={canProceedToStep3}
                    setShowScanner={setShowScanner}
                    handleCheckout={handleCheckout}
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                    onCreateNewCustomer={() => setShowCreateCustomer(true)}
                    mobilePage={mobilePage}
                    setMobilePage={setMobilePage}
                    onReset={() => setShowResetConfirm(true)}
                    stockMap={stockMap}
                    onShowCashControl={() => setShowCloseCash(true)}
                    onShowCashTransaction={() => setShowCashTransaction(true)}
                    amountReceived={amountReceived}
                    setAmountReceived={setAmountReceived}
                    discountApplied={discountApplied}
                    setDiscountApplied={setDiscountApplied}
                    subtotal={subtotal}
                    comboSubtotal={comboSubtotal}
                />
            ) : (
                <POSDesktopView
                    loading={loading}
                    filteredProducts={filteredProducts}
                    filteredCombos={filteredCombos}
                    allCombos={combos}
                    search={search}
                    setSearch={setSearch}
                    setShowScanner={setShowScanner}
                    goToSales={() => router.push('/sales')}
                    addToCart={addToCart}
                    addComboToCart={addComboToCart}
                    cart={cart}
                    comboCart={comboCart}
                    removeFromCart={removeFromCart}
                    removeComboFromCart={removeComboFromCart}
                    updateQuantity={updateQuantity}
                    updateComboQuantity={updateComboQuantity}
                    getAvailableProductStock={getAvailableProductStock}
                    getComboAvailableUnits={getComboAvailableUnits}
                    grandTotal={grandTotal}
                    selectedCustomer={selectedCustomer}
                    setSelectedCustomer={setSelectedCustomer}
                    pauseSale={pauseSale}
                    onReset={() => setShowResetConfirm(true)}
                    onShowCashControl={() => setShowCloseCash(true)}
                    onShowCashTransaction={() => setShowCashTransaction(true)}
                    processing={processing}
                    setIsCheckoutOpen={setIsCheckoutOpen}
                    stockMap={stockMap}
                    onCreateNewCustomer={() => setShowCreateCustomer(true)}
                    amountReceived={amountReceived}
                    setAmountReceived={setAmountReceived}
                    discountApplied={discountApplied}
                    setDiscountApplied={setDiscountApplied}
                    subtotal={subtotal}
                    comboSubtotal={comboSubtotal}
                />
            )}

            {/* Cash Flow Modals */}
            <CashOpenDialog
                isOpen={showOpenCash}
                onOpenSuccess={() => setShowOpenCash(false)}
            />
            <CashCloseDialog
                isOpen={showCloseCash}
                onClose={() => setShowCloseCash(false)}
                onSuccess={() => { }}
            />

            <CashTransactionDialog
                isOpen={showCashTransaction}
                onClose={() => setShowCashTransaction(false)}
                onSuccess={checkCashStatus}
            />

            <ConfirmDialog
                open={showResetConfirm}
                onOpenChange={setShowResetConfirm}
                onConfirm={resetSale}
                title="¿Cancelar venta actual?"
                description="Se borrarán todos los productos del carrito y el cliente seleccionado. Esta acción no se puede deshacer."
                confirmText="Sí, cancelar"
                cancelText="No, continuar"
            />

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

            {/* Checkout Modal for Desktop */}
            {isCheckoutOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
                    <Card className="w-full max-w-md animate-scale-in">
                        <CardHeader className="text-center pb-2">
                            <CardTitle className="text-xl">Finalizar Venta</CardTitle>
                            <CardDescription>Selecciona el método de pago</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Order Summary */}
                            <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Cliente</span>
                                    <span className="font-medium">{selectedCustomer?.name}</span>
                                </div>
                                {selectedCustomer?.isBanned && (
                                    <div className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg p-2">
                                        Cliente vetado. No se puede finalizar esta venta.
                                        {selectedCustomer.banReason ? ` Motivo: ${selectedCustomer.banReason}` : ''}
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Productos</span>
                                    <span className="font-medium">{cart.length + comboCart.length} items</span>
                                </div>
                                <div className="pt-2 border-t flex justify-between">
                                    <span className="text-lg font-semibold">Total</span>
                                    <span className="text-2xl font-bold text-gray-900">${formatThousands(grandTotal)}</span>
                                </div>
                            </div>

                            {/* Payment Methods */}
                            <div>
                                <Label className="text-sm font-medium mb-3 block">Método de Pago</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { value: 'CASH', label: 'Efectivo', icon: '' },
                                        { value: 'CARD', label: 'Tarjeta', icon: '' },
                                        { value: 'TRANSFER', label: 'Transferencia', icon: '' },
                                        { value: 'OTHER', label: 'Otro', icon: '' }
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

                            {/* Cambio / Vuelto (Desktop Modal) */}
                            {paymentMethod === 'CASH' && (
                                <div className="space-y-3 pt-2 p-4 bg-gray-50/50 rounded-xl border-dashed border-2 border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="space-y-1">
                                        <Label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Monto Recibido</Label>
                                        <Input
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="Ingresa cuánto recibes..."
                                            value={amountReceived}
                                            onChange={(e) => setAmountReceived(formatThousands(e.target.value))}
                                            className="h-12 text-xl font-bold bg-white"
                                            autoFocus
                                        />
                                    </div>
                                    {parseThousands(String(amountReceived)) >= grandTotal && (
                                        <div className="p-4 bg-blue-600 text-white rounded-xl flex justify-between items-center shadow-lg animate-in zoom-in duration-300">
                                            <div className="flex flex-col">
                                                <span className="text-xs opacity-80 font-bold uppercase">Cambio a devolver</span>
                                                <span className="text-3xl font-black leading-none">
                                                    ${formatThousands(parseThousands(String(amountReceived)) - grandTotal)}
                                                </span>
                                            </div>
                                            <div className="text-3xl"></div>
                                        </div>
                                    )}
                                    {amountReceived && parseThousands(String(amountReceived)) < grandTotal && (
                                        <div className="text-center p-2 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100">
                                            Falta ${formatThousands(grandTotal - parseThousands(String(amountReceived)))} para completar el pago
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setIsCheckoutOpen(false)}
                                    disabled={processing}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    className="flex-1 h-12 text-base font-bold"
                                    onClick={handleCheckout}
                                    disabled={processing || !!selectedCustomer?.isBanned}
                                >
                                    {processing ? 'Procesando...' : ' Confirmar Venta'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {showCreateCustomer && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <Card className="w-full max-w-md animate-scale-in">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserPlus className="h-5 w-5" />
                                Nuevo Cliente
                            </CardTitle>
                            <CardDescription>Todos los campos marcados con * son obligatorios</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nombre Completo <span className="text-red-500">*</span></label>
                                <Input
                                    placeholder="Ej: Juan Pérez"
                                    value={newCustomerName}
                                    onChange={(e) => setNewCustomerName(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">DNI / CC / NIT <span className="text-red-500">*</span></label>
                                <Input
                                    placeholder="Ej: 1234567890"
                                    value={newCustomerDoc}
                                    onChange={(e) => setNewCustomerDoc(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Teléfono <span className="text-red-500">*</span></label>
                                <div className="flex gap-2">
                                    <Select value={newCustomerCountryCode} onValueChange={setNewCustomerCountryCode}>
                                        <SelectTrigger className="w-[120px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="z-[60]">
                                            {COUNTRIES.map(c => (
                                                <SelectItem key={c.code} value={c.code}>
                                                    {c.flag} +{c.code}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        placeholder="Ej: 3001234567"
                                        value={newCustomerPhone}
                                        onChange={(e) => setNewCustomerPhone(e.target.value)}
                                        className="flex-1"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => {
                                        setShowCreateCustomer(false)
                                        setNewCustomerName('')
                                        setNewCustomerDoc('')
                                        setNewCustomerPhone('')
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
                                        if (!newCustomerDoc.trim()) {
                                            toast.error('El documento es obligatorio')
                                            return
                                        }
                                        if (!newCustomerPhone.trim()) {
                                            toast.error('El teléfono es obligatorio')
                                            return
                                        }

                                        setCreatingCustomer(true)
                                        try {
                                            const created = await api.customers.create({
                                                name: newCustomerName.trim(),
                                                docNumber: newCustomerDoc.trim(),
                                                phone: `+${newCustomerCountryCode}${newCustomerPhone.replace(/\D/g, '')}`
                                            })
                                            setSelectedCustomer(created)
                                            setShowCreateCustomer(false)
                                            setNewCustomerName('')
                                            setNewCustomerDoc('')
                                            setNewCustomerPhone('')
                                            toast.success('Cliente creado exitosamente')
                                        } catch (e: any) {
                                            toast.error(e.message || 'Error al crear cliente. Verifica que el documento no esté duplicado.')
                                        } finally {
                                            setCreatingCustomer(false)
                                        }
                                    }}
                                    disabled={creatingCustomer || !newCustomerName.trim() || !newCustomerDoc.trim() || !newCustomerPhone.trim()}
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

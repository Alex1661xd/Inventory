'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api, type Product } from '@/lib/backend'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from 'sonner'
import { CustomerSelector } from '@/components/customer-selector'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Scan, X, Plus, Minus, Trash2, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CartItem extends Product {
    quantity: number
}

interface Customer {
    id: string
    name: string
    docNumber?: string
}

export default function POSPage() {
    const searchParams = useSearchParams()
    const router = useRouter()

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

    useEffect(() => {
        loadData()

        // Check for resume param
        const resumeId = searchParams.get('resume')
        if (resumeId) {
            loadResumedSale(resumeId)
        }
    }, [searchParams])

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

    // Mobile view
    const MobileView = () => (
        <div className="flex flex-col h-[calc(100vh-80px)] bg-gray-50">
            {/* Progress Steps */}
            <div className="bg-white border-b px-4 py-3">
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
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Cliente</span>
                    <span>Productos</span>
                    <span>Pago</span>
                </div>
            </div>

            {/* Step Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {mobileStep === 1 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Seleccionar Cliente</CardTitle>
                            <CardDescription>Elige un cliente existente o crea uno nuevo</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <CustomerSelector onSelect={setSelectedCustomer} />
                            {selectedCustomer && (
                                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                                    <div className="flex items-center gap-2 text-emerald-700">
                                        <span className="text-2xl">✓</span>
                                        <div>
                                            <div className="font-bold">{selectedCustomer.name}</div>
                                            {selectedCustomer.docNumber && (
                                                <div className="text-sm">{selectedCustomer.docNumber}</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
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
                                    >
                                        <Scan className="h-4 w-4" />
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
                                                <div className="text-xs text-muted-foreground">{product.barcode}</div>
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
                                    <div className="text-xs text-muted-foreground mb-1">Cliente</div>
                                    <div className="font-medium">{selectedCustomer?.name}</div>
                                </div>

                                {/* Items */}
                                <div>
                                    <div className="text-xs text-muted-foreground mb-2">Productos ({cart.length})</div>
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

            {/* Bottom Navigation */}
            <div className="bg-white border-t p-4 space-y-2">
                {mobileStep === 3 ? (
                    <Button
                        size="lg"
                        className="w-full h-14 text-lg font-bold"
                        onClick={handleCheckout}
                        disabled={processing}
                    >
                        {processing ? 'Procesando...' : 'CONFIRMAR VENTA'}
                    </Button>
                ) : (
                    <Button
                        size="lg"
                        className="w-full h-14 text-lg font-bold"
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

                {mobileStep > 1 && (
                    <Button
                        variant="outline"
                        size="lg"
                        className="w-full"
                        onClick={() => setMobileStep(mobileStep - 1)}
                    >
                        <ChevronLeft className="mr-2 h-5 w-5" />
                        Atrás
                    </Button>
                )}

                {cart.length > 0 && mobileStep === 2 && (
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
    )

    // Desktop view (original)
    const DesktopView = () => (
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
                            onClick={() => router.push('/sales')}
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
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            Cargando productos...
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
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
                                                    <div className="text-xs text-muted-foreground truncate">{product.barcode}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3 text-sm text-muted-foreground hidden sm:table-cell">
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
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <div className="text-5xl mb-2">🛒</div>
                            <p className="text-sm">Carrito vacío</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1 min-w-0 pr-2">
                                        <div className="font-medium text-sm">{item.name}</div>
                                        <div className="text-xs text-muted-foreground">
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

    return (
        <>
            {/* Responsive: Mobile on small screens, Desktop on large */}
            <div className="md:hidden">
                <MobileView />
            </div>
            <div className="hidden md:block">
                <DesktopView />
            </div>

            {/* Scanner Modal */}
            {showScanner && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
                        <div className="mb-4">
                            <h3 className="text-lg font-bold mb-2">Escanear Código de Barras</h3>
                            <Input
                                placeholder="Ingresa o escanea el código..."
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const target = e.target as HTMLInputElement
                                        if (target.value) {
                                            handleScan(target.value)
                                            target.value = ''
                                        }
                                    }
                                }}
                                className="h-12 text-lg"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setShowScanner(false)}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

'use client'

import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import JsBarcode from 'jsbarcode'
import { jsPDF } from 'jspdf'
import { api, type Product } from '@/lib/backend'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { Printer, Loader2, ShieldAlert, CheckCircle2, Trash2, Info, AlertTriangle } from 'lucide-react'

type BarcodeSize = 'small' | 'medium' | 'large'

type BarcodePrintItem = {
    product: Product
    copies: number
    size: BarcodeSize
}

const BARCODE_SIZES = {
    small: { width: 2, height: 50, fontSize: 12, label: 'Pequeño', pdfWidth: 50, pdfHeight: 25 },
    medium: { width: 2.5, height: 70, fontSize: 14, label: 'Mediano', pdfWidth: 70, pdfHeight: 35 },
    large: { width: 3, height: 100, fontSize: 18, label: 'Grande', pdfWidth: 90, pdfHeight: 50 },
}

const MAX_BARCODES = 500
const DPI_MULTIPLIER = 3

function GeneratingModal({ isOpen, total }: { isOpen: boolean; total: number }) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl p-10 shadow-2xl flex flex-col items-center gap-6 max-w-sm w-full mx-4 animate-in zoom-in-95 duration-300">
                <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gray-900 flex items-center justify-center shadow-xl animate-bounce">
                        <Printer className="h-10 w-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                </div>

                <div className="text-center space-y-2">
                    <h3 className="text-2xl font-black text-gray-900">Generando PDF</h3>
                    <p className="text-gray-500 font-medium font-mono text-sm bg-gray-100 px-3 py-1 rounded-full inline-block">
                        Procesando {total} etiquetas
                    </p>
                </div>

                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-900 animate-pulse w-full" />
                </div>

                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Casi listo...</p>
            </div>
        </div>
    )
}

export function BarcodePrintPage() {
    const router = useRouter()
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(false)
    const [generating, setGenerating] = useState(false)
    const [search, setSearch] = useState('')
    const [selectedItems, setSelectedItems] = useState<BarcodePrintItem[]>([])

    useEffect(() => {
        loadProducts()
    }, [])

    const loadProducts = async () => {
        setLoading(true)
        try {
            const data = await api.products.list()
            // Only products with barcodes
            setProducts(data.filter(p => p.barcode))
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    const filteredProducts = useMemo(() => {
        const q = search.trim().toLowerCase()
        if (!q) return products
        return products.filter(p => {
            const haystack = [p.name, p.sku ?? '', p.barcode ?? ''].join(' ').toLowerCase()
            return haystack.includes(q)
        })
    }, [products, search])

    const addProduct = (product: Product) => {
        const existing = selectedItems.find(item => item.product.id === product.id)
        if (existing) {
            setSelectedItems(prev =>
                prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, copies: item.copies + 1 }
                        : item
                )
            )
        } else {
            setSelectedItems(prev => [...prev, { product, copies: 1, size: 'medium' }])
        }
    }

    const removeProduct = (productId: string) => {
        setSelectedItems(prev => prev.filter(item => item.product.id !== productId))
    }

    const updateCopies = (productId: string, copies: number) => {
        // Permitir 0 temporalmente para facilitar la edición (borrar el contenido)
        const safeCopies = isNaN(copies) ? 0 : Math.max(0, copies)

        setSelectedItems(prev =>
            prev.map(item =>
                item.product.id === productId
                    ? { ...item, copies: safeCopies }
                    : item
            )
        )
    }

    const updateSize = (productId: string, size: BarcodeSize) => {
        setSelectedItems(prev =>
            prev.map(item =>
                item.product.id === productId
                    ? { ...item, size }
                    : item
            )
        )
    }

    const totalBarcodes = selectedItems.reduce((acc, item) => acc + item.copies, 0)

    const generateHighResBarcode = (barcode: string, productName: string, sizeConfig: typeof BARCODE_SIZES['medium']) => {
        const canvas = document.createElement('canvas')

        // Generate at higher resolution for crisp output
        JsBarcode(canvas, barcode, {
            format: 'CODE128',
            displayValue: true,
            lineColor: '#000000',
            background: '#ffffff',
            width: sizeConfig.width * DPI_MULTIPLIER,
            height: sizeConfig.height * DPI_MULTIPLIER,
            fontSize: sizeConfig.fontSize * DPI_MULTIPLIER,
            margin: 10 * DPI_MULTIPLIER,
            text: `${productName.substring(0, 30)}${productName.length > 30 ? '...' : ''}\n${barcode}`,
            textMargin: 5 * DPI_MULTIPLIER,
        })

        return canvas
    }

    const generatePDF = async () => {
        if (selectedItems.length === 0) {
            toast.error('Selecciona al menos un producto')
            return
        }

        if (totalBarcodes > MAX_BARCODES) {
            toast.error(`Límite excedido. El sistema permite un máximo de ${MAX_BARCODES} códigos por PDF.`)
            return
        }

        setGenerating(true)
        // Give UI time to show the modal
        await new Promise(resolve => setTimeout(resolve, 600))

        try {
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'letter'
            })

            const pageWidth = pdf.internal.pageSize.getWidth()
            const pageHeight = pdf.internal.pageSize.getHeight()
            const margin = 15
            const gap = 5

            let currentY = margin
            let isFirstPage = true

            for (const item of selectedItems) {
                const sizeConfig = BARCODE_SIZES[item.size]
                const barcodeWidthMM = sizeConfig.pdfWidth
                const barcodeHeightMM = sizeConfig.pdfHeight

                // Calculate how many barcodes fit per row for this product's size
                const usableWidth = pageWidth - 2 * margin
                const barcodesPerRow = Math.floor(usableWidth / (barcodeWidthMM + gap))
                const actualBarcodeWidth = (usableWidth - (barcodesPerRow - 1) * gap) / barcodesPerRow

                // Check if we need a new page for the header
                if (currentY + 15 + barcodeHeightMM > pageHeight - margin) {
                    pdf.addPage()
                    currentY = margin
                    isFirstPage = false
                }

                // Draw product section header
                pdf.setFillColor(245, 243, 240)
                pdf.roundedRect(margin, currentY, pageWidth - 2 * margin, 12, 2, 2, 'F')
                pdf.setFontSize(11)
                pdf.setFont('helvetica', 'bold')
                pdf.setTextColor(40, 40, 40)
                pdf.text(`${item.product.name}`, margin + 5, currentY + 8)
                pdf.setFontSize(9)
                pdf.setFont('helvetica', 'normal')
                pdf.setTextColor(100, 100, 100)
                const sizeLabel = BARCODE_SIZES[item.size].label
                pdf.text(`${item.copies} ${item.copies === 1 ? 'copia' : 'copias'} - ${sizeLabel}`, pageWidth - margin - 45, currentY + 8)

                currentY += 18
                let currentX = margin
                let currentInRow = 0

                // Generate barcodes for this product
                for (let i = 0; i < item.copies; i++) {
                    // Check if we need a new row
                    if (currentInRow >= barcodesPerRow) {
                        currentY += barcodeHeightMM + gap
                        currentX = margin
                        currentInRow = 0
                    }

                    // Check if we need a new page
                    if (currentY + barcodeHeightMM > pageHeight - margin) {
                        pdf.addPage()
                        currentY = margin
                        currentX = margin
                        currentInRow = 0
                        isFirstPage = false
                    }

                    try {
                        // Generate high resolution barcode
                        const canvas = generateHighResBarcode(item.product.barcode!, item.product.name, sizeConfig)
                        const imgData = canvas.toDataURL('image/png', 1.0)

                        // Add to PDF with high quality
                        pdf.addImage(imgData, 'PNG', currentX, currentY, actualBarcodeWidth, barcodeHeightMM, undefined, 'FAST')

                        currentX += actualBarcodeWidth + gap
                        currentInRow++
                    } catch (e) {
                        console.error('Error generating barcode for', item.product.name, e)
                    }
                }

                // Reset for next product
                currentY += barcodeHeightMM + gap + 5
            }

            // Download PDF
            const timestamp = new Date().toISOString().slice(0, 10)
            pdf.save(`codigos-barras-${timestamp}.pdf`)

            toast.success('PDF generado correctamente')
        } catch (e: any) {
            console.error(e)
            toast.error('Error al generar el PDF')
        } finally {
            setGenerating(false)
        }
    }

    return (
        <div className="space-y-8 animate-fade-in pb-20 md:pb-0">
            <GeneratingModal isOpen={generating} total={totalBarcodes} />
            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>
                        🖨️ Imprimir Códigos de Barras
                    </h2>
                    <p className="text-gray-500 text-sm md:text-lg">
                        Selecciona productos, configura copias y tamaño por cada uno, y genera un PDF para imprimir.
                    </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center self-end">
                    <Button variant="outline" onClick={() => router.back()} className="group">
                        <span className="mr-2">←</span>
                        Volver
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Left Panel - Product Selection */}
                <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-[rgb(230,225,220)] overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 250px)' }}>
                    <div className="p-4 border-b border-[rgb(230,225,220)] flex-shrink-0">
                        <Label className="text-xs font-medium text-gray-500 mb-2 block">Buscar Productos</Label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                <span className="text-lg">🔍</span>
                            </div>
                            <Input
                                placeholder="Nombre, SKU o código..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 h-10"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {loading ? (
                            <div className="flex items-center justify-center py-10 text-gray-500">
                                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Cargando productos...
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">
                                No se encontraron productos con código de barras
                            </div>
                        ) : (
                            filteredProducts.map((product) => {
                                const isSelected = selectedItems.some(item => item.product.id === product.id)
                                return (
                                    <div
                                        key={product.id}
                                        onClick={() => addProduct(product)}
                                        className={cn(
                                            "p-3 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md",
                                            isSelected
                                                ? "bg-emerald-50 border-emerald-200"
                                                : "bg-white border-[rgb(230,225,220)] hover:border-gray-300"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {product.imageUrl ? (
                                                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-2xl">📦</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm text-gray-900 truncate">{product.name}</div>
                                                <div className="text-xs text-gray-500 font-mono">{product.barcode}</div>
                                            </div>
                                            {isSelected && (
                                                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* Right Panel - Selected Products & Options */}
                <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-[rgb(230,225,220)] overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 250px)' }}>
                    <div className="p-4 border-b border-[rgb(230,225,220)] flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-900 text-lg">Productos Seleccionados</span>
                            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{selectedItems.length} productos • {totalBarcodes} códigos</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {selectedItems.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">
                                <div className="text-5xl mb-3">📋</div>
                                <p className="text-sm font-medium">No hay productos seleccionados</p>
                                <p className="text-xs mt-1">Haz clic en los productos de la izquierda para agregarlos</p>
                            </div>
                        ) : (
                            selectedItems.map((item) => (
                                <div
                                    key={item.product.id}
                                    className="p-4 rounded-xl bg-white border border-[rgb(230,225,220)] shadow-sm space-y-3"
                                >
                                    {/* Product Info Row */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {item.product.imageUrl ? (
                                                <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xl">📦</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm text-gray-900 truncate">{item.product.name}</div>
                                            <div className="text-xs text-gray-500 font-mono">{item.product.barcode}</div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                                            onClick={() => removeProduct(item.product.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {/* Controls Row */}
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        {/* Copies Control */}
                                        <div className="flex items-center gap-2 flex-1">
                                            <Label className="text-xs text-gray-500 whitespace-nowrap">Copias:</Label>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => updateCopies(item.product.id, item.copies - 1)}
                                                >
                                                    -
                                                </Button>
                                                <Input
                                                    type="number"
                                                    value={item.copies === 0 ? '' : item.copies}
                                                    onChange={(e) => updateCopies(item.product.id, parseInt(e.target.value))}
                                                    className="w-16 h-8 text-center text-sm font-bold"
                                                    min={1}
                                                />
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => updateCopies(item.product.id, item.copies + 1)}
                                                >
                                                    +
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Size Control */}
                                        <div className="flex items-center gap-2 flex-1">
                                            <Label className="text-xs text-gray-500 whitespace-nowrap">Tamaño:</Label>
                                            <div className="flex gap-1 flex-1">
                                                {(Object.keys(BARCODE_SIZES) as BarcodeSize[]).map((size) => (
                                                    <button
                                                        key={size}
                                                        onClick={() => updateSize(item.product.id, size)}
                                                        className={cn(
                                                            "flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all",
                                                            item.size === size
                                                                ? "bg-gray-900 text-white shadow"
                                                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                        )}
                                                    >
                                                        {BARCODE_SIZES[size].label.charAt(0)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-[rgb(230,225,220)] flex-shrink-0 bg-white/80">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-500 font-medium">Total de códigos:</span>
                            <span className={cn(
                                "text-3xl font-black transition-colors",
                                totalBarcodes > MAX_BARCODES ? "text-red-600 animate-pulse" : "text-gray-900"
                            )}>
                                {totalBarcodes}
                            </span>
                        </div>

                        {totalBarcodes > MAX_BARCODES && (
                            <div className="flex items-center gap-2 text-red-500 text-[10px] font-bold mb-3 justify-end animate-in fade-in slide-in-from-right-2">
                                <ShieldAlert className="h-3.5 w-3.5" />
                                <span>LÍMITE DE {MAX_BARCODES} EXCEDIDO</span>
                            </div>
                        )}

                        <Button
                            onClick={generatePDF}
                            disabled={generating || selectedItems.length === 0 || totalBarcodes > MAX_BARCODES}
                            className={cn(
                                "w-full h-12 text-lg font-bold shadow-xl transition-all",
                                totalBarcodes > MAX_BARCODES
                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    : "bg-gray-900 hover:bg-gray-800 text-white"
                            )}
                        >
                            {generating ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Generando...
                                </span>
                            ) : totalBarcodes > MAX_BARCODES ? (
                                "Reducir Cantidad"
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Printer className="h-5 w-5" />
                                    Descargar PDF
                                </span>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Info Section */}
            <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-[rgb(230,225,220)]">
                <div className="flex gap-4">
                    <div className="text-4xl">💡</div>
                    <div>
                        <h3 className="font-bold text-lg mb-2 text-gray-900">¿Cómo funciona?</h3>
                        <ul className="text-gray-600 space-y-1 text-sm">
                            <li>• Selecciona los productos haciendo clic en ellos en el panel izquierdo</li>
                            <li>• Ajusta la cantidad de copias y el tamaño del código para cada producto individualmente</li>
                            <li>• Los tamaños son: <strong>P</strong>equeño, <strong>M</strong>ediano y <strong>G</strong>rande</li>
                            <li>• El PDF se generará con una sección por cada producto, con todos sus códigos agrupados</li>
                            <li>• Los códigos se generan en alta resolución para una impresión nítida</li>
                            <li className="text-amber-600 font-bold">• El límite máximo por PDF es de {MAX_BARCODES} códigos de barras</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

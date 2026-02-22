'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, notFound } from 'next/navigation'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ImageSlider } from "@/components/ui/image-slider"
import { Package, Search, Info, CheckCircle2, MessageSquare, ArrowUpRight } from 'lucide-react'

interface CatalogProduct {
    id: string
    name: string
    description: string | null
    images: string[]
    price: number
    categoryId: string | null
    categoryName: string
    available: boolean
    type?: 'PRODUCT' | 'COMBO'
    originalPrice?: number
    discountAmount?: number
    discountPercent?: number
    createdAt?: string
    comboItems?: Array<{
        productId: string
        productName: string
        quantity: number
    }>
}

interface Category {
    id: string
    name: string
}

interface CatalogData {
    business: {
        name: string
        slug: string
        description: string
        bgColor: string
        accentColor: string
        whatsApp: string
    }
    categories: Category[]
    products: CatalogProduct[]
    totalProducts: number
    availableProducts: number
}

function formatPrice(price: number) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price)
}

function isRecentlyCreated(createdAt?: string, days = 14) {
    if (!createdAt) return false
    const created = new Date(createdAt).getTime()
    if (Number.isNaN(created)) return false
    const now = Date.now()
    const diffDays = (now - created) / (1000 * 60 * 60 * 24)
    return diffDays >= 0 && diffDays <= days
}

export default function CatalogPage() {
    const params = useParams()
    const slug = params.slug as string

    const [catalog, setCatalog] = useState<CatalogData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [showOnlyAvailable, setShowOnlyAvailable] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 20

    useEffect(() => {
        setCurrentPage(1)
    }, [selectedCategory, searchQuery, showOnlyAvailable])

    useEffect(() => {
        if (!slug) return

        const fetchCatalog = async () => {
            let backendHost = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'
            if (backendHost.endsWith('/')) {
                backendHost = backendHost.slice(0, -1)
            }
            const targetUrl = `${backendHost}/catalog/public/${slug}`

            try {
                const res = await fetch(targetUrl, {
                    cache: 'no-store'
                })

                if (!res.ok) {
                    if (res.status === 404) {
                        notFound()
                    } else {
                        setError('Error al cargar el catálogo')
                    }
                    return
                }

                const data = await res.json()
                setCatalog(data)
            } catch (err: any) {
                if (err?.digest === 'NEXT_NOT_FOUND' || err?.message === 'NEXT_NOT_FOUND') {
                    throw err;
                }
                setError('Error de conexión')
            } finally {
                setLoading(false)
            }
        }

        fetchCatalog()
    }, [slug])

    const filteredProducts = useMemo(() => {
        if (!catalog) return []

        return catalog.products.filter(product => {
            const matchesCategory = !selectedCategory ||
                (selectedCategory === 'combos' ? product.type === 'COMBO' : product.categoryId === selectedCategory)
            const matchesSearch = !searchQuery ||
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesAvailability = !showOnlyAvailable || product.available

            return matchesCategory && matchesSearch && matchesAvailability
        })
    }, [catalog, selectedCategory, searchQuery, showOnlyAvailable])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
                <div className="flex flex-col items-center gap-6 animate-pulse">
                    <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
                        <Package className="w-8 h-8 text-[hsl(var(--primary))]" />
                    </div>
                    <div className="h-2 w-32 bg-[hsl(var(--border))] rounded-full"></div>
                </div>
            </div>
        )
    }

    if (error || !catalog) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] p-6">
                <div className="text-center max-w-sm animate-scale-in">
                    <div className="w-20 h-20 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <Info className="w-10 h-10" />
                    </div>
                    <h1 className="text-2xl font-black text-[hsl(var(--foreground))] mb-2 tracking-tight">
                        {error || 'Catálogo no disponible'}
                    </h1>
                    <p className="text-[hsl(var(--muted))] font-medium">
                        Este catálogo no existe o ha sido desactivado temporalmente por el propietario.
                    </p>
                </div>
            </div>
        )
    }

    const { business, categories } = catalog

    return (
        <div
            className="min-h-screen flex flex-col selection:bg-[hsl(var(--primary)/0.1)] selection:text-[hsl(var(--primary))]"
            style={{ backgroundColor: business.bgColor }}
        >
            {/* Header */}
            <header
                className="sticky top-0 z-50 shadow-2xl transition-all duration-300"
                style={{ backgroundColor: business.accentColor }}
            >
                <div className="max-w-7xl mx-auto px-6 py-4 md:py-6">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>
                            {business.name}
                        </h1>
                        {business.description && (
                            <p className="text-white/70 text-sm md:text-base max-w-2xl mx-auto font-medium leading-relaxed">
                                {business.description}
                            </p>
                        )}
                    </div>
                </div>
            </header>

            {/* Search & Filters */}
            <div className="sticky top-[68px] md:top-[88px] z-40 bg-white/70 backdrop-blur-xl border-b border-[hsl(var(--border)/0.5)] shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
                    <div className="flex flex-col gap-4">
                        {/* Search */}
                        <div className="w-full relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted))] group-focus-within:text-[hsl(var(--primary))] transition-colors" />
                            <input
                                type="text"
                                placeholder="Buscar en el catálogo..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] focus:outline-none transition-all text-sm font-medium bg-white/50"
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="w-full flex gap-2 overflow-x-auto pb-2 no-scrollbar px-0.5">
                            {/* Todos */}
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={cn(
                                    "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0 border-2",
                                    !selectedCategory
                                        ? "text-white shadow-lg scale-105 border-transparent"
                                        : "bg-white text-stone-400 border-stone-200 hover:bg-stone-50"
                                )}
                                style={!selectedCategory ? { backgroundColor: business.accentColor } : {}}
                            >
                                Todos
                            </button>

                            {/* Combos Specialized Filter */}
                            <button
                                onClick={() => setSelectedCategory('combos')}
                                className={cn(
                                    "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0 border-2",
                                    selectedCategory === 'combos'
                                        ? "text-white shadow-lg scale-105 border-transparent"
                                        : "bg-white text-stone-400 border-stone-200 hover:bg-stone-50"
                                )}
                                style={selectedCategory === 'combos' ? { backgroundColor: business.accentColor } : {}}
                            >
                                Combos
                            </button>

                            {/* Dynamic Categories */}
                            {categories
                                .filter(cat => cat.name.toLowerCase() !== 'combos' && cat.name.toLowerCase() !== 'combo')
                                .map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={cn(
                                            "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border-2",
                                            selectedCategory === cat.id
                                                ? "text-white shadow-lg scale-105 border-transparent"
                                                : "bg-white text-stone-400 border-stone-200 hover:bg-stone-50"
                                        )}
                                        style={selectedCategory === cat.id ? { backgroundColor: business.accentColor } : {}}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                        </div>
                    </div>

                    {/* Availability Toggle */}
                    <div className="flex items-center justify-between mt-4">
                        <label className="flex items-center gap-2.5 cursor-pointer group select-none">
                            <div className={cn(
                                "w-10 h-5 rounded-full transition-all relative",
                                showOnlyAvailable ? "bg-emerald-500" : "bg-[hsl(var(--border))]"
                            )}>
                                <div className={cn(
                                    "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                                    showOnlyAvailable ? "left-6" : "left-1"
                                )} />
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={showOnlyAvailable}
                                    onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                                />
                            </div>
                            <span className="text-xs font-bold text-[hsl(var(--muted))] uppercase tracking-widest group-hover:text-[hsl(var(--foreground))] transition-colors">Solo Disponibles</span>
                        </label>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--muted))] opacity-60">
                            {filteredProducts.length} mallas encontradas
                        </span>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <main className="max-w-7xl mx-auto px-4 py-8 flex-grow w-full">
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-24 animate-scale-in">
                        <div className="w-24 h-24 bg-[hsl(var(--muted-light))] rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="w-10 h-10 text-[hsl(var(--muted))]" />
                        </div>
                        <h3 className="text-2xl font-black text-[hsl(var(--foreground))] tracking-tight">Sin resultados</h3>
                        <p className="text-[hsl(var(--muted))] font-medium mt-2">Intenta ajustar tus filtros de búsqueda.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((product) => (
                                <div
                                    key={product.id}
                                    onClick={() => setSelectedProduct(product)}
                                    className={cn(
                                        "group bg-white rounded-2xl shadow-sm relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer",
                                        !product.available && "opacity-70"
                                    )}
                                >
                                    {isRecentlyCreated(product.createdAt) && (
                                        <div className="absolute -top-4 -left-4 z-40 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] drop-shadow-[0_0_1px_rgba(255,255,255,1)] animate-pulse-subtle">
                                            <div
                                                className="w-14 h-14 bg-red-600 flex items-center justify-center relative hover:scale-110 transition-transform duration-300 cursor-default"
                                                style={{
                                                    clipPath: 'polygon(50% 0%, 58% 12%, 71% 7%, 75% 20%, 88% 18%, 88% 31%, 100% 33%, 94% 45%, 100% 57%, 88% 59%, 88% 72%, 75% 70%, 71% 83%, 58% 78%, 50% 90%, 42% 78%, 29% 83%, 25% 70%, 12% 72%, 12% 59%, 0% 57%, 6% 45%, 0% 33%, 12% 31%, 12% 18%, 25% 20%, 29% 7%, 42% 12%)',
                                                }}
                                            >
                                                <span className="text-[11px] font-black text-white tracking-tighter">NEW</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Product Image (Slider) */}
                                    <div className="relative aspect-square bg-stone-100 overflow-hidden rounded-t-2xl">
                                        <ImageSlider
                                            images={product.images}
                                            name={product.name}
                                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                            quality={90}
                                        />



                                        {/* Availability Badge */}
                                        <div
                                            className={cn(
                                                "absolute top-2 right-2 px-2 py-1 rounded-full text-[10px] md:text-xs font-medium backdrop-blur-sm z-30",
                                                product.available
                                                    ? "bg-green-500/90 text-white"
                                                    : "bg-red-500/90 text-white"
                                            )}
                                        >
                                            {product.available ? '✓ Disponible' : '✕ Agotado'}
                                        </div>

                                        {/* Category Tag */}
                                        <div className="absolute bottom-2 left-2 px-2 py-1 rounded-full text-[10px] md:text-xs font-medium bg-black/50 text-white backdrop-blur-sm z-30">
                                            {product.categoryName}
                                        </div>

                                        {product.type === 'COMBO' && (
                                            <div className="absolute bottom-2 right-2 px-2 py-1 rounded-full text-[10px] md:text-xs font-black bg-amber-500/90 text-white backdrop-blur-sm z-30">
                                                COMBO
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-3 md:p-4">
                                        <h3 className="font-semibold text-stone-800 line-clamp-2 text-sm md:text-base leading-tight">
                                            {product.name}
                                        </h3>
                                        {product.description && (
                                            <p className="mt-1 text-xs text-stone-500 line-clamp-2">
                                                {product.description}
                                            </p>
                                        )}
                                        {product.type === 'COMBO' && (product.discountAmount || 0) > 0 && (
                                            <div className="mt-1 text-[10px] font-black uppercase tracking-wider text-emerald-700">
                                                Ahorras {formatPrice(Number(product.discountAmount || 0))}
                                            </div>
                                        )}
                                        <p
                                            className="mt-2 text-lg md:text-xl font-bold"
                                            style={{ color: business.accentColor }}
                                        >
                                            {formatPrice(product.price)}
                                        </p>
                                        {product.type === 'COMBO' && (product.originalPrice || 0) > product.price && (
                                            <p className="text-xs text-stone-500 line-through">
                                                Antes {formatPrice(Number(product.originalPrice || 0))}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {filteredProducts.length > itemsPerPage && (
                            <div className="mt-12 flex justify-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 rounded-xl bg-white border border-stone-200 text-sm font-bold disabled:opacity-50 hover:bg-stone-50 transition-colors"
                                >
                                    Anterior
                                </button>
                                <span className="px-4 py-2 text-sm font-medium text-stone-500 flex items-center">
                                    Página {currentPage} de {Math.ceil(filteredProducts.length / itemsPerPage)}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredProducts.length / itemsPerPage), p + 1))}
                                    disabled={currentPage === Math.ceil(filteredProducts.length / itemsPerPage)}
                                    className="px-4 py-2 rounded-xl bg-white border border-stone-200 text-sm font-bold disabled:opacity-50 hover:bg-stone-50 transition-colors"
                                >
                                    Siguiente
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Product Modal */}
            <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
                <DialogContent className="w-screen h-screen md:h-auto md:max-w-5xl p-0 overflow-hidden rounded-none md:rounded-[3rem] border-none bg-white shadow-none md:shadow-2xl animate-scale-in flex flex-col [&>button]:top-14 md:[&>button]:top-8 [&>button]:right-6 [&>button]:bg-white/90 [&>button]:backdrop-blur-md [&>button]:rounded-full [&>button]:p-2 [&>button]:shadow-xl [&>button]:z-[60]">
                    {selectedProduct && (
                        <div className="flex flex-col md:flex-row h-full md:max-h-[90vh]">
                            {/* Left: Image Slider */}
                            <div className="w-full md:w-[60%] h-[40vh] md:h-auto relative bg-[hsl(var(--muted-light))]">
                                <ImageSlider
                                    images={selectedProduct.images}
                                    name={selectedProduct.name}
                                    interval={5000}
                                    showControls={true}
                                    allowZoom={true}
                                    sizes="(max-width: 768px) 100vw, 60vw"
                                    quality={95}
                                />
                                <div className={cn(
                                    "absolute top-14 left-6 md:top-8 md:left-8 px-4 py-1.5 md:px-5 md:py-2 rounded-2xl text-[10px] font-black tracking-[0.2em] text-white z-40 shadow-2xl",
                                    selectedProduct.available ? "bg-emerald-500" : "bg-red-500"
                                )}>
                                    {selectedProduct.available ? "DISPONIBLE AHORA" : "CONSULTAR DISPONIBILIDAD"}
                                </div>
                            </div>

                            {/* Right: Info */}
                            <div className="w-full md:w-[40%] p-8 md:p-12 flex flex-col justify-between overflow-y-auto">
                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <div
                                            className="inline-flex px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest"
                                            style={{ backgroundColor: `${business.accentColor}10`, color: business.accentColor }}
                                        >
                                            {selectedProduct.categoryName}
                                        </div>
                                        <DialogTitle className="text-4xl font-black text-[hsl(var(--foreground))] tracking-tighter leading-none" style={{ fontFamily: 'var(--font-display)' }}>
                                            {selectedProduct.name}
                                        </DialogTitle>
                                    </div>

                                    <div className="pb-8 border-b border-[hsl(var(--border)/0.5)]">
                                        <p className="text-5xl font-black tracking-tighter" style={{ color: business.accentColor }}>
                                            {formatPrice(selectedProduct.price)}
                                        </p>
                                        {selectedProduct.type === 'COMBO' && (selectedProduct.originalPrice || 0) > selectedProduct.price && (
                                            <div className="mt-2 space-y-1">
                                                <p className="text-sm font-semibold text-[hsl(var(--muted))] line-through">
                                                    Antes {formatPrice(Number(selectedProduct.originalPrice || 0))}
                                                </p>
                                                <p className="text-xs font-black uppercase tracking-widest text-emerald-700">
                                                    Ahorras {formatPrice(Number(selectedProduct.discountAmount || 0))}
                                                    {` (${Math.round(Number(selectedProduct.discountPercent || 0))}% )`}
                                                </p>
                                            </div>
                                        )}
                                        <p className="text-xs font-bold text-[hsl(var(--muted))] mt-2 uppercase tracking-widest">Precios sujetos a cambio</p>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-[hsl(var(--muted))] uppercase tracking-[0.3em]">Especificaciones</h4>
                                        <p className="text-[hsl(var(--foreground))] text-base leading-relaxed font-medium">
                                            {selectedProduct.description || "Este producto es parte de nuestra colección exclusiva. Contáctanos para más detalles técnicos."}
                                        </p>
                                        {selectedProduct.type === 'COMBO' && selectedProduct.comboItems && selectedProduct.comboItems.length > 0 && (
                                            <div className="space-y-2">
                                                <h5 className="text-[10px] font-black text-[hsl(var(--muted))] uppercase tracking-[0.25em]">Incluye</h5>
                                                <div className="space-y-1">
                                                    {selectedProduct.comboItems.map((item) => (
                                                        <div key={`${selectedProduct.id}-${item.productId}`} className="text-sm font-semibold text-[hsl(var(--foreground))]">
                                                            {item.quantity}x {item.productName}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-12 space-y-4">
                                    <button
                                        className="w-full py-6 rounded-[2rem] text-white font-black text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl hover:brightness-110 disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3"
                                        style={{ backgroundColor: business.accentColor }}
                                        onClick={() => {
                                            const phoneNumber = business.whatsApp?.replace(/\D/g, '') || '';
                                            const text = `Hola! 👋 Vi tu catálogo y me interesa:\n\n*${selectedProduct.name}*\nPrecio: ${formatPrice(selectedProduct.price)}\n\n¿Me podrías dar más información?`;
                                            const wpUrl = phoneNumber
                                                ? `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(text)}`
                                                : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
                                            window.open(wpUrl, '_blank');
                                        }}
                                        disabled={false}
                                    >
                                        <MessageSquare className="w-5 h-5" />
                                        {selectedProduct.available ? 'Consultar via WhatsApp' : 'Consultar Disponibilidad'}
                                    </button>
                                    <div className="flex items-center justify-center gap-2.5 opacity-40">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        <p className="text-[9px] font-black text-[hsl(var(--muted))] uppercase tracking-widest">
                                            Stock verificado por InventoryPro
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Footer */}
            <footer className="mt-auto py-20 text-center border-t border-[hsl(var(--border)/0.5)] bg-white/30 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6">
                    <p className="text-sm font-bold text-[hsl(var(--muted))] uppercase tracking-widest mb-8">
                        Catálogo oficial de <span className="text-[hsl(var(--foreground))]">{business.name}</span>
                    </p>
                    <div className="flex flex-col items-center gap-3 group cursor-default">
                        <p className="text-[10px] text-[hsl(var(--muted))] font-black tracking-[0.5em] uppercase opacity-40">
                            Impulsado por
                        </p>
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-[hsl(var(--primary))] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <Package className="w-5 h-5" />
                            </div>
                            <span className="text-2xl font-black tracking-tighter text-[hsl(var(--foreground))]" style={{ fontFamily: 'var(--font-display)' }}>
                                Inventory<span className="text-[hsl(var(--primary))] opacity-60">Pro</span>
                            </span>
                        </div>
                    </div>
                </div>
            </footer>
        </div >
    )
}

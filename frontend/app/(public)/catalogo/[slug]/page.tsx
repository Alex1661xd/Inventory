'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface CatalogProduct {
    id: string
    name: string
    description: string | null
    images: string[]
    price: number
    categoryId: string | null
    categoryName: string
    available: boolean
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

// Componente para el slider automático de imágenes
const ImageSlider = ({ images, name, available, interval = 3000, showControls = false }: {
    images: string[],
    name: string,
    available: boolean,
    interval?: number,
    showControls?: boolean
}) => {
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        if (images.length <= 1) return
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length)
        }, interval)
        return () => clearInterval(timer)
    }, [images, interval])

    if (images.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center text-5xl text-stone-300">
                📦
            </div>
        )
    }

    return (
        <div className="relative w-full h-full overflow-hidden">
            {images.map((img, idx) => (
                <div
                    key={`${img}-${idx}`}
                    className={cn(
                        "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                        idx === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                    )}
                >
                    <Image
                        src={img}
                        alt={`${name} - Imagen ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </div>
            ))}

            {/* Indicadores de posición */}
            {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                    {images.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={(e) => {
                                e.stopPropagation();
                                setCurrentIndex(idx);
                            }}
                            className={cn(
                                "h-1.5 rounded-full transition-all duration-300 shadow-sm",
                                idx === currentIndex
                                    ? "bg-white w-6"
                                    : "bg-white/50 w-1.5 hover:bg-white/80"
                            )}
                        />
                    ))}
                </div>
            )}

            {/* Controles laterales (opcional para modal) */}
            {showControls && images.length > 1 && (
                <>
                    <button
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
                        onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev - 1 + images.length) % images.length) }}
                    >
                        ‹
                    </button>
                    <button
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
                        onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev + 1) % images.length) }}
                    >
                        ›
                    </button>
                </>
            )}
        </div>
    )
}

function formatPrice(price: number) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price)
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

    useEffect(() => {
        if (!slug) return

        const fetchCatalog = async () => {
            try {
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
                const res = await fetch(`${backendUrl}/catalog/public/${slug}`)

                if (!res.ok) {
                    if (res.status === 404) {
                        setError('Catálogo no encontrado')
                    } else {
                        setError('Error al cargar el catálogo')
                    }
                    return
                }

                const data = await res.json()
                setCatalog(data)
            } catch (err) {
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
            const matchesCategory = !selectedCategory || product.categoryId === selectedCategory
            const matchesSearch = !searchQuery ||
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesAvailability = !showOnlyAvailable || product.available

            return matchesCategory && matchesSearch && matchesAvailability
        })
    }, [catalog, selectedCategory, searchQuery, showOnlyAvailable])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-100">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-stone-300"></div>
                    <div className="h-4 w-32 bg-stone-300 rounded"></div>
                </div>
            </div>
        )
    }

    if (error || !catalog) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-100 p-6">
                <div className="text-center">
                    <div className="text-6xl mb-4">📦</div>
                    <h1 className="text-2xl font-bold text-stone-700 mb-2">
                        {error || 'Catálogo no disponible'}
                    </h1>
                    <p className="text-stone-500">
                        Este catálogo no existe o ha sido desactivado.
                    </p>
                </div>
            </div>
        )
    }

    const { business, categories } = catalog

    return (
        <div
            className="min-h-screen"
            style={{ backgroundColor: business.bgColor }}
        >
            {/* Header */}
            <header
                className="sticky top-0 z-50 shadow-lg"
                style={{ backgroundColor: business.accentColor }}
            >
                <div className="max-w-7xl mx-auto px-4 py-5">
                    <div className="text-center">
                        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                            Catálogo de {business.name}
                        </h1>
                        {business.description && (
                            <p className="mt-2 text-white/80 text-sm md:text-base max-w-2xl mx-auto">
                                {business.description}
                            </p>
                        )}
                    </div>
                </div>
            </header>

            {/* Search & Filters */}
            <div className="sticky top-[72px] md:top-[88px] z-40 bg-white/80 backdrop-blur-md border-b border-stone-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex flex-col md:flex-row gap-3">
                        {/* Search */}
                        <div className="flex-1 relative">

                            <input
                                type="text"
                                placeholder="Buscar productos..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400 text-sm"
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${!selectedCategory
                                    ? 'text-white shadow-md'
                                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                                    }`}
                                style={!selectedCategory ? { backgroundColor: business.accentColor } : {}}
                            >
                                Todos
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === cat.id
                                        ? 'text-white shadow-md'
                                        : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                                        }`}
                                    style={selectedCategory === cat.id ? { backgroundColor: business.accentColor } : {}}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Availability Toggle */}
                    <div className="flex items-center justify-between mt-3">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={showOnlyAvailable}
                                onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                                className="w-4 h-4 rounded border-stone-300 accent-stone-700"
                            />
                            <span className="text-sm text-stone-600">Solo disponibles</span>
                        </label>
                        <span className="text-xs text-stone-400">
                            {filteredProducts.length} de {catalog.totalProducts} productos
                        </span>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <main className="max-w-7xl mx-auto px-4 py-6">
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-5xl mb-4">🔍</div>
                        <p className="text-stone-500">No se encontraron productos</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {filteredProducts.map((product) => (
                            <div
                                key={product.id}
                                onClick={() => setSelectedProduct(product)}
                                className={`group bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer ${!product.available ? 'opacity-70' : ''
                                    }`}
                            >
                                {/* Product Image (Slider) */}
                                <div className="relative aspect-square bg-stone-100 overflow-hidden">
                                    <ImageSlider
                                        images={product.images}
                                        name={product.name}
                                        available={product.available}
                                    />

                                    {/* Availability Badge */}
                                    <div
                                        className={`absolute top-2 right-2 px-2 py-1 rounded-full text-[10px] md:text-xs font-medium backdrop-blur-sm z-30 ${product.available
                                            ? 'bg-green-500/90 text-white'
                                            : 'bg-red-500/90 text-white'
                                            }`}
                                    >
                                        {product.available ? '✓ Disponible' : '✕ Agotado'}
                                    </div>

                                    {/* Category Tag */}
                                    <div className="absolute bottom-2 left-2 px-2 py-1 rounded-full text-[10px] md:text-xs font-medium bg-black/50 text-white backdrop-blur-sm z-30">
                                        {product.categoryName}
                                    </div>
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
                                    <p
                                        className="mt-2 text-lg md:text-xl font-bold"
                                        style={{ color: business.accentColor }}
                                    >
                                        {formatPrice(product.price)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Product Modal */}
            <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-3xl gap-0 border-none sm:max-w-[95vw] md:max-w-4xl bg-white shadow-2xl">
                    {selectedProduct && (
                        <div className="flex flex-col md:flex-row h-full max-h-[90vh] md:max-h-[85vh]">
                            {/* Left: Image Slider */}
                            <div className="w-full md:w-[55%] aspect-square md:aspect-auto relative bg-stone-50 min-h-[350px]">
                                <ImageSlider
                                    images={selectedProduct.images}
                                    name={selectedProduct.name}
                                    available={selectedProduct.available}
                                    interval={5000}
                                    showControls={true}
                                />
                                <div
                                    className={`absolute top-6 left-6 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest text-white z-40 shadow-xl ${selectedProduct.available ? 'bg-green-500' : 'bg-red-500'
                                        }`}
                                >
                                    {selectedProduct.available ? 'PRODUCTO DISPONIBLE' : 'AGOTADO MOMENTÁNEAMENTE'}
                                </div>
                            </div>

                            {/* Right: Info */}
                            <div className="w-full md:w-[45%] p-8 md:p-10 flex flex-col justify-between overflow-y-auto">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <div
                                            className="inline-block px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest mb-2"
                                            style={{ backgroundColor: `${business.accentColor}15`, color: business.accentColor }}
                                        >
                                            {selectedProduct.categoryName}
                                        </div>
                                        <DialogTitle className="text-3xl md:text-4xl font-extrabold text-stone-900 leading-[1.1] tracking-tight">
                                            {selectedProduct.name}
                                        </DialogTitle>
                                    </div>

                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black tracking-tighter" style={{ color: business.accentColor }}>
                                            {formatPrice(selectedProduct.price)}
                                        </span>
                                        <span className="text-stone-400 text-sm font-medium">IVA incluido</span>
                                    </div>

                                    <div className="space-y-3 pt-6 border-t border-stone-100">
                                        <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Detalles del Producto</h4>
                                        <div className="text-stone-600 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">
                                            {selectedProduct.description || "Este producto no cuenta con una descripción detallada en este momento."}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-10 pt-8 border-t border-stone-100">
                                    <button
                                        className="w-full py-5 rounded-2xl text-white font-black text-sm uppercase tracking-widest transition-all active:scale-[0.98] shadow-2xl hover:brightness-110 disabled:opacity-50 disabled:grayscale disabled:active:scale-100 flex items-center justify-center gap-3"
                                        style={{ backgroundColor: business.accentColor }}
                                        onClick={() => {
                                            const phoneNumber = business.whatsApp?.replace(/\D/g, '') || '';
                                            const text = `Hola! 👋 Estoy viendo el catálogo de ${business.name} y me interesa:\n\n*${selectedProduct.name}*\nPrecio: ${formatPrice(selectedProduct.price)}\n\n¿Podrían darme más información?`;
                                            const wpUrl = phoneNumber
                                                ? `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(text)}`
                                                : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
                                            window.open(wpUrl, '_blank');
                                        }}
                                        disabled={!selectedProduct.available}
                                    >
                                        <span className="text-xl">💬</span>
                                        {selectedProduct.available ? 'Me interesa este producto' : 'No disponible'}
                                    </button>
                                    <div className="flex items-center justify-center gap-2 mt-4 opacity-40">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                        <p className="text-[9px] font-bold text-stone-500 uppercase tracking-tighter">
                                            Información de stock sincronizada en tiempo real
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Footer */}
            <footer className="mt-auto py-10 text-center border-t border-stone-100 bg-white/30 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4">
                    <p className="text-sm font-medium text-stone-500">
                        Catálogo oficial de <span className="font-bold text-stone-800">{business.name}</span>
                    </p>
                    <div className="mt-4 flex flex-col items-center gap-1">
                        <p className="text-[10px] text-stone-400 font-bold tracking-widest uppercase">
                            Desarrollado por
                        </p>
                        <div className="font-black text-stone-800 tracking-tighter text-lg">
                            Inventory<span className="text-stone-400">Pro</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}

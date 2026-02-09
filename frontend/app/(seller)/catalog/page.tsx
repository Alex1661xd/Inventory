'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/backend'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function SellerCatalogPage() {
    const [catalogSlug, setCatalogSlug] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        const fetchCatalogInfo = async () => {
            try {
                const settings = await api.catalog.getSettings()
                setCatalogSlug(settings.slug)
            } catch (error) {
                console.error('Error fetching catalog:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchCatalogInfo()
    }, [])

    const copyLink = () => {
        if (!catalogSlug) return
        const fullUrl = `${window.location.origin}/catalogo/${catalogSlug}`
        navigator.clipboard.writeText(fullUrl)
        setCopied(true)
        toast.success('¡Enlace copiado al portapapeles!')
        setTimeout(() => setCopied(false), 2000)
    }

    const openCatalog = () => {
        if (!catalogSlug) return
        window.open(`/catalogo/${catalogSlug}`, '_blank')
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-stone-200"></div>
                    <div className="h-4 w-32 bg-stone-200 rounded"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-stone-800">📖 Catálogo del Negocio</h1>
                <p className="text-stone-500 mt-1">
                    Comparte el catálogo con tus clientes para que vean los productos disponibles
                </p>
            </div>

            {/* Catalog Card */}
            <div className="bg-gradient-to-br from-stone-800 to-stone-700 rounded-2xl p-8 text-white shadow-xl">
                <div className="flex flex-col items-center text-center gap-6">
                    <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-5xl">
                        📖
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold">Catálogo Público</h2>
                        <p className="text-white/70 mt-2">
                            Tus clientes pueden ver todos los productos del negocio y su disponibilidad
                        </p>
                    </div>

                    {catalogSlug && (
                        <div className="w-full max-w-md bg-white/10 rounded-xl px-4 py-3 font-mono text-sm truncate">
                            {typeof window !== 'undefined' ? window.location.origin : ''}/catalogo/{catalogSlug}
                        </div>
                    )}

                    <div className="flex flex-wrap gap-3 justify-center">
                        <Button
                            onClick={copyLink}
                            size="lg"
                            className="bg-white text-stone-800 hover:bg-white/90"
                        >
                            {copied ? '✓ ¡Copiado!' : '📋 Copiar Enlace'}
                        </Button>
                        <Button
                            onClick={openCatalog}
                            size="lg"
                            variant="outline"
                            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                        >
                            👁 Ver Catálogo
                        </Button>
                    </div>
                </div>
            </div>

            {/* Tips */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                <h3 className="font-semibold text-amber-800 flex items-center gap-2">
                    💡 Consejos
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-amber-700">
                    <li>• Comparte el enlace por WhatsApp, Instagram o cualquier red social</li>
                    <li>• Los clientes verán los productos con su precio y disponibilidad</li>
                    <li>• El catálogo se actualiza automáticamente con el inventario</li>
                    <li>• Pide al administrador que personalice los colores y descripción</li>
                </ul>
            </div>
        </div>
    )
}

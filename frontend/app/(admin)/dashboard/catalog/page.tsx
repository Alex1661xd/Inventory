'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/backend'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
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
    { code: '503', name: 'El Salvador', flag: '🇸🇻' },
    { code: '504', name: 'Honduras', flag: '🇭🇳' },
    { code: '505', name: 'Nicaragua', flag: '🇳🇮' },
    { code: '591', name: 'Bolivia', flag: '🇧🇴' },
    { code: '595', name: 'Paraguay', flag: '🇵🇾' },
    { code: '598', name: 'Uruguay', flag: '🇺🇾' },
    { code: '501', name: 'Belice', flag: '🇧🇿' },
    { code: '509', name: 'Haití', flag: '🇭🇹' },
    { code: '1', name: 'Rep. Dominicana', flag: '🇩🇴' },
]

interface CatalogSettings {
    name: string
    slug: string
    catalogDescription: string
    catalogBgColor: string
    catalogAccentColor: string
    catalogEnabled: boolean
    catalogWhatsApp: string
    catalogUrl: string
}

export default function CatalogSettingsPage() {
    const [settings, setSettings] = useState<CatalogSettings | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [copied, setCopied] = useState(false)

    // Form state
    const [description, setDescription] = useState('')
    const [bgColor, setBgColor] = useState('#f5f5f4')
    const [accentColor, setAccentColor] = useState('#292524')
    const [enabled, setEnabled] = useState(true)
    const [countryCode, setCountryCode] = useState('57')
    const [localPhone, setLocalPhone] = useState('')

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const data = await api.catalog.getSettings()
            setSettings(data)
            setDescription(data.catalogDescription || '')
            setBgColor(data.catalogBgColor || '#f5f5f4')
            setAccentColor(data.catalogAccentColor || '#292524')
            setEnabled(data.catalogEnabled)

            // Parse WhatsApp number
            const fullPhone = data.catalogWhatsApp || ''
            if (fullPhone) {
                // Find matching country code
                const matchedCountry = COUNTRIES.sort((a, b) => b.code.length - a.code.length)
                    .find(c => fullPhone.startsWith(c.code))

                if (matchedCountry) {
                    setCountryCode(matchedCountry.code)
                    setLocalPhone(fullPhone.slice(matchedCountry.code.length))
                } else {
                    setLocalPhone(fullPhone)
                }
            }
        } catch (error) {
            toast.error('Error al cargar la configuración')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await api.catalog.updateSettings({
                catalogDescription: description,
                catalogBgColor: bgColor,
                catalogAccentColor: accentColor,
                catalogEnabled: enabled,
                catalogWhatsApp: `${countryCode}${localPhone.replace(/\D/g, '')}`,
            })
            toast.success('Configuración guardada correctamente')
            fetchSettings()
        } catch (error) {
            toast.error('Error al guardar la configuración')
        } finally {
            setSaving(false)
        }
    }

    const copyLink = () => {
        const fullUrl = `${window.location.origin}/catalogo/${settings?.slug}`
        navigator.clipboard.writeText(fullUrl)
        setCopied(true)
        toast.success('¡Enlace copiado!')
        setTimeout(() => setCopied(false), 2000)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-stone-200"></div>
                    <div className="h-4 w-32 bg-stone-200 rounded"></div>
                </div>
            </div>
        )
    }

    if (!settings) {
        return (
            <div className="text-center py-16">
                <p className="text-stone-500">Error al cargar la configuración</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-stone-800">📖 Mi Catálogo</h1>
                <p className="text-stone-500 mt-1">
                    Personaliza tu catálogo público y compártelo con tus clientes
                </p>
            </div>

            {/* Catalog Link */}
            <div className="bg-gradient-to-r from-stone-800 to-stone-700 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="font-semibold text-lg">📎 Enlace de tu catálogo</h2>
                        <p className="text-white/70 text-sm mt-1">
                            Comparte este enlace con tus clientes para que vean tu catálogo
                        </p>
                        <div className="mt-3 flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2 font-mono text-sm">
                            <span className="truncate">
                                {typeof window !== 'undefined' ? window.location.origin : ''}/catalogo/{settings.slug}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={copyLink}
                            variant="secondary"
                            className="bg-white text-stone-800 hover:bg-white/90"
                        >
                            {copied ? '✓ Copiado' : '📋 Copiar'}
                        </Button>
                        <Button
                            onClick={() => window.open(`/catalogo/${settings.slug}`, '_blank')}
                            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                            variant="outline"
                        >
                            👁 Ver
                        </Button>
                    </div>
                </div>
            </div>

            {/* Settings Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                <div className="p-6 border-b border-stone-200">
                    <h2 className="font-semibold text-lg text-stone-800">⚙️ Configuración</h2>
                </div>

                <div className="p-6 space-y-6">
                    {/* Enable/Disable */}
                    <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
                        <div>
                            <Label className="font-medium">Catálogo activo</Label>
                            <p className="text-sm text-stone-500">
                                Si desactivas el catálogo, nadie podrá verlo
                            </p>
                        </div>
                        <Switch
                            checked={enabled}
                            onCheckedChange={setEnabled}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción del negocio</Label>
                        <Textarea
                            id="description"
                            placeholder="Ej: Tenemos los mejores muebles de la ciudad con entrega a domicilio..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="min-h-[100px] resize-none"
                            maxLength={500}
                        />
                        <p className="text-xs text-stone-400 text-right">
                            {description.length}/500 caracteres
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="whatsApp">📲 Número de WhatsApp para consultas</Label>
                        <div className="flex gap-2">
                            <Select value={countryCode} onValueChange={setCountryCode}>
                                <SelectTrigger className="w-[180px] h-12">
                                    <SelectValue placeholder="País" />
                                </SelectTrigger>
                                <SelectContent>
                                    {COUNTRIES.map((c) => (
                                        <SelectItem key={`${c.code}-${c.name}`} value={c.code}>
                                            <span className="flex items-center gap-2">
                                                <span>{c.flag}</span>
                                                <span className="font-mono">+{c.code}</span>
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input
                                id="localPhone"
                                placeholder="Número de celular"
                                value={localPhone}
                                onChange={(e) => setLocalPhone(e.target.value)}
                                className="h-12 text-lg"
                            />
                        </div>
                        <p className="text-xs text-stone-400">
                            Cuando un cliente quiera preguntar por un producto, se abrirá un chat directo a este número.
                        </p>
                    </div>

                    {/* Colors */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="bgColor">Color de fondo</Label>
                            <div className="flex gap-3 items-center">
                                <input
                                    type="color"
                                    id="bgColor"
                                    value={bgColor}
                                    onChange={(e) => setBgColor(e.target.value)}
                                    className="w-12 h-12 rounded-lg border border-stone-200 cursor-pointer"
                                />
                                <Input
                                    value={bgColor}
                                    onChange={(e) => setBgColor(e.target.value)}
                                    placeholder="#f5f5f4"
                                    className="font-mono"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="accentColor">Color de acento (encabezado)</Label>
                            <div className="flex gap-3 items-center">
                                <input
                                    type="color"
                                    id="accentColor"
                                    value={accentColor}
                                    onChange={(e) => setAccentColor(e.target.value)}
                                    className="w-12 h-12 rounded-lg border border-stone-200 cursor-pointer"
                                />
                                <Input
                                    value={accentColor}
                                    onChange={(e) => setAccentColor(e.target.value)}
                                    placeholder="#292524"
                                    className="font-mono"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="space-y-2">
                        <Label>Vista previa</Label>
                        <div
                            className="rounded-xl overflow-hidden border border-stone-200 shadow-sm"
                            style={{ backgroundColor: bgColor }}
                        >
                            <div
                                className="p-4 text-center"
                                style={{ backgroundColor: accentColor }}
                            >
                                <h3 className="font-bold text-white text-lg">
                                    Catálogo de {settings.name}
                                </h3>
                                {description && (
                                    <p className="text-white/80 text-sm mt-1 line-clamp-2">
                                        {description}
                                    </p>
                                )}
                            </div>
                            <div className="p-4 grid grid-cols-3 gap-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-white rounded-lg p-2 shadow-sm">
                                        <div className="aspect-square bg-stone-100 rounded mb-2 flex items-center justify-center text-2xl">
                                            📦
                                        </div>
                                        <div className="h-2 bg-stone-200 rounded w-3/4"></div>
                                        <div
                                            className="h-3 rounded w-1/2 mt-1"
                                            style={{ backgroundColor: accentColor, opacity: 0.7 }}
                                        ></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="p-6 bg-stone-50 border-t border-stone-200">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full md:w-auto"
                        size="lg"
                    >
                        {saving ? 'Guardando...' : '💾 Guardar Cambios'}
                    </Button>
                </div>
            </div>
        </div>
    )
}

'use client'

import { useEffect, useMemo, useState } from 'react'
import { api } from '@/lib/backend'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { ImagePlus, Loader2, Sparkles, Download } from 'lucide-react'

type GeneratedImageResponse = {
    success: boolean;
    message: string;
    modelo: string;
    modelos_usados?: {
        analisis?: string;
        refinado?: string;
        generacion?: string | null;
    };
    timestamp: string;
    whatsapp: string;
    prompt_final: string;
    count: number;
    images: Array<{
        index: number;
        model: string;
        image_base64: string;
        image_url: string;
    }>;
    image_base64: string | null;
    image_url: string | null;
}

type BatchResult = {
    fileName: string;
    status: 'pending' | 'success' | 'error';
    result?: GeneratedImageResponse;
    error?: string;
}

export default function CatalogImagesPage() {
    const [images, setImages] = useState<File[]>([])
    const [description, setDescription] = useState('')
    const [whatsapp, setWhatsapp] = useState('')
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<BatchResult[]>([])

    const previewUrls = useMemo(() => images.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
    })), [images])

    useEffect(() => {
        return () => {
            previewUrls.forEach((item) => URL.revokeObjectURL(item.url))
        }
    }, [previewUrls])

    const onGenerate = async () => {
        if (images.length === 0) {
            toast.error('Debes seleccionar al menos una imagen')
            return
        }

        try {
            setLoading(true)
            setResults(images.map((file) => ({ fileName: file.name, status: 'pending' })))

            const batchResults: BatchResult[] = []

            for (const file of images) {
                try {
                    const formData = new FormData()
                    formData.append('image', file)
                    if (description.trim()) formData.append('description', description)
                    if (whatsapp.trim()) formData.append('whatsapp', whatsapp)
                    formData.append('count', '3')

                    const data = await api.superAdmin.catalogImages.generate(formData)
                    batchResults.push({ fileName: file.name, status: 'success', result: data })
                } catch (error: unknown) {
                    const message = error instanceof Error ? error.message : 'No se pudo generar la imagen'
                    batchResults.push({ fileName: file.name, status: 'error', error: message })
                }

                setResults([...batchResults])
            }

            const successCount = batchResults.filter((item) => item.status === 'success').length
            const errorCount = batchResults.filter((item) => item.status === 'error').length

            if (successCount > 0) {
                toast.success(`Procesados ${successCount} producto(s) correctamente`)
            }
            if (errorCount > 0) {
                toast.error(`${errorCount} producto(s) tuvieron error`)
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'No se pudo generar la imagen'
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black tracking-tight text-white mb-2">Generador de Imagenes de Catalogo</h1>
                <p className="text-slate-400">Sube hasta 5 productos y genera 3 imagenes publicitarias por cada uno.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <ImagePlus className="w-5 h-5 text-emerald-500" />
                            Entrada
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Flujo por lote: maximo 5 imagenes, 3 resultados por producto.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-slate-200">Imagenes de producto</Label>
                            <Input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => {
                                    const files = Array.from(e.target.files || []).slice(0, 5)
                                    setImages(files)
                                }}
                                className="bg-slate-950 border-slate-800 text-white file:text-white"
                            />
                            <p className="text-xs text-slate-500">Puedes subir hasta 5 productos.</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-200">Descripcion/Requisito del cliente (opcional)</Label>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="bg-slate-950 border-slate-800 text-white min-h-28"
                                placeholder='Ejemplo: "fondo de showroom minimalista y producto exactamente igual"'
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-200">WhatsApp (opcional)</Label>
                            <Input
                                value={whatsapp}
                                onChange={(e) => setWhatsapp(e.target.value)}
                                className="bg-slate-950 border-slate-800 text-white"
                                placeholder="Si lo dejas vacio, no se agrega texto de WhatsApp"
                            />
                        </div>

                        <Button
                            onClick={onGenerate}
                            disabled={loading || images.length === 0}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                        >
                            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                            {loading ? 'Generando lote...' : 'Generar 3 Imagenes por Producto'}
                        </Button>

                        {previewUrls.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Vista previa ({previewUrls.length})</p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {previewUrls.map((item) => (
                                        <div key={item.name} className="space-y-1">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={item.url} alt={item.name} className="w-full rounded-lg border border-slate-800 object-cover h-24 bg-slate-950" />
                                            <p className="text-[10px] text-slate-500 truncate">{item.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-white">Resultado</CardTitle>
                        <CardDescription className="text-slate-400">Resultados por producto (3 imagenes c/u).</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {results.length === 0 ? (
                            <div className="text-slate-500 text-sm border border-dashed border-slate-700 rounded-xl p-6 text-center">
                                Aun no hay resultados del lote.
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {results.map((item) => (
                                    <div key={item.fileName} className="rounded-xl border border-slate-800 p-4 bg-slate-950/40">
                                        <p className="text-sm font-semibold text-white mb-3">{item.fileName}</p>

                                        {item.status === 'pending' && (
                                            <p className="text-xs text-slate-400">Procesando...</p>
                                        )}

                                        {item.status === 'error' && (
                                            <p className="text-xs text-red-400">{item.error}</p>
                                        )}

                                        {item.status === 'success' && item.result && (
                                            <>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    {item.result.images.map((img) => (
                                                        <div key={`${item.fileName}-${img.index}`} className="space-y-2">
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img
                                                                src={img.image_url}
                                                                alt={`Imagen generada ${img.index}`}
                                                                className="w-full rounded-xl border border-slate-800 object-contain h-40 bg-slate-950"
                                                            />
                                                            <a
                                                                href={img.image_url}
                                                                download={`catalogo_${item.fileName}_${img.index}_${Date.now()}.png`}
                                                                className="inline-flex w-full"
                                                            >
                                                                <Button variant="outline" className="w-full border-slate-700 text-slate-100 hover:bg-slate-800">
                                                                    <Download className="w-4 h-4 mr-2" />
                                                                    Descargar {img.index}
                                                                </Button>
                                                            </a>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="space-y-2 mt-3">
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Prompt refinado</p>
                                                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-200 whitespace-pre-wrap max-h-64 overflow-y-auto">
                                                        {item.result.prompt_final}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

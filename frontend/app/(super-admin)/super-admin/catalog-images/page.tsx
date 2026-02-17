'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '@/lib/backend'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { ImagePlus, Loader2, Sparkles, Download, ChevronLeft, ChevronRight, Camera, X, Trash2 } from 'lucide-react'

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
    reference_count?: number;
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
    const [mode, setMode] = useState<'individual' | 'variants'>('individual')

    const [images, setImages] = useState<File[]>([])
    const [variantRefs, setVariantRefs] = useState<File[]>([])
    const [variant1, setVariant1] = useState('Vista principal (ej: puertas cerradas)')
    const [variant2, setVariant2] = useState('Segunda vista (ej: puertas abiertas)')
    const [variant3, setVariant3] = useState('Tercera vista (ej: detalle interior)')

    const [description, setDescription] = useState('')
    const [whatsapp, setWhatsapp] = useState('')
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<BatchResult[]>([])
    const [currentResultIndex, setCurrentResultIndex] = useState(0)

    const [cameraOpen, setCameraOpen] = useState(false)
    const [cameraTarget, setCameraTarget] = useState<'individual' | 'variants'>('individual')
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const streamRef = useRef<MediaStream | null>(null)

    const sourceFiles = mode === 'individual' ? images : variantRefs

    const previewUrls = useMemo(
        () => sourceFiles.map((file) => ({ name: file.name, url: URL.createObjectURL(file) })),
        [sourceFiles],
    )

    const pendingCount = results.filter((r) => r.status === 'pending').length
    const successCount = results.filter((r) => r.status === 'success').length
    const currentResult = results[currentResultIndex] ?? null

    useEffect(() => {
        return () => {
            previewUrls.forEach((item) => URL.revokeObjectURL(item.url))
        }
    }, [previewUrls])

    useEffect(() => {
        if (cameraOpen && streamRef.current) {
            void attachStreamToVideo(streamRef.current)
        }
    }, [cameraOpen])

    const attachStreamToVideo = async (stream: MediaStream) => {
        if (!videoRef.current) return
        videoRef.current.srcObject = stream
        videoRef.current.muted = true
        videoRef.current.setAttribute('playsinline', 'true')
        try {
            await videoRef.current.play()
        } catch {
            // Ignorar: algunos navegadores lo resuelven luego de interacción.
        }
    }

    const openCamera = async (target: 'individual' | 'variants') => {
        try {
            let stream: MediaStream
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
            } catch {
                // Fallback si la cámara trasera no está disponible.
                stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            }

            streamRef.current = stream
            setCameraTarget(target)
            setCameraOpen(true)
            setTimeout(() => {
                void attachStreamToVideo(stream)
            }, 0)
        } catch {
            toast.error('No se pudo acceder a la camara')
        }
    }

    const closeCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop())
            streamRef.current = null
        }
        setCameraOpen(false)
    }

    const removeSourceFile = (index: number) => {
        if (mode === 'individual') {
            setImages((prev) => prev.filter((_, i) => i !== index))
        } else {
            setVariantRefs((prev) => prev.filter((_, i) => i !== index))
        }
    }

    const capturePhoto = async () => {
        const video = videoRef.current
        if (!video) return

        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92))
        if (!blob) return

        const file = new File([blob], `captura_${Date.now()}.jpg`, { type: 'image/jpeg' })

        if (cameraTarget === 'individual') {
            setImages((prev) => [...prev, file].slice(0, 5))
        } else {
            setVariantRefs((prev) => [...prev, file].slice(0, 3))
        }

        closeCamera()
    }

    const onGenerateIndividual = async () => {
        if (images.length === 0) {
            toast.error('Debes seleccionar al menos una imagen')
            return
        }

        setLoading(true)
        setCurrentResultIndex(0)
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

            setResults([
                ...batchResults,
                ...images.slice(batchResults.length).map((f) => ({ fileName: f.name, status: 'pending' as const })),
            ])
        }

        const okCount = batchResults.filter((item) => item.status === 'success').length
        const errCount = batchResults.filter((item) => item.status === 'error').length
        if (okCount > 0) toast.success(`Procesados ${okCount} producto(s) correctamente`)
        if (errCount > 0) toast.error(`${errCount} producto(s) tuvieron error`)

        setLoading(false)
    }

    const onGenerateVariants = async () => {
        if (variantRefs.length === 0) {
            toast.error('Debes subir al menos una referencia del mismo producto')
            return
        }

        setLoading(true)
        setCurrentResultIndex(0)
        setResults([{ fileName: 'Variantes del mismo producto', status: 'pending' }])

        try {
            const formData = new FormData()
            variantRefs.forEach((file) => formData.append('images', file))
            if (description.trim()) formData.append('description', description)
            if (whatsapp.trim()) formData.append('whatsapp', whatsapp)
            formData.append('count', '3')
            if (variant1.trim()) formData.append('variant1', variant1)
            if (variant2.trim()) formData.append('variant2', variant2)
            if (variant3.trim()) formData.append('variant3', variant3)

            const data = await api.superAdmin.catalogImages.generate(formData)
            setResults([{ fileName: 'Variantes del mismo producto', status: 'success', result: data }])
            toast.success('Variantes generadas correctamente')
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'No se pudo generar variantes'
            setResults([{ fileName: 'Variantes del mismo producto', status: 'error', error: message }])
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    const onGenerate = async () => {
        if (mode === 'individual') return onGenerateIndividual()
        return onGenerateVariants()
    }

    const goPrev = () => setCurrentResultIndex((i) => Math.max(0, i - 1))
    const goNext = () => setCurrentResultIndex((i) => Math.min(results.length - 1, i + 1))

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black tracking-tight text-white mb-2">Generador de Imagenes de Catalogo</h1>
                <p className="text-slate-400">Modo individual o modo variantes del mismo producto (abierto/cerrado, etc.).</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button
                    variant={mode === 'individual' ? 'default' : 'outline'}
                    className={mode === 'individual' ? 'bg-emerald-600 hover:bg-emerald-700 text-white h-auto py-2 px-3 whitespace-normal text-left' : 'border-slate-700 text-slate-200 h-auto py-2 px-3 whitespace-normal text-left'}
                    onClick={() => {
                        setMode('individual')
                        setResults([])
                    }}
                >
                    Individual (3 por imagen)
                </Button>
                <Button
                    variant={mode === 'variants' ? 'default' : 'outline'}
                    className={mode === 'variants' ? 'bg-blue-600 hover:bg-blue-700 text-white h-auto py-2 px-3 whitespace-normal text-left' : 'border-slate-700 text-slate-200 h-auto py-2 px-3 whitespace-normal text-left'}
                    onClick={() => {
                        setMode('variants')
                        setResults([])
                    }}
                >
                    Variantes mismo producto
                </Button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <ImagePlus className="w-5 h-5 text-emerald-500" />
                            Entrada
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            {mode === 'individual'
                                ? 'Hasta 5 productos diferentes, 3 resultados por cada uno.'
                                : 'Hasta 3 referencias del MISMO producto para generar 3 variantes controladas.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-slate-200">
                                {mode === 'individual' ? 'Imagenes de producto' : 'Referencias del mismo producto'}
                            </Label>
                            <Input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => {
                                    const max = mode === 'individual' ? 5 : 3
                                    const files = Array.from(e.target.files || []).slice(0, max)
                                    if (mode === 'individual') setImages(files)
                                    else setVariantRefs(files)
                                }}
                                className="bg-slate-950 border-slate-800 text-white file:text-white"
                            />
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-slate-500">
                                    {mode === 'individual' ? 'Puedes subir hasta 5 productos.' : 'Puedes subir hasta 3 referencias del mismo producto.'}
                                </p>
                                <Button type="button" variant="outline" className="border-slate-700 text-slate-100 hover:bg-slate-800" onClick={() => openCamera(mode)}>
                                    <Camera className="w-4 h-4 mr-2" />
                                    Camara
                                </Button>
                            </div>
                        </div>

                        {mode === 'variants' && (
                            <div className="space-y-2 rounded-xl border border-slate-800 p-3 bg-slate-950/50">
                                <Label className="text-slate-200">Estados/escenas deseadas (3 salidas)</Label>
                                <Input value={variant1} onChange={(e) => setVariant1(e.target.value)} className="bg-slate-950 border-slate-800 text-white" />
                                <Input value={variant2} onChange={(e) => setVariant2(e.target.value)} className="bg-slate-950 border-slate-800 text-white" />
                                <Input value={variant3} onChange={(e) => setVariant3(e.target.value)} className="bg-slate-950 border-slate-800 text-white" />
                            </div>
                        )}

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
                            disabled={loading || sourceFiles.length === 0}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                        >
                            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                            {loading ? 'Generando...' : mode === 'individual' ? 'Generar 3 Imagenes por Producto' : 'Generar 3 Variantes del Mismo Producto'}
                        </Button>

                        {previewUrls.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Vista previa ({previewUrls.length})</p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {previewUrls.map((item, idx) => (
                                        <div key={item.name} className="space-y-1">
                                            <div className="relative">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={item.url} alt={item.name} className="w-full rounded-lg border border-slate-800 object-cover h-24 bg-slate-950" />
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="destructive"
                                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                                    onClick={() => removeSourceFile(idx)}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
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
                        <CardDescription className="text-slate-400">
                            Bloques de 3 imagenes por producto con navegacion lateral.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {results.length === 0 ? (
                            <div className="text-slate-500 text-sm border border-dashed border-slate-700 rounded-xl p-6 text-center">
                                Aun no hay resultados del lote.
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2">
                                    <Button variant="outline" size="icon" onClick={goPrev} disabled={currentResultIndex <= 0} className="border-slate-700">
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    <div className="text-center min-w-0">
                                        <p className="text-xs text-slate-400">Producto {currentResultIndex + 1} de {results.length}</p>
                                        <p className="text-sm text-white font-semibold truncate max-w-[260px]">{currentResult?.fileName}</p>
                                    </div>
                                    <Button variant="outline" size="icon" onClick={goNext} disabled={currentResultIndex >= results.length - 1} className="border-slate-700">
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>

                                {pendingCount > 0 && (
                                    <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2">
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        Cargando siguientes productos... pendientes: {pendingCount}
                                    </div>
                                )}

                                {currentResult?.status === 'pending' && (
                                    <div className="space-y-3">
                                        <div className="h-40 rounded-xl bg-slate-800/70 animate-pulse" />
                                        <div className="h-40 rounded-xl bg-slate-800/70 animate-pulse" />
                                        <div className="h-40 rounded-xl bg-slate-800/70 animate-pulse" />
                                    </div>
                                )}

                                {currentResult?.status === 'error' && (
                                    <div className="text-xs text-red-400 rounded-xl border border-red-500/20 bg-red-500/10 p-3">
                                        {currentResult.error}
                                    </div>
                                )}

                                {currentResult?.status === 'success' && currentResult.result && (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            {currentResult.result.images.map((img) => (
                                                <div key={`${currentResult.fileName}-${img.index}`} className="space-y-2">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={img.image_url}
                                                        alt={`Imagen generada ${img.index}`}
                                                        className="w-full rounded-xl border border-slate-800 object-contain h-40 bg-slate-950"
                                                    />
                                                    <a
                                                        href={img.image_url}
                                                        download={`catalogo_${currentResult.fileName}_${img.index}_${Date.now()}.png`}
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
                                                {currentResult.result.prompt_final}
                                            </div>
                                        </div>
                                    </>
                                )}

                                <p className="text-xs text-slate-500">Completados: {successCount}/{results.length}</p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {cameraOpen && (
                <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-0 sm:p-4">
                    <div className="w-full h-full sm:h-auto sm:max-h-[95vh] sm:max-w-5xl rounded-none sm:rounded-xl border-0 sm:border border-slate-700 bg-slate-900 p-3 sm:p-4 space-y-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
                        <div className="flex items-center justify-between">
                            <h3 className="text-white font-semibold">Capturar foto</h3>
                            <Button variant="ghost" size="icon" onClick={closeCamera} className="text-slate-300">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-[75vh] sm:h-[70vh] rounded-lg bg-black object-cover"
                        />
                        <div className="fixed sm:static bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-0 right-0 px-3 sm:px-0 flex flex-col sm:flex-row gap-2 justify-end z-10">
                            <Button variant="outline" onClick={closeCamera} className="border-slate-700 text-slate-100 bg-slate-900/95 w-full sm:w-auto">Cancelar</Button>
                            <Button onClick={capturePhoto} className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto">Tomar foto</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

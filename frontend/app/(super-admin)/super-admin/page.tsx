'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/backend'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Check, Copy, Trash2, Key, CalendarClock, Ticket, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

type InvitationCode = {
    id: string;
    code: string;
    createdAt: string;
    isUsed: boolean;
    tenants?: { id: string; name: string }[];
}

export default function RegistrationCodesPage() {
    const [codes, setCodes] = useState<InvitationCode[]>([])
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [generateCount, setGenerateCount] = useState(1)

    useEffect(() => {
        loadCodes()
    }, [])

    const loadCodes = async () => {
        setLoading(true)
        try {
            const data = await api.superAdmin.codes.list()
            setCodes(data)
        } catch {
            toast.error('Error al cargar codigos')
        } finally {
            setLoading(false)
        }
    }

    const handleGenerate = async () => {
        setGenerating(true)
        try {
            await api.superAdmin.codes.generate(generateCount)
            toast.success(`${generateCount} codigo(s) generado(s) correctamente`)
            loadCodes()
        } catch {
            toast.error('Error al generar codigos')
        } finally {
            setGenerating(false)
        }
    }

    const handleDelete = async (id: string, code: string) => {
        if (!confirm(`Estas seguro de eliminar el codigo ${code}?`)) return
        try {
            await api.superAdmin.codes.delete(id)
            setCodes(codes.filter(c => c.id !== id))
            toast.success('Codigo eliminado')
        } catch {
            toast.error('Error al eliminar codigo')
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success('Codigo copiado al portapapeles', { icon: <Check className="w-4 h-4" /> })
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">Codigos de Invitacion</h1>
                    <p className="text-slate-400 text-sm sm:text-base">Gestiona los codigos para nuevos negocios.</p>
                </div>

                <Card className="bg-slate-900 border-slate-800 w-full lg:w-auto">
                    <CardContent className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <Input
                            type="number"
                            min="1"
                            max="50"
                            value={generateCount}
                            onChange={(e) => setGenerateCount(Number(e.target.value))}
                            className="w-full sm:w-24 bg-slate-950 border-slate-800 text-white"
                        />
                        <Button
                            onClick={handleGenerate}
                            disabled={generating}
                            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            {generating ? 'Generando...' : 'Generar Codigos'}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                        <Ticket className="w-5 h-5 text-emerald-500" />
                        Lista de Codigos
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Mostrando {codes.length} codigos
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-10 text-slate-500 animate-pulse">Cargando codigos...</div>
                    ) : codes.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">No hay codigos generados.</div>
                    ) : (
                        <div className="space-y-2">
                            {codes.map((code) => (
                                <div
                                    key={code.id}
                                    className={`p-4 rounded-xl border ${code.isUsed ? 'bg-slate-950/50 border-slate-800 opacity-60' : 'bg-slate-950 border-slate-700'}`}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
                                            <div className={`p-2 rounded-lg shrink-0 ${code.isUsed ? 'bg-slate-800 text-slate-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                                <Key className="w-5 h-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                                    <span className="font-mono text-sm sm:text-lg font-bold tracking-wider text-white break-all select-all">
                                                        {code.code}
                                                    </span>
                                                    {code.isUsed ? (
                                                        <Badge variant="outline" className="border-slate-700 text-slate-500">
                                                            Usado
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-emerald-500/10 text-emerald-500 border-0 hover:bg-emerald-500/20">
                                                            Disponible
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1 text-xs text-slate-400">
                                                    <span className="flex items-center gap-1">
                                                        <CalendarClock className="w-3 h-3" />
                                                        Creado: {format(new Date(code.createdAt), 'd MMM yyyy, HH:mm', { locale: es })}
                                                    </span>
                                                    {code.isUsed && code.tenants?.[0] && (
                                                        <span className="text-emerald-400 font-bold">
                                                            Usado por: {code.tenants[0].name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 self-end sm:self-auto">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => copyToClipboard(code.code)}
                                                className="text-slate-400 hover:text-white hover:bg-slate-800"
                                                title="Copiar codigo"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </Button>

                                            {!code.isUsed && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(code.id, code.code)}
                                                    className="text-slate-400 hover:text-red-500 hover:bg-red-500/10"
                                                    title="Eliminar codigo"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

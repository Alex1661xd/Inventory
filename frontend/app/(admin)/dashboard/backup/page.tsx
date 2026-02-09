'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { api } from '@/lib/backend'
import {
    CloudIcon,
    RefreshCcw,
    CheckCircle2,
    AlertCircle,
    Database,
    ExternalLink,
    Clock,
    Shield,
    Upload,
    AlertTriangle,
    ArrowRight
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function BackupPage() {
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(false)
    const [loadingRestore, setLoadingRestore] = useState(false)
    const [status, setStatus] = useState<{
        connected: boolean;
        email?: string;
        lastBackupAt?: string;
    } | null>(null)

    useEffect(() => {
        loadStatus()

        if (searchParams.get('success') === 'true') {
            toast.success('¡Google Drive conectado con éxito!')
        }
    }, [searchParams])

    const loadStatus = async () => {
        try {
            const data = await api.backup.getStatus()
            setStatus(data)
        } catch (error) {
            console.error('Error loading backup status:', error)
        }
    }

    const handleConnect = async () => {
        try {
            const { url } = await api.backup.getAuthUrl()
            window.open(url, '_blank', 'width=600,height=700')
        } catch (error: any) {
            toast.error(error.message || 'Error al conectar con Google')
        }
    }

    const handleRunBackup = async () => {
        setLoading(true)
        try {
            const res = await api.backup.run()
            if (res.success) {
                toast.success('Respaldo completado con éxito en tu Google Drive')
                loadStatus()
            }
        } catch (error: any) {
            toast.error(error.message || 'Error al ejecutar el respaldo')
        } finally {
            setLoading(false)
        }
    }

    const handleRestore = async (file: File) => {
        if (!confirm('🚨 ¡ATENCIÓN! Esta acción BORRARÁ todos tus datos actuales para reemplazarlos con los del Excel. ¿Estás absolutamente seguro?')) {
            return
        }

        setLoadingRestore(true)
        try {
            const res = await api.backup.restore(file)
            if (res.success) {
                toast.success('¡Datos restaurados con éxito!')
                window.location.reload()
            }
        } catch (error: any) {
            toast.error(error.message || 'Error al restaurar los datos')
        } finally {
            setLoadingRestore(false)
        }
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 p-4 md:p-8 max-w-7xl mx-auto">
            {/* Elegant Header */}
            <div className="relative pl-2">
                <h1 className="text-4xl font-serif font-medium tracking-tight text-zinc-900 mb-3">
                    Centro de Seguridad
                </h1>
                <p className="text-zinc-500 font-light text-lg max-w-2xl leading-relaxed">
                    Gestiona la integridad de tu información. Tu negocio respaldado y protegido.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Drive Card */}
                <Card className="lg:col-span-2 border border-zinc-200 shadow-sm bg-white overflow-hidden rounded-[2rem] relative group">
                    <CardHeader className="p-8 pb-4 relative">
                        <div className="w-16 h-16 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform duration-500">
                            <CloudIcon className="w-8 h-8 text-zinc-700" />
                        </div>
                        <CardTitle className="text-2xl font-semibold text-zinc-900 tracking-tight">Google Cloud Sync</CardTitle>
                        <CardDescription className="text-zinc-500 text-md">
                            Sincronización maestra con tu almacenamiento personal.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-8 pt-4 space-y-8 relative">
                        {status?.connected ? (
                            <div className="space-y-8">
                                <div className="flex items-center gap-6 p-6 rounded-3xl bg-zinc-50 border border-zinc-100">
                                    <div className="w-12 h-12 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-900 shadow-sm">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-1">Estado</p>
                                        <p className="text-lg font-medium text-zinc-900">{status.email}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-8 rounded-[2rem] bg-zinc-50/50 border border-zinc-100 group/item hover:bg-zinc-50 transition-all duration-300">
                                        <div className="flex items-center gap-3 mb-4 text-zinc-400">
                                            <Clock className="w-5 h-5" />
                                            <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Último Respaldo</span>
                                        </div>
                                        <p className="text-xl font-semibold text-zinc-900">
                                            {status.lastBackupAt
                                                ? format(new Date(status.lastBackupAt), "d 'de' MMMM, HH:mm", { locale: es })
                                                : 'Pendiente'}
                                        </p>
                                    </div>
                                    <div className="p-8 rounded-[2rem] bg-zinc-50/50 border border-zinc-100 relative overflow-hidden group/item">
                                        <div className="flex items-center gap-3 mb-4 text-zinc-400">
                                            <Shield className="w-5 h-5" />
                                            <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Seguridad</span>
                                        </div>
                                        <p className="text-xl font-semibold text-zinc-900">Encriptado</p>
                                    </div>
                                </div>

                                <div className="bg-zinc-50/50 border border-zinc-100 p-5 rounded-2xl flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
                                        <Clock className="w-4 h-4 text-zinc-600" />
                                    </div>
                                    <p className="text-sm font-medium text-zinc-600">
                                        Automático: <span className="text-zinc-900 ml-1">Cada día 03:00 AM</span>
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-4 pt-4 border-t border-zinc-100">
                                    <Button
                                        onClick={handleRunBackup}
                                        disabled={loading}
                                        className="h-14 px-8 rounded-xl bg-zinc-900 hover:bg-black text-white font-medium shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all"
                                    >
                                        {loading ? <RefreshCcw className="w-5 h-5 animate-spin mr-3" /> : <RefreshCcw className="w-5 h-5 mr-3" />}
                                        Respaldar Ahora
                                    </Button>
                                    <Button variant="outline" className="h-14 px-8 rounded-xl font-medium border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900" onClick={handleConnect}>
                                        Cambiar Cuenta
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <Button
                                    onClick={handleConnect}
                                    className="h-16 px-10 rounded-xl bg-zinc-900 hover:bg-black text-white font-medium text-lg shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all"
                                >
                                    <ExternalLink className="w-6 h-6 mr-3" />
                                    Vincular Google Drive
                                </Button>
                                <p className="mt-8 text-zinc-400 text-sm">Recomendado para asegurar tus datos.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Sidebar Cards */}
                <div className="space-y-6">
                    {/* Critical Restoration Card ELEGANT */}
                    <Card className="border border-zinc-200 shadow-sm bg-white overflow-hidden rounded-[2rem] relative group">
                        <CardHeader className="p-8 pb-2">
                            <div className="flex items-center gap-3 mb-2">
                                <AlertTriangle className="w-5 h-5 text-amber-600/80" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600/80">Zona de Riesgo</span>
                            </div>
                            <CardTitle className="text-xl font-semibold text-zinc-900">Restauración</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-4 space-y-6">
                            <p className="text-zinc-500 text-sm leading-relaxed">
                                Carga un archivo Excel para revertir el estado de tu negocio.
                                <br />
                                <span className="text-zinc-900 font-medium">Esta acción reemplaza tus datos actuales.</span>
                            </p>

                            <input
                                type="file"
                                id="restore-file"
                                className="hidden"
                                accept=".xlsx"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) handleRestore(file)
                                }}
                            />
                            <Button
                                className="w-full h-12 rounded-xl bg-white border border-zinc-200 text-zinc-700 hover:bg-red-50 hover:text-red-700 hover:border-red-100 font-medium transition-colors shadow-sm"
                                disabled={loadingRestore}
                                onClick={() => document.getElementById('restore-file')?.click()}
                            >
                                {loadingRestore ? <RefreshCcw className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                                Cargar Excel
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Information Card */}
                    <Card className="border-none bg-zinc-900 text-white shadow-xl rounded-[2rem] p-8 relative overflow-hidden">
                        <h4 className="text-lg font-medium mb-4 flex items-center gap-3">
                            <Shield className="w-5 h-5 text-zinc-400" />
                            Privacidad
                        </h4>
                        <p className="text-zinc-400 text-sm font-light leading-relaxed mb-6">
                            Tus archivos son propiedad exclusiva de tu cuenta. El sistema solo accede a la carpeta designada.
                        </p>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                            <span className="text-xs text-zinc-400 font-medium">Protocolo Seguro</span>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}

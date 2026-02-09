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
            <div className="relative">
                <div className="absolute -left-4 top-0 w-1 h-12 bg-blue-600 rounded-full opacity-50" />
                <h1 className="text-5xl font-black tracking-tight text-zinc-900 mb-3 bg-gradient-to-r from-zinc-900 to-zinc-500 bg-clip-text text-transparent">
                    Centro de Seguridad
                </h1>
                <p className="text-zinc-500 font-medium text-lg max-w-2xl leading-relaxed">
                    Gestiona la integridad de tu información. Tu negocio respaldado y protegido en la nube de Google.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Drive Card */}
                <Card className="lg:col-span-2 border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] bg-white/70 backdrop-blur-2xl overflow-hidden rounded-[2.5rem] relative group border border-white/20">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-blue-500/10 transition-colors duration-700" />

                    <CardHeader className="p-8 pb-4 relative">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-blue-500 to-blue-700 p-[1px] mb-6 shadow-xl shadow-blue-500/20 group-hover:scale-110 transition-transform duration-500">
                            <div className="w-full h-full rounded-[1.4rem] bg-white dark:bg-zinc-900 flex items-center justify-center">
                                <CloudIcon className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>
                        <CardTitle className="text-3xl font-black text-zinc-900 tracking-tight">Google Cloud Sync</CardTitle>
                        <CardDescription className="text-zinc-500 text-md font-medium">
                            Sincronización maestra con tu almacenamiento personal.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-8 pt-4 space-y-8 relative">
                        {status?.connected ? (
                            <div className="space-y-8">
                                <div className="flex items-center gap-6 p-6 rounded-3xl bg-zinc-50/50 border border-zinc-100 dark:bg-zinc-900/20 dark:border-zinc-800">
                                    <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                                        <CheckCircle2 className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">Conexión Activa</p>
                                        <p className="text-xl font-bold text-zinc-900">{status.email}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-8 rounded-[2rem] bg-zinc-50/30 border border-zinc-100 group/item hover:bg-white transition-all duration-300">
                                        <div className="flex items-center gap-3 mb-4 text-zinc-400">
                                            <Clock className="w-5 h-5" />
                                            <span className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Última Sincronización</span>
                                        </div>
                                        <p className="text-2xl font-black text-zinc-900">
                                            {status.lastBackupAt
                                                ? format(new Date(status.lastBackupAt), "d 'de' MMMM, HH:mm", { locale: es })
                                                : 'Pendiente'}
                                        </p>
                                    </div>
                                    <div className="p-8 rounded-[2rem] bg-zinc-50/30 border border-zinc-100 relative overflow-hidden group/item">
                                        <div className="flex items-center gap-3 mb-4 text-zinc-400">
                                            <Shield className="w-5 h-5" />
                                            <span className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Privacidad</span>
                                        </div>
                                        <p className="text-2xl font-black text-emerald-600">Encriptado</p>
                                        <ArrowRight className="absolute right-6 bottom-6 w-8 h-8 text-zinc-200 group-hover/item:text-emerald-200 group-hover/item:translate-x-2 transition-all duration-300" />
                                    </div>
                                </div>

                                <div className="bg-blue-600/5 border border-blue-600/10 p-5 rounded-2xl flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-600/10 flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <p className="text-sm font-semibold text-blue-900">
                                        Auto-sincronización programada: <span className="underline decoration-blue-500/30 ml-1">Cada día 03:00 AM</span>
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-4 pt-4 border-t border-zinc-100">
                                    <Button
                                        onClick={handleRunBackup}
                                        disabled={loading}
                                        className="h-14 px-10 rounded-2xl bg-zinc-900 hover:bg-black text-white font-black shadow-2xl shadow-zinc-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all group/btn"
                                    >
                                        {loading ? <RefreshCcw className="w-5 h-5 animate-spin mr-3" /> : <RefreshCcw className="w-5 h-5 mr-3 group-hover/btn:rotate-180 transition-transform duration-700" />}
                                        Respaldar Ahora
                                    </Button>
                                    <Button variant="ghost" className="h-14 px-8 rounded-2xl font-bold text-zinc-500 hover:text-zinc-900" onClick={handleConnect}>
                                        Cambiar Cuenta
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <Button
                                    onClick={handleConnect}
                                    className="h-20 px-12 rounded-[2rem] bg-blue-600 hover:bg-blue-700 text-white font-black text-xl shadow-[0_20px_40px_-10px_rgba(37,99,235,0.3)] transition-all hover:scale-[1.03] active:scale-[0.97]"
                                >
                                    <ExternalLink className="w-8 h-8 mr-4" />
                                    Vincular Google Drive
                                </Button>
                                <p className="mt-8 text-zinc-400 font-medium">Recomendado para asegurar tus datos contra fallos del sistema.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Sidebar Cards */}
                <div className="space-y-8">
                    {/* Critical Restoration Card REDESIGNED */}
                    <Card className="border-none bg-white border border-red-100 shadow-[0_24px_48px_-12px_rgba(239,68,68,0.08)] overflow-hidden rounded-[2.5rem] relative group">
                        <div className="absolute top-0 left-0 w-full h-2 bg-red-500/20" />
                        <CardHeader className="p-8">
                            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
                                <AlertTriangle className="w-7 h-7 text-red-500" />
                            </div>
                            <CardTitle className="text-2xl font-black text-zinc-900 tracking-tight">Zona Crítica</CardTitle>
                            <CardDescription className="text-red-500 font-bold uppercase tracking-widest text-[10px] mt-1">Uso de Emergencia</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-6">
                            <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                                ¿Borraste algo por error? Carga un respaldo en Excel para volver al pasado.
                                <strong className="text-red-600 block mt-2">Esta acción reemplaza todo tu historial actual.</strong>
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
                                className="w-full h-14 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black shadow-xl shadow-red-200 hover:scale-[1.02] active:scale-[0.98] transition-all border-none"
                                disabled={loadingRestore}
                                onClick={() => document.getElementById('restore-file')?.click()}
                            >
                                {loadingRestore ? <RefreshCcw className="w-5 h-5 animate-spin mr-3" /> : <Upload className="w-5 h-5 mr-3" />}
                                Restaurar Datos
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Information Card */}
                    <Card className="border-none bg-gradient-to-br from-zinc-900 to-black text-white shadow-2xl rounded-[2.5rem] p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                            <Shield size={100} />
                        </div>
                        <h4 className="text-xl font-black mb-4 flex items-center gap-3">
                            <Shield className="w-6 h-6 text-blue-400" />
                            Security Protocol
                        </h4>
                        <p className="text-zinc-400 text-sm font-medium leading-relaxed mb-6">
                            Tus archivos son privados. El sistema solo escribe en la carpeta personalizada para que tú tengas control total.
                        </p>
                        <div className="flex -space-x-3 overflow-hidden">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-zinc-900 bg-zinc-800 flex items-center justify-center">
                                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                                </div>
                            ))}
                            <div className="flex items-center ml-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Verificado</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}

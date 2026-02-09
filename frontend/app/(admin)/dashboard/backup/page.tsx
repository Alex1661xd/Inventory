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
    Upload
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
        if (!confirm('🚨 ¡ATENCIÓN! Esta acción BORRARÁ todos tus datos actuales de ventas, productos y movimientos para reemplazarlos con los del Excel. ¿Estás absolutamente seguro?')) {
            return
        }

        setLoadingRestore(true)
        try {
            const res = await api.backup.restore(file)
            if (res.success) {
                toast.success('¡Datos restaurados con éxito!')
                window.location.reload() // Recargar para ver cambios
            }
        } catch (error: any) {
            toast.error(error.message || 'Error al restaurar los datos')
        } finally {
            setLoadingRestore(false)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 p-4 md:p-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black tracking-tight text-[hsl(var(--foreground))]">
                    Gestión de Información
                </h1>
                <p className="text-[hsl(var(--muted))] font-medium max-w-2xl">
                    Protege y restaura la información de tu negocio. El Excel es tu seguro contra accidentes.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 border-none shadow-xl bg-white/50 backdrop-blur-xl overflow-hidden">
                    <CardHeader className="pb-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4">
                            <CloudIcon className="w-6 h-6 text-blue-500" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Google Drive</CardTitle>
                        <CardDescription className="text-sm font-medium">
                            Tus respaldos se guardan de forma privada en tu cuenta.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {status?.connected ? (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-green-500/5 border border-green-500/10">
                                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/20">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-green-700 uppercase tracking-widest">Conectado</p>
                                        <p className="text-lg font-bold text-[hsl(var(--foreground))]">{status.email}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-6 rounded-2xl bg-white/40 border border-[hsl(var(--border))]">
                                        <div className="flex items-center gap-3 mb-2 text-[hsl(var(--muted))]">
                                            <Clock className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Última Copia</span>
                                        </div>
                                        <p className="text-xl font-black">
                                            {status.lastBackupAt
                                                ? format(new Date(status.lastBackupAt), "d 'de' MMMM, HH:mm", { locale: es })
                                                : 'Nunca'}
                                        </p>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-white/40 border border-[hsl(var(--border))]">
                                        <div className="flex items-center gap-3 mb-2 text-[hsl(var(--muted))]">
                                            <Database className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Estado</span>
                                        </div>
                                        <p className="text-xl font-black text-emerald-600">Al día</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-4 pt-4 border-t border-[hsl(var(--border))]">
                                    <Button
                                        onClick={handleRunBackup}
                                        disabled={loading}
                                        className="h-12 px-8 rounded-xl bg-[hsl(var(--primary))] text-white font-black hover:scale-[1.02] transition-all"
                                    >
                                        {loading ? <RefreshCcw className="w-5 h-5 animate-spin mr-2" /> : <RefreshCcw className="w-5 h-5 mr-2" />}
                                        Respaldar Ahora
                                    </Button>
                                    <Button variant="outline" className="h-12 px-8 rounded-xl font-bold" onClick={handleConnect}>
                                        Cambiar Cuenta
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="py-8 text-center space-y-6">
                                <Button
                                    onClick={handleConnect}
                                    className="h-16 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-xl shadow-blue-500/20 transition-all"
                                >
                                    <ExternalLink className="w-6 h-6 mr-3" />
                                    Vincular Google Drive
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="border-none bg-red-600 text-white shadow-xl">
                        <CardHeader>
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-2">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <CardTitle className="text-xl">Restauración Crítica</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-white/80 text-sm font-medium">
                                Si necesitas volver atrás, sube el archivo Excel de tu último respaldo.
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
                                variant="secondary"
                                className="w-full h-12 font-black text-red-600"
                                disabled={loadingRestore}
                                onClick={() => document.getElementById('restore-file')?.click()}
                            >
                                {loadingRestore ? <RefreshCcw className="w-5 h-5 animate-spin mr-2" /> : <Upload className="w-5 h-5 mr-2" />}
                                Restaurar desde Excel
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-none bg-white/50 backdrop-blur-xl border border-orange-500/10">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Shield className="w-5 h-5 text-orange-500" />
                                Privacidad
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-[hsl(var(--muted))] text-xs font-medium">
                                Los datos se procesan en el servidor para el borrado y carga. Ningún otro negocio tiene acceso a tu información.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

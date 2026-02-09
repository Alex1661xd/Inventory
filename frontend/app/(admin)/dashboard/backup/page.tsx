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
    Shield
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function BackupPage() {
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(false)
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
            // Abrimos en una pestaña nueva
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

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black tracking-tight text-[hsl(var(--foreground))]">
                    Respaldos en la Nube
                </h1>
                <p className="text-[hsl(var(--muted))] font-medium max-w-2xl">
                    Protege la información de tu negocio guardando copias de seguridad automáticas directamente en tu cuenta personal de Google Drive.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Connection Status Card */}
                <Card className="lg:col-span-2 border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] bg-white/50 backdrop-blur-xl overflow-hidden">
                    <CardHeader className="pb-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4">
                            <CloudIcon className="w-6 h-6 text-blue-500" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Google Drive</CardTitle>
                        <CardDescription className="text-sm font-medium">
                            Conecta tu cuenta para habilitar los respaldos automáticos.
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
                                        <p className="text-sm font-black text-green-700 uppercase tracking-widest">Conectado Correctamente</p>
                                        <p className="text-lg font-bold text-[hsl(var(--foreground))]">{status.email}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-6 rounded-2xl bg-white/40 border border-[hsl(var(--border))]">
                                        <div className="flex items-center gap-3 mb-2 text-[hsl(var(--muted))]">
                                            <Clock className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Último Respaldo</span>
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
                                            <span className="text-[10px] font-black uppercase tracking-widest">Destino</span>
                                        </div>
                                        <p className="text-xl font-black">Carpeta /Backups</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-4 pt-4 border-t border-[hsl(var(--border))]">
                                    <Button
                                        onClick={handleRunBackup}
                                        disabled={loading}
                                        className="h-12 px-8 rounded-xl bg-[hsl(var(--primary))] text-white font-black hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    >
                                        {loading ? (
                                            <RefreshCcw className="w-5 h-5 animate-spin mr-2" />
                                        ) : (
                                            <RefreshCcw className="w-5 h-5 mr-2" />
                                        )}
                                        Respaldar Ahora
                                    </Button>
                                    <Button variant="outline" className="h-12 px-8 rounded-xl font-bold" onClick={handleConnect}>
                                        Cambiar Cuenta
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="py-8 text-center space-y-6">
                                <div className="max-w-xs mx-auto space-y-2">
                                    <p className="text-[hsl(var(--muted))] font-medium">
                                        Aún no has vinculado una cuenta de Google para tus respaldos.
                                    </p>
                                </div>
                                <Button
                                    onClick={handleConnect}
                                    className="h-16 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    <ExternalLink className="w-6 h-6 mr-3" />
                                    Vincular Google Drive
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Info Card */}
                <div className="space-y-6">
                    <Card className="border-none bg-[hsl(var(--primary))] text-white shadow-xl shadow-[hsl(var(--primary))]/10">
                        <CardHeader>
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-2">
                                <Shield className="w-5 h-5" />
                            </div>
                            <CardTitle className="text-xl">Seguridad Total</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-white/80 text-sm font-medium leading-relaxed">
                                Solo nosotros tenemos permiso para escribir archivos en tu Drive. Tus archivos están protegidos por la seguridad de Google.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-none bg-white/50 backdrop-blur-xl border border-orange-500/10">
                        <CardHeader>
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center mb-2">
                                <AlertCircle className="w-5 h-5 text-orange-500" />
                            </div>
                            <CardTitle className="text-lg font-bold">Importante</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-[hsl(var(--muted))] text-sm font-medium leading-relaxed">
                                Al conectar tu cuenta, se creará automáticamente una hoja de cálculo con todos tus movimientos de inventario, ventas y clientes.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

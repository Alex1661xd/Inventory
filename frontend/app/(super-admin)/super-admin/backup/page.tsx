'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Cloud, CheckCircle2, XCircle, RefreshCw, Database, Download, Clock } from 'lucide-react'
import { api } from '@/lib/backend'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useSearchParams } from 'next/navigation'

export default function GlobalBackupPage() {
    const [status, setStatus] = useState<{ connected: boolean; email?: string; lastBackupAt?: string } | null>(null)
    const [loading, setLoading] = useState(true)
    const [running, setRunning] = useState(false)
    const searchParams = useSearchParams()

    const loadStatus = async () => {
        try {
            setLoading(true)
            const data = await api.backup.getGlobalStatus()
            setStatus(data)
        } catch (error) {
            console.error('Error al cargar estado:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadStatus()
        if (searchParams.get('success') === 'true') {
            toast.success('Google Drive del Super Admin conectado')
        }
    }, [searchParams])

    const handleConnect = async () => {
        try {
            const { url } = await api.backup.getGlobalAuthUrl()
            window.location.href = url
        } catch {
            toast.error('No se pudo obtener la URL de conexion')
        }
    }

    const handleRunBackup = async () => {
        try {
            setRunning(true)
            toast.info('Iniciando respaldo global...')
            await api.backup.runGlobal()
            toast.success('Respaldo global completado')
            loadStatus()
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Error desconocido'
            toast.error('Error al ejecutar el respaldo: ' + message)
        } finally {
            setRunning(false)
        }
    }

    return (
        <div className="p-0 max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Respaldo Global del Sistema
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                    Como Super Admin, puedes respaldar toda la base de datos por negocio.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Cloud className="w-5 h-5 text-blue-500" />
                            Conexion Google Drive
                        </CardTitle>
                        <CardDescription>
                            Vincular cuenta maestra para almacenar respaldos.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {loading ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Verificando conexion...
                            </div>
                        ) : status?.connected ? (
                            <div className="space-y-4">
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400">
                                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold">Conectado correctamente</p>
                                        <p className="text-xs opacity-80 break-all">{status.email}</p>
                                    </div>
                                </div>
                                <Button variant="outline" onClick={handleConnect} className="w-full">
                                    Cambiar Cuenta
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-muted-foreground">
                                    <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold">Sin conexion</p>
                                        <p className="text-xs">Tus respaldos no se estan guardando en la nube.</p>
                                    </div>
                                </div>
                                <Button
                                    onClick={handleConnect}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-none shadow-lg"
                                >
                                    Conectar Google Drive
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="w-5 h-5 text-indigo-500" />
                            Ejecucion Manual
                        </CardTitle>
                        <CardDescription>
                            Sincroniza toda la plataforma ahora mismo.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-sm">
                                <span className="text-muted-foreground">Ultimo respaldo total:</span>
                                <span className="font-medium">
                                    {status?.lastBackupAt
                                        ? format(new Date(status.lastBackupAt), "d 'de' MMMM, HH:mm", { locale: es })
                                        : 'Nunca'}
                                </span>
                            </div>
                        </div>

                        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-start gap-2 text-blue-600 dark:text-blue-400 text-xs font-medium mb-4">
                            <Clock className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>Proceso automatico: todos los dias a las 03:00 AM</span>
                        </div>

                        <Button
                            disabled={!status?.connected || running}
                            onClick={handleRunBackup}
                            className="w-full h-12 gap-2 text-sm sm:text-md font-semibold transition-all shadow-md active:scale-95"
                            variant={status?.connected ? 'default' : 'secondary'}
                        >
                            {running ? (
                                <>
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                    Respaldando negocios...
                                </>
                            ) : (
                                <>
                                    <Download className="w-5 h-5" />
                                    Ejecutar Respaldo Total
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-xl bg-gradient-to-br from-zinc-800 to-zinc-900 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none hidden sm:block">
                    <Database size={120} />
                </div>
                <CardHeader>
                    <CardTitle>Como funciona el Respaldo Maestro?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 relative z-10">
                    <ul className="grid gap-3 text-sm text-zinc-300">
                        <li className="flex gap-2">
                            <Badge variant="outline" className="text-white border-white/20">1</Badge>
                            <span>Se crea una carpeta raiz llamada <strong>SYSTEM_BACKUPS</strong> en tu Drive.</span>
                        </li>
                        <li className="flex gap-2">
                            <Badge variant="outline" className="text-white border-white/20">2</Badge>
                            <span>Cada backup crea una subcarpeta con fecha (ej: <code>Backup_2024-02-09</code>).</span>
                        </li>
                        <li className="flex gap-2">
                            <Badge variant="outline" className="text-white border-white/20">3</Badge>
                            <span>Dentro se genera un archivo <strong>.xlsx</strong> por negocio activo.</span>
                        </li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    )
}

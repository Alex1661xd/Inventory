'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCcw, Home, LifeBuoy } from 'lucide-react'
import Link from 'next/link'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Aquí podrías reportar el error a un servicio como Sentry
        console.error('Error capturado por la página de error:', error)
    }, [error])

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6 font-sans">
            <div className="max-w-2xl w-full text-center space-y-8">
                {/* Fondo decorativo */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[10%] right-[10%] w-[30%] h-[30%] bg-red-50 rounded-full blur-[100px] opacity-40" />
                    <div className="absolute bottom-[10%] left-[10%] w-[30%] h-[30%] bg-orange-50 rounded-full blur-[100px] opacity-40" />
                </div>

                <div className="relative">
                    {/* Icono de Alerta */}
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-50 mb-8 animate-pulse">
                        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertCircle className="w-10 h-10 text-red-600" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                            ¡Ups! Algo salió mal
                        </h1>
                        <p className="text-slate-500 text-lg max-w-md mx-auto leading-relaxed">
                            Ha ocurrido un error inesperado en la aplicación. No te preocupes, esto ha sido notificado y estamos trabajando en ello.
                        </p>

                        {/* Detalles técnicos (Opcional, se puede quitar en producción real) */}
                        <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 inline-block max-w-full overflow-hidden">
                            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-1">ID del Error</p>
                            <code className="text-xs text-slate-600 font-mono break-all px-2">
                                {error.digest || 'error-desconocido-id'}
                            </code>
                        </div>
                    </div>
                </div>

                {/* Acciones */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 relative z-10 font-bold">
                    <button
                        onClick={() => reset()}
                        className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 text-white text-sm uppercase tracking-widest shadow-2xl hover:bg-slate-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
                    >
                        <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                        Intentar de nuevo
                    </button>

                    <Link
                        href="/"
                        className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-slate-700 text-sm uppercase tracking-widest shadow-lg hover:shadow-xl transition-all active:scale-[0.98] border border-slate-100 flex items-center justify-center gap-2"
                    >
                        <Home className="w-4 h-4" />
                        Ir al Inicio
                    </Link>
                </div>

                {/* Soporte */}
                <div className="pt-12 flex flex-col items-center gap-4">
                    <p className="text-slate-400 text-sm">¿El problema persiste?</p>
                    <a
                        href="#"
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors bg-slate-50 px-4 py-2 rounded-full border border-slate-100 text-xs font-bold uppercase tracking-widest"
                    >
                        <LifeBuoy className="w-4 h-4 text-slate-400" />
                        Contactar Soporte Técnico
                    </a>
                </div>
            </div>
        </div>
    )
}

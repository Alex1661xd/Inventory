'use client'

import Link from 'next/link'
import { Home, ArrowLeft, Package } from 'lucide-react'

// Nota: Framer Motion se usa para las animaciones premium. 
// Si por alguna razón no está instalado, fallará suavemente o podemos usar CSS.
// Viendo el package.json anterior, no vi framer-motion. Voy a usar CSS puro para máxima seguridad.

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 font-sans">
            <div className="max-w-2xl w-full text-center space-y-8">
                {/* Iluminación de fondo suave */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-[25%] -left-[10%] w-[50%] h-[50%] bg-blue-50 rounded-full blur-[120px] opacity-60" />
                    <div className="absolute -bottom-[25%] -right-[10%] w-[50%] h-[50%] bg-indigo-50 rounded-full blur-[120px] opacity-60" />
                </div>

                <div className="relative">
                    {/* Icono Principal con Gradiente */}
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-white shadow-2xl mb-8 relative group transform transition-transform hover:scale-110 duration-500">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl opacity-10 blur-sm group-hover:opacity-20 transition-opacity" />
                        <Package className="w-12 h-12 text-blue-600 relative z-10" />
                    </div>

                    {/* Texto del Error */}
                    <div className="space-y-4">
                        <h1 className="text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-slate-900 to-slate-500 leading-none">
                            404
                        </h1>
                        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
                            Página no encontrada
                        </h2>
                        <p className="text-slate-500 text-lg max-w-md mx-auto leading-relaxed">
                            Lo sentimos, no pudimos encontrar lo que buscabas. Es posible que la página haya sido movida o eliminada.
                        </p>
                    </div>
                </div>

                {/* Acciones */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 relative z-10">
                    <button
                        onClick={() => window.history.back()}
                        className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-slate-700 font-bold text-sm uppercase tracking-widest shadow-lg hover:shadow-xl transition-all active:scale-[0.98] border border-slate-100 flex items-center justify-center gap-2 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Volver Atrás
                    </button>

                    <Link
                        href="/"
                        className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 text-white font-bold text-sm uppercase tracking-widest shadow-2xl hover:bg-slate-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <Home className="w-4 h-4" />
                        Ir al Inicio
                    </Link>
                </div>

                {/* Footer del Error */}
                <div className="pt-12">
                    <div className="flex items-center justify-center gap-2 opacity-50">
                        <div className="font-black text-slate-800 tracking-tighter text-sm uppercase">
                            Inventory<span className="text-slate-400">Pro</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            Sistem de Gestión Inteligente
                        </p>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0px); }
                }
                .floating { animation: float 6s ease-in-out infinite; }
            `}</style>
        </div>
    )
}

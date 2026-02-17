'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/backend'
import { Button } from '@/components/ui/button'
import { ShieldAlert, Users, LogOut, KeyRound, Database, Images, Menu, X } from 'lucide-react'

export default function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        try {
            const user = await api.auth.me()
            if (user.role !== 'SUPER_ADMIN') {
                router.replace('/dashboard')
            } else {
                setLoading(false)
            }
        } catch {
            router.replace('/login')
        }
    }

    const handleLogout = async () => {
        try {
            const supabase = (await import('@/utils/supabase/client')).createClient()
            await supabase.auth.signOut()
            router.push('/login')
        } catch (error) {
            console.error('Error logging out:', error)
            localStorage.clear()
            router.push('/login')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
                <ShieldAlert className="w-12 h-12 animate-pulse text-red-500" />
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col lg:flex-row bg-slate-950 text-slate-100">
            <aside className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-slate-800 p-4 sm:p-6 flex flex-col">
                <div className="flex items-center justify-between mb-2 lg:mb-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/10 rounded-lg">
                            <ShieldAlert className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                            <h1 className="font-black tracking-tighter text-lg">SUPER ADMIN</h1>
                            <p className="text-xs text-slate-500 font-mono">Modo Dios</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={() => setMobileMenuOpen((prev) => !prev)}
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </Button>
                </div>

                <nav className={`${mobileMenuOpen ? 'flex' : 'hidden'} lg:flex flex-col gap-2 pb-2 lg:pb-0`}>
                    <Link
                        href="/super-admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 transition-colors font-bold text-xs sm:text-sm"
                    >
                        <KeyRound className="w-4 h-4 text-emerald-500" />
                        Codigos de Acceso
                    </Link>
                    <Link
                        href="/super-admin/tenants"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 transition-colors font-bold text-xs sm:text-sm"
                    >
                        <Users className="w-4 h-4 text-blue-500" />
                        Gestion de Negocios
                    </Link>
                    <Link
                        href="/super-admin/backup"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 transition-colors font-bold text-xs sm:text-sm"
                    >
                        <Database className="w-4 h-4 text-indigo-500" />
                        Respaldo Global
                    </Link>
                    <Link
                        href="/super-admin/catalog-images"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 transition-colors font-bold text-xs sm:text-sm"
                    >
                        <Images className="w-4 h-4 text-emerald-500" />
                        Imagenes de Catalogo
                    </Link>
                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="mt-2 lg:mt-auto flex items-center justify-start gap-3 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Cerrar Sesion
                    </Button>
                </nav>
            </aside>

            <main className="flex-1 overflow-y-auto">
                <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/backend'
import { Button } from '@/components/ui/button'
import { ShieldAlert, Users, LogOut, KeyRound, Database } from 'lucide-react'

export default function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)

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
        } catch (error) {
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
            // Fallback: clear local storage and redirect
            localStorage.clear()
            router.push('/login')
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
            <ShieldAlert className="w-12 h-12 animate-pulse text-red-500" />
        </div>
    )

    return (
        <div className="flex min-h-screen bg-slate-950 text-slate-100">
            {/* Sidebar */}
            <div className="w-64 border-r border-slate-800 p-6 flex flex-col">
                <div className="flex items-center gap-3 mb-10">
                    <div className="p-2 bg-red-500/10 rounded-lg">
                        <ShieldAlert className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                        <h1 className="font-black tracking-tighter text-lg">SUPER ADMIN</h1>
                        <p className="text-xs text-slate-500 font-mono">Modo Diós</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    <Link href="/super-admin" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 transition-colors font-bold text-sm">
                        <KeyRound className="w-4 h-4 text-emerald-500" />
                        Códigos de Acceso
                    </Link>
                    <Link href="/super-admin/tenants" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 transition-colors font-bold text-sm">
                        <Users className="w-4 h-4 text-blue-500" />
                        Gestión de Negocios
                    </Link>
                    <Link href="/super-admin/backup" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 transition-colors font-bold text-sm">
                        <Database className="w-4 h-4 text-indigo-500" />
                        Respaldo Global
                    </Link>
                </nav>

                <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="mt-auto flex items-center justify-start gap-3 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                </Button>
            </div>

            {/* Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}

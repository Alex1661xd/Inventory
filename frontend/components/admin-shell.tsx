'use client'

import { type ReactNode, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AdminNav } from '@/components/admin-nav'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'

export function AdminShell({
    children,
    userLabel,
}: {
    children: ReactNode
    userLabel: string
}) {
    const [open, setOpen] = useState(false)
    const [loggingOut, setLoggingOut] = useState(false)
    const router = useRouter()

    const handleLogout = async () => {
        if (loggingOut) return
        setLoggingOut(true)
        try {
            const supabase = createClient()
            await supabase.auth.signOut()
            router.push('/login')
        } catch (error) {
            console.error('Error logging out:', error)
            setLoggingOut(false)
        }
    }

    useEffect(() => {
        if (!open) return
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false)
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [open])

    return (
        <div className="min-h-screen bg-[hsl(var(--background))]">
            <div className="flex min-h-screen">
                <aside className="hidden w-72 flex-shrink-0 border-r border-[hsl(var(--border))] bg-gradient-to-b from-[hsl(var(--foreground))] to-[hsl(var(--foreground))] md:block shadow-2xl">
                    <div className="flex h-20 items-center justify-between px-6 border-b border-white/10">
                        <h1 className="font-bold text-xl text-white" style={{ fontFamily: 'var(--font-display)' }}>
                            <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                <span className="text-3xl">📦</span>
                                <span>InventoryPro</span>
                            </Link>
                        </h1>
                    </div>
                    <div className="px-4 pb-4 pt-6">
                        <AdminNav />
                    </div>
                    <div className="mt-auto border-t border-white/10 px-6 py-4 text-xs text-white/70 backdrop-blur-sm space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-semibold">
                                {userLabel.charAt(0).toUpperCase()}
                            </div>
                            <span className="truncate">{userLabel}</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            disabled={loggingOut}
                            className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10 h-9"
                        >
                            <span className="mr-2"></span>
                            {loggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
                        </Button>
                    </div>
                </aside>

                <div className="flex min-w-0 flex-1 flex-col">
                    <header className="fixed top-0 left-0 right-0 z-20 border-b border-white/10 bg-gradient-to-b from-[hsl(var(--foreground)/0.98)] to-[hsl(var(--foreground)/0.92)] px-6 py-4 shadow-2xl backdrop-blur-md md:hidden">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Button variant="ghost" onClick={() => setOpen(true)} aria-label="Abrir menú" size="icon" className="text-white hover:bg-white/10">
                                    <span className="text-lg">☰</span>
                                </Button>
                                <h1 className="font-bold text-lg text-white" style={{ fontFamily: 'var(--font-display)' }}>
                                    <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                        <span className="text-2xl">📦</span>
                                        <span>InventoryPro</span>
                                    </Link>
                                </h1>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="max-w-[30vw] truncate text-xs text-white/70 font-medium">{userLabel}</div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleLogout}
                                    disabled={loggingOut}
                                    className="text-white hover:bg-white/10 h-8 w-8"
                                    title="Cerrar Sesión"
                                >
                                    <span className="text-base">🚪</span>
                                </Button>
                            </div>
                        </div>
                    </header>

                    {open && (
                        <div className="fixed inset-0 z-30 md:hidden">
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
                            <div className="absolute left-0 top-0 h-full w-80 border-r border-[hsl(var(--border))] bg-gradient-to-b from-[hsl(var(--foreground))] to-[hsl(var(--foreground))] shadow-2xl">
                                <div className="flex h-20 items-center justify-between px-6 border-b border-white/10">
                                    <h1 className="font-bold text-xl text-white" style={{ fontFamily: 'var(--font-display)' }}>
                                        <Link href="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-3">
                                            <span className="text-3xl">📦</span>
                                            <span>InventoryPro</span>
                                        </Link>
                                    </h1>
                                    <Button variant="ghost" onClick={() => setOpen(false)} aria-label="Cerrar menú" size="icon" className="text-white hover:bg-white/10">
                                        <span className="text-xl">✕</span>
                                    </Button>
                                </div>
                                <div className="px-4 pb-4 pt-6" onClick={() => setOpen(false)}>
                                    <AdminNav />
                                </div>
                                <div className="mt-auto border-t border-white/10 px-6 py-4 text-xs text-white/70 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-semibold">
                                            {userLabel.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="truncate">{userLabel}</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleLogout}
                                        disabled={loggingOut}
                                        className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10 h-9"
                                    >
                                        
                                        {loggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    <main className="mx-auto w-full max-w-7xl px-6 py-8 mt-24 md:mt-0 md:px-8 md:py-12 animate-fade-in">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    )
}
'use client'

import { type ReactNode, useEffect, useState } from 'react'
import Link from 'next/link'
import { AdminNav } from '@/components/admin-nav'
import { Button } from '@/components/ui/button'

export function AdminShell({
    children,
    userLabel,
}: {
    children: ReactNode
    userLabel: string
}) {
    const [open, setOpen] = useState(false)

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
                    <div className="mt-auto border-t border-white/10 px-6 py-4 text-xs text-white/70 truncate backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-semibold">
                                {userLabel.charAt(0).toUpperCase()}
                            </div>
                            <span className="truncate">{userLabel}</span>
                        </div>
                    </div>
                </aside>

                <div className="flex min-w-0 flex-1 flex-col">
                    <header className="sticky top-0 z-10 border-b border-[hsl(var(--border))] glass-effect px-6 py-4 shadow-sm md:hidden">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Button variant="outline" onClick={() => setOpen(true)} aria-label="Abrir menú" size="icon">
                                    <span className="text-lg">☰</span>
                                </Button>
                                <h1 className="font-bold text-lg text-[hsl(var(--foreground))]" style={{ fontFamily: 'var(--font-display)' }}>
                                    <Link href="/dashboard" className="flex items-center gap-2">
                                        <span className="text-2xl">📦</span>
                                        <span>InventoryPro</span>
                                    </Link>
                                </h1>
                            </div>
                            <div className="max-w-[45vw] truncate text-xs text-[hsl(var(--muted))] font-medium">{userLabel}</div>
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
                                <div className="mt-auto border-t border-white/10 px-6 py-4 text-xs text-white/70 truncate">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-semibold">
                                            {userLabel.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="truncate">{userLabel}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <main className="mx-auto w-full max-w-7xl px-6 py-8 md:px-8 md:py-12 animate-fade-in">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    )
}

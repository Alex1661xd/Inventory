'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navSections = [
    {
        title: "PRINCIPAL",
        links: [
            { href: '/pos', label: 'Venta Nueva', icon: '🛒' },
            { href: '/sales', label: 'Historial Ventas', icon: '📄' },
            { href: '/customers', label: 'Clientes', icon: '👥' },
        ]
    },
    {
        title: "INVENTARIO",
        links: [
            { href: '/products', label: 'Productos', icon: '📦' },
            { href: '/transfers', label: 'Traslados', icon: '🚚' },
            { href: '/warehouse', label: 'Mi Sede', icon: '📍' },
        ]
    }
]

export function SellerNav() {
    const pathname = usePathname()

    return (
        <nav className="flex flex-col gap-6">
            {navSections.map((section, idx) => (
                <div key={idx} className="space-y-2">
                    <div className="flex items-center gap-2 px-4 mb-3">
                        <div className="h-[1px] flex-1 bg-white/10"></div>
                        <span className="text-[10px] font-black text-white/40 tracking-[0.2em] uppercase">
                            {section.title}
                        </span>
                        <div className="h-[1px] flex-1 bg-white/10"></div>
                    </div>

                    <div className="flex flex-col gap-1">
                        {section.links.map((l) => {
                            const active = pathname === l.href || pathname.startsWith(l.href + '/')
                            return (
                                <Link
                                    key={l.href}
                                    href={l.href}
                                    className={cn(
                                        'group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300',
                                        active
                                            ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                                            : 'text-white/70 hover:bg-white/10 hover:text-white hover:shadow-md'
                                    )}
                                >
                                    <span className={cn(
                                        "text-xl transition-transform duration-300",
                                        active ? "scale-110" : "group-hover:scale-110"
                                    )}>
                                        {l.icon}
                                    </span>
                                    <span>{l.label}</span>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            ))}
        </nav>
    )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const links = [
    { href: '/pos', label: 'Punto de Venta', icon: '🛒' },
    { href: '/sales', label: 'Historial Ventas', icon: '📄' },
    { href: '/customers', label: 'Clientes', icon: '👥' },
    { href: '/products', label: 'Productos', icon: '📦' },
    { href: '/transfers', label: 'Traslados', icon: '🚚' },
    { href: '/warehouse', label: 'Mi Sede', icon: '📍' },
]

export function SellerNav() {
    const pathname = usePathname()

    return (
        <nav className="flex flex-col gap-2">
            {links.map((l) => {
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
        </nav>
    )
}

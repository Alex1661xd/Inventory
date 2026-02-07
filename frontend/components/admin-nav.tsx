'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const links = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/products', label: 'Productos', icon: '📦' },
    { href: '/dashboard/inventory', label: 'Inventario', icon: '📋' },
    { href: '/dashboard/warehouses', label: 'Almacenes', icon: '🏢' },
    { href: '/dashboard/categories', label: 'Categorías', icon: '📁' },
    { href: '/dashboard/transfers', label: 'Traslados', icon: '🚚' },
    { href: '/dashboard/suppliers', label: 'Proveedores', icon: '🏭' },
    { href: '/dashboard/cash-flow', label: 'Arqueos de Caja', icon: '💵' },
    { href: '/dashboard/expenses', label: 'Gastos y Utilidad', icon: '💰' },
    { href: '/dashboard/sellers', label: 'Vendedores', icon: '👥' },
]

export function AdminNav() {
    const pathname = usePathname()

    return (
        <nav className="flex flex-col gap-2">
            {links.map((l) => {
                const active = pathname === l.href
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
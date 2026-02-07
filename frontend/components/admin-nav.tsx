'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navSections = [
    {
        title: "PRINCIPAL",
        links: [
            { href: '/dashboard', label: 'Inicio', icon: '📊' },
            { href: '/dashboard/reports', label: 'Reportes y BI', icon: '📈' },
        ]
    },
    {
        title: "OPERACIONES",
        links: [
            { href: '/dashboard/products', label: 'Productos', icon: '📦' },
            { href: '/dashboard/inventory', label: 'Inventario', icon: '📋' },
            { href: '/dashboard/warehouses', label: 'Almacenes', icon: '🏢' },
            { href: '/dashboard/categories', label: 'Categorías', icon: '📁' },
            { href: '/dashboard/transfers', label: 'Traslados', icon: '🚚' },
        ]
    },
    {
        title: "FINANZAS",
        links: [
            { href: '/dashboard/cash-flow', label: 'Arqueos de Caja', icon: '💵' },
            { href: '/dashboard/expenses', label: 'Gastos y Utilidad', icon: '💰' },
        ]
    },
    {
        title: "GESTIÓN",
        links: [
            { href: '/dashboard/sellers', label: 'Vendedores', icon: '👥' },
            { href: '/dashboard/suppliers', label: 'Proveedores', icon: '🏭' },
            { href: '/dashboard/customers', label: 'Clientes', icon: '👤' },
        ]
    }
]

export function AdminNav() {
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
                            const active = pathname === l.href
                            return (
                                <Link
                                    key={l.href}
                                    href={l.href}
                                    className={cn(
                                        'group flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300',
                                        active
                                            ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                                            : 'text-white/70 hover:bg-white/10 hover:text-white hover:translate-x-1'
                                    )}
                                >
                                    <span className={cn(
                                        "text-lg transition-transform duration-300",
                                        active ? "scale-110" : "group-hover:scale-110"
                                    )}>
                                        {l.icon}
                                    </span>
                                    <span className="tracking-tight">{l.label}</span>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            ))}
        </nav>
    )
}

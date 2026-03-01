'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowRightLeft,
  BookOpen,
  Boxes,
  CreditCard,
  ScanLine,
  ShoppingCart,
  Store,
  Users,
  Wallet,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type NavLink = {
  href: string
  label: string
  icon: LucideIcon
}

type NavSection = {
  title: string
  links: NavLink[]
}

const navSections: NavSection[] = [
  {
    title: 'PRINCIPAL',
    links: [
      { href: '/pos', label: 'Venta Nueva', icon: CreditCard },
      { href: '/sales', label: 'Historial Ventas', icon: ShoppingCart },
      { href: '/credit', label: 'Credito', icon: Wallet },
      { href: '/customers', label: 'Clientes', icon: Users },
    ],
  },
  {
    title: 'INVENTARIO',
    links: [
      { href: '/products', label: 'Productos', icon: Boxes },
      { href: '/scanner', label: 'Consultar producto', icon: ScanLine },
      { href: '/transfers', label: 'Traslados', icon: ArrowRightLeft },
      { href: '/warehouse', label: 'Mi Sede', icon: Store },
    ],
  },
  {
    title: 'MI NEGOCIO',
    links: [{ href: '/catalog', label: 'Ver Catalogo', icon: BookOpen }],
  },
]

export function SellerNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-6">
      {navSections.map((section, idx) => (
        <div key={idx} className="space-y-2">
          <div className="flex items-center gap-2 px-4 mb-3">
            <div className="h-[1px] flex-1 bg-white/10" />
            <span className="text-[10px] font-black text-white/40 tracking-[0.2em] uppercase">{section.title}</span>
            <div className="h-[1px] flex-1 bg-white/10" />
          </div>

          <div className="flex flex-col gap-1">
            {section.links.map((l) => {
              const active = pathname === l.href || pathname.startsWith(l.href + '/')
              const Icon = l.icon
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    'group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300',
                    active
                      ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                      : 'text-white/70 hover:bg-white/10 hover:text-white hover:shadow-md',
                  )}
                >
                  <span className={cn('transition-transform duration-300', active ? 'scale-110' : 'group-hover:scale-110')}>
                    <Icon className="h-4 w-4" />
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

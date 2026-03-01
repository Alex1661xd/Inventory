'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'
import {
  Archive,
  Banknote,
  BarChart3,
  Boxes,
  Building2,
  ClipboardList,
  CreditCard,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Receipt,
  ShieldCheck,
  ShoppingBag,
  Tags,
  Truck,
  Users,
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
      { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
      { href: '/dashboard/reports', label: 'Reportes y BI', icon: BarChart3 },
    ],
  },
  {
    title: 'FINANZAS',
    links: [
      { href: '/dashboard/cash-flow', label: 'Arqueos de Caja', icon: Banknote },
      { href: '/dashboard/credit', label: 'Credito', icon: CreditCard },
      { href: '/dashboard/expenses', label: 'Gastos y Utilidad', icon: Receipt },
    ],
  },
  {
    title: 'OPERACIONES',
    links: [
      { href: '/dashboard/products', label: 'Productos', icon: ShoppingBag },
      { href: '/dashboard/inventory', label: 'Inventario', icon: Boxes },
      { href: '/dashboard/warehouses', label: 'Almacenes', icon: Building2 },
      { href: '/dashboard/purchases', label: 'Compras', icon: ClipboardList },
      { href: '/dashboard/transfers', label: 'Traslados', icon: Truck },
    ],
  },
  {
    title: 'GESTION',
    links: [
      { href: '/dashboard/sellers', label: 'Vendedores', icon: Users },
      { href: '/dashboard/suppliers', label: 'Proveedores', icon: Archive },
      { href: '/dashboard/customers', label: 'Clientes', icon: Users },
      { href: '/dashboard/categories', label: 'Categorias', icon: Tags },
    ],
  },
  {
    title: 'MI NEGOCIO',
    links: [
      { href: '/dashboard/catalog', label: 'Mi Catalogo', icon: FolderOpen },
      { href: '/dashboard/backup', label: 'Respaldos (Drive)', icon: FileText },
      { href: '/dashboard/audit', label: 'Auditoria', icon: ShieldCheck },
    ],
  },
]

export function AdminNav() {
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
              const active = pathname === l.href
              const Icon = l.icon
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    'group flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300',
                    active
                      ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                      : 'text-white/70 hover:bg-white/10 hover:text-white hover:translate-x-1',
                  )}
                >
                  <span className={cn('transition-transform duration-300', active ? 'scale-110' : 'group-hover:scale-110')}>
                    <Icon className="h-4 w-4" />
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

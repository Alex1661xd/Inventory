'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/backend'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Boxes,
  Building2,
  CreditCard,
  LucideIcon,
  PackagePlus,
  RefreshCw,
  ScanLine,
  ShoppingCart,
} from 'lucide-react'

type StatItem = {
  title: string
  value: string
  change: string
  icon: LucideIcon
  gradient: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<StatItem[]>([
    {
      title: 'Ventas Totales',
      value: '$0',
      change: '0 Ventas realizadas',
      icon: ShoppingCart,
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'Productos',
      value: '0',
      change: 'Total en catalogo',
      icon: Boxes,
      gradient: 'from-blue-500 to-cyan-600',
    },
    {
      title: 'Inventario',
      value: '0',
      change: 'Unidades totales',
      icon: PackagePlus,
      gradient: 'from-purple-500 to-pink-600',
    },
    {
      title: 'Almacenes',
      value: '0',
      change: 'Ubicaciones activas',
      icon: Building2,
      gradient: 'from-orange-500 to-red-600',
    },
  ])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const loadStats = async () => {
    setLoading(true)
    try {
      const [productsRes, warehouses, stock, invoicesRes] = await Promise.all([
        api.products.list({ limit: 100 }),
        api.warehouses.list(),
        api.inventory.stock({}),
        api.invoices.list({ limit: 100 }),
      ])

      const products = Array.isArray(productsRes) ? productsRes : productsRes?.data || []
      const invoices = Array.isArray(invoicesRes) ? invoicesRes : invoicesRes?.data || []

      const totalInventoryUnits = stock.reduce((acc, item) => acc + item.quantity, 0)
      const paidInvoices = invoices.filter((inv) => inv.status === 'PAID')
      const totalSales = paidInvoices.reduce((acc, inv) => acc + Number(inv.total), 0)

      setStats([
        {
          title: 'Ventas Totales',
          value: formatCurrency(totalSales),
          change: `${paidInvoices.length} Ventas realizadas`,
          icon: ShoppingCart,
          gradient: 'from-emerald-500 to-teal-600',
        },
        {
          title: 'Productos',
          value: products.length.toString(),
          change: 'Total en catalogo',
          icon: Boxes,
          gradient: 'from-blue-500 to-cyan-600',
        },
        {
          title: 'Inventario',
          value: totalInventoryUnits.toString(),
          change: 'Unidades totales',
          icon: PackagePlus,
          gradient: 'from-purple-500 to-pink-600',
        },
        {
          title: 'Almacenes',
          value: warehouses.length.toString(),
          change: 'Ubicaciones activas',
          icon: Building2,
          gradient: 'from-orange-500 to-red-600',
        },
      ])
    } catch (e: any) {
      toast.error('Error cargando estadisticas: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between animate-fade-in">
        <div>
          <h1 className="text-4xl font-bold text-[hsl(var(--foreground))] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Panel de Control
          </h1>
          <p className="text-[hsl(var(--muted))] text-lg">Bienvenido a tu sistema de gestion de inventario</p>
        </div>
        <Button variant="outline" onClick={loadStats} disabled={loading} className="group h-11">
          <RefreshCw className={loading ? 'animate-spin mr-2 h-4 w-4' : 'group-hover:rotate-180 transition-transform duration-500 mr-2 h-4 w-4'} />
          {loading ? 'Actualizando...' : 'Actualizar Estadisticas'}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card
              key={stat.title}
              className="group hover:scale-105 cursor-pointer overflow-hidden relative"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-semibold text-[hsl(var(--muted))]">{stat.title}</CardTitle>
                <div className="group-hover:scale-110 transition-transform duration-300">
                  {loading ? <RefreshCw className="h-6 w-6 animate-spin text-[hsl(var(--muted))]" /> : <Icon className="h-6 w-6 text-[hsl(var(--foreground))]" />}
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-[hsl(var(--foreground))] mb-1">{loading ? '...' : stat.value}</div>
                <p className="text-xs text-[hsl(var(--muted))] font-medium">{stat.change}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-fade-in" style={{ animationDelay: '0.4s' }}>
        <Card className="hover:shadow-2xl transition-shadow duration-300 cursor-pointer" onClick={() => router.push('/dashboard/products')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <PackagePlus className="h-5 w-5" />
              <span>Agregar Producto</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[hsl(var(--muted))]">Anade nuevos productos a tu catalogo con codigos de barras automaticos</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-2xl transition-shadow duration-300 cursor-pointer" onClick={() => router.push('/dashboard/inventory')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Boxes className="h-5 w-5" />
              <span>Actualizar Stock</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[hsl(var(--muted))]">Gestiona el inventario entre tus diferentes almacenes</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-2xl transition-shadow duration-300 cursor-pointer" onClick={() => router.push('/dashboard/scanner')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <ScanLine className="h-5 w-5" />
              <span>Escaner de Productos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[hsl(var(--muted))]">Escanea codigos de barras para consultar productos y stock por almacen</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-[hsl(var(--foreground))] to-[hsl(var(--primary-dark))] text-white border-none animate-fade-in" style={{ animationDelay: '0.6s' }}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <CreditCard className="h-8 w-8 text-white/80" />
            <div>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                Comienza a Gestionar tu Negocio
              </h3>
              <p className="text-white/80 leading-relaxed">
                Utiliza el menu lateral para navegar entre productos, almacenes e inventario. El sistema sincroniza automaticamente tu catalogo digital con las ventas fisicas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

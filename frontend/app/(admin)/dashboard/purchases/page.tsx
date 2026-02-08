'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api, type Purchase } from '@/lib/backend'
import { format } from 'date-fns'
import {
    Plus,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatThousands } from '@/lib/utils'

export default function PurchasesPage() {
    const [purchases, setPurchases] = useState<Purchase[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [dateRange, setDateRange] = useState({ from: '', to: '' })

    const loadPurchases = async () => {
        setLoading(true)
        try {
            const data = await api.purchases.list(dateRange.from, dateRange.to)
            setPurchases(data)
        } catch (e: any) {
            toast.error('Error al cargar compras: ' + e.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadPurchases()
    }, [dateRange])

    const filteredPurchases = purchases.filter(p =>
        p.supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.purchaseNumber.toString().includes(searchQuery)
    )

    const stats = {
        totalInvestment: purchases.reduce((sum, p) => sum + Number(p.total), 0),
        count: purchases.length,
        itemsCount: purchases.reduce((sum, p) => sum + (p._count?.items || 0), 0)
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-4xl font-bold text-[hsl(var(--foreground))]" style={{ fontFamily: 'var(--font-display)' }}>
                        Compras y Reabastecimiento
                    </h2>
                    <p className="text-[hsl(var(--muted))] text-lg">
                        Gestiona las entradas de mercancía y costos de proveedores.
                    </p>
                </div>
                <Link href="/dashboard/purchases/new">
                    <Button className="group h-11 bg-[hsl(var(--primary))] hover:opacity-90 shadow-lg text-white font-bold px-6 rounded-xl">
                        <Plus className="mr-2 h-5 w-5" />
                        Nueva Compra
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-[hsl(var(--surface-elevated))] border-none shadow-sm overflow-hidden">
                    <CardContent className="p-6 flex flex-col items-center justify-center min-h-[120px]">
                        <div className="text-[10px] font-black text-[hsl(var(--muted))] uppercase tracking-tighter opacity-70 mb-2">Inversión Total</div>
                        <div className="text-3xl font-black text-[hsl(var(--foreground))]">
                            ${formatThousands(stats.totalInvestment)}
                        </div>
                        <div className="mt-2 text-[9px] font-medium text-[hsl(var(--muted))] opacity-60">Capital invertido en stock</div>
                    </CardContent>
                </Card>

                <Card className="bg-[hsl(var(--surface-elevated))] border-none shadow-sm overflow-hidden">
                    <CardContent className="p-6 flex flex-col items-center justify-center min-h-[120px]">
                        <div className="text-[10px] font-black text-[hsl(var(--muted))] uppercase tracking-tighter opacity-70 mb-2">Compras Realizadas</div>
                        <div className="text-3xl font-black text-blue-600">
                            {stats.count}
                        </div>
                        <div className="mt-2 text-[9px] font-medium text-[hsl(var(--muted))] opacity-60">Órdenes registradas</div>
                    </CardContent>
                </Card>

                <Card className="bg-[hsl(var(--primary))] text-white border-none shadow-md overflow-hidden">
                    <CardContent className="p-6 flex flex-col items-center justify-center min-h-[120px]">
                        <div className="text-[10px] font-black opacity-80 uppercase tracking-tighter mb-2">Artículos Ingresados</div>
                        <div className="text-3xl font-black">
                            {stats.itemsCount}
                        </div>
                        <div className="mt-2 text-[9px] font-medium opacity-60">Unidades totales recibidas</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters Section */}
            <div className="bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-[hsl(var(--border))]">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">🔍</span>
                        <Input
                            placeholder="Buscar por proveedor o # compra..."
                            className="h-11 pl-10 border-[hsl(var(--border))]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Input
                            type="date"
                            className="h-11 border-[hsl(var(--border))] bg-white/50"
                            value={dateRange.from}
                            onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                        />
                        <Input
                            type="date"
                            className="h-11 border-[hsl(var(--border))] bg-white/50"
                            value={dateRange.to}
                            onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                        />
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-12 h-12 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin" />
                        <p className="text-[hsl(var(--muted))] font-medium">Cargando historial...</p>
                    </div>
                ) : filteredPurchases.length === 0 ? (
                    <div className="text-center py-20 bg-white/30 rounded-3xl border-2 border-dashed border-[hsl(var(--border))]">
                        <div className="text-6xl mb-4">📦</div>
                        <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">Sin registros</h3>
                        <p className="text-[hsl(var(--muted))]">No hemos encontrado ninguna compra que coincida.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredPurchases.map((purchase) => (
                            <Link key={purchase.id} href={`/dashboard/purchases/${purchase.id}`}>
                                <Card className="hover:shadow-xl transition-all duration-300 border-[hsl(var(--border))] group hover:-translate-y-1 bg-white/80">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold">
                                                #{purchase.purchaseNumber}
                                            </div>
                                            <span className="text-[10px] font-bold text-[hsl(var(--muted))] uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">
                                                {format(new Date(purchase.date), 'dd/MM/yyyy')}
                                            </span>
                                        </div>
                                        <h4 className="text-lg font-bold text-[hsl(var(--foreground))] mb-3 group-hover:text-[hsl(var(--primary))] transition-colors line-clamp-1 uppercase">
                                            {purchase.supplier.name}
                                        </h4>
                                        <div className="space-y-2 mb-6">
                                            <div className="flex items-center text-xs text-[hsl(var(--muted))] font-medium">
                                                <span className="mr-2">👤</span> {purchase.buyer.name}
                                            </div>
                                            <div className="flex items-center text-xs text-[hsl(var(--muted))] font-medium">
                                                <span className="mr-2">📦</span> {purchase._count?.items} productos
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-4 border-t border-[hsl(var(--border))]">
                                            <div className="text-2xl font-black text-[hsl(var(--foreground))]">
                                                ${formatThousands(Number(purchase.total))}
                                            </div>
                                            <div className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                {purchase.status}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

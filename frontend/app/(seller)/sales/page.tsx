'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/backend'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Play, Trash2, RefreshCw, ShoppingBag, Clock, CheckCircle2, User } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function SalesHistoryPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'all' | 'completed' | 'pending'>('all')

    // Lists
    const [completedSales, setCompletedSales] = useState<any[]>([])
    const [pendingSales, setPendingSales] = useState<any[]>([])

    useEffect(() => {
        loadInvoices()
    }, [])

    const loadInvoices = async () => {
        setLoading(true)
        try {
            const data = await api.invoices.list()

            // Separate by status
            const completed = data.filter((i: any) => i.status === 'PAID')
            const pending = data.filter((i: any) => i.status === 'PENDING')

            setCompletedSales(completed)
            setPendingSales(pending)
        } catch (e) {
            console.error(e)
            toast.error('Error cargando historial')
        } finally {
            setLoading(false)
        }
    }

    const deletePendingSale = async (id: string) => {
        try {
            await api.invoices.cancel(id)
            toast.success('Venta pendiente eliminada')
            loadInvoices()
        } catch (e) {
            console.error(e)
            toast.error('Error eliminando venta')
        }
    }

    const resumeSale = (sale: any) => {
        router.push(`/pos?resume=${sale.id}`)
        toast.success('Cargando venta...')
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(value)
    }

    const calculatePendingTotal = (sale: any) => {
        if (sale.items) {
            return sale.items.reduce((acc: number, item: any) => acc + (Number(item.unitPrice) * item.quantity), 0)
        }
        return 0
    }

    const allSales = [
        ...pendingSales.map(s => ({ ...s, type: 'pending' })),
        ...completedSales.map(s => ({ ...s, type: 'completed' }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const filteredSales = activeTab === 'all'
        ? allSales
        : activeTab === 'completed'
            ? allSales.filter(s => s.type === 'completed')
            : allSales.filter(s => s.type === 'pending')

    return (
        <div className="space-y-4 pb-20 md:pb-0">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>
                        Historial de Ventas
                    </h1>
                    <p className="text-gray-500 text-sm md:text-base">Registro de todas las transacciones realizadas</p>
                </div>
                <Button variant="outline" onClick={loadInvoices} disabled={loading} className="self-start sm:self-auto">
                    <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                    Actualizar
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                                <CheckCircle2 className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-emerald-700">{completedSales.length}</div>
                                <div className="text-xs text-emerald-600 font-medium">Completadas</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center">
                                <Clock className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-amber-700">{pendingSales.length}</div>
                                <div className="text-xs text-amber-600 font-medium">Pendientes</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200 col-span-2 md:col-span-1">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                                <ShoppingBag className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <div className="text-lg font-bold text-blue-700">
                                    {formatCurrency(completedSales.reduce((acc, s) => acc + Number(s.total || 0), 0))}
                                </div>
                                <div className="text-xs text-blue-600 font-medium">Total Vendido</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-gray-200 pb-2">
                {[
                    { key: 'all', label: 'Todas', count: allSales.length },
                    { key: 'completed', label: 'Completadas', count: completedSales.length },
                    { key: 'pending', label: 'Pendientes', count: pendingSales.length },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as any)}
                        className={cn(
                            "px-4 py-2 text-sm font-medium rounded-lg transition-all",
                            activeTab === tab.key
                                ? "bg-primary text-white shadow-md"
                                : "text-gray-600 hover:bg-gray-100"
                        )}
                    >
                        {tab.label}
                        <Badge
                            variant={activeTab === tab.key ? "secondary" : "outline"}
                            className="ml-2 text-xs"
                        >
                            {tab.count}
                        </Badge>
                    </button>
                ))}
            </div>

            {/* Sales List */}
            <div className="space-y-3">
                {loading ? (
                    <Card className="p-10 text-center">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-500">Cargando ventas...</p>
                    </Card>
                ) : filteredSales.length === 0 ? (
                    <Card className="p-10 text-center border-dashed border-2">
                        <ShoppingBag className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">No hay ventas para mostrar</p>
                        <p className="text-sm text-gray-400 mt-1">Las ventas aparecerán aquí</p>
                    </Card>
                ) : (
                    filteredSales.map((sale) => (
                        <SaleCard
                            key={sale.id}
                            sale={sale}
                            formatCurrency={formatCurrency}
                            calculatePendingTotal={calculatePendingTotal}
                            onResume={resumeSale}
                            onDelete={deletePendingSale}
                        />
                    ))
                )}
            </div>
        </div>
    )
}

function SaleCard({ sale, formatCurrency, calculatePendingTotal, onResume, onDelete }: any) {
    const isPending = sale.type === 'pending'
    const total = isPending ? calculatePendingTotal(sale) : sale.total
    const itemCount = sale.items?.length || 0

    return (
        <Card className={cn(
            "overflow-hidden transition-all hover:shadow-md",
            isPending ? "border-l-4 border-l-amber-500" : "border-l-4 border-l-emerald-500"
        )}>
            <CardContent className="p-0">
                <div className="flex items-center justify-between gap-4 p-5 sm:p-6">
                    {/* Left side: Icon + Info */}
                    <div className="flex items-center gap-4 min-w-0">
                        {/* Status Icon */}
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm",
                            isPending ? "bg-amber-100" : "bg-emerald-100"
                        )}>
                            {isPending ? (
                                <Clock className="h-6 w-6 text-amber-600" />
                            ) : (
                                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                            )}
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex flex-col justify-center">
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className="font-bold text-gray-900 text-base truncate">
                                    {sale.customer?.name || 'Cliente Ocasional'}
                                </span>
                                <Badge
                                    variant={isPending ? "outline" : "secondary"}
                                    className={cn(
                                        "px-2.5 py-0.5 h-6 text-xs font-medium",
                                        isPending ? "border-amber-300 text-amber-700 bg-amber-50" : "bg-emerald-100 text-emerald-700"
                                    )}
                                >
                                    {isPending ? 'Pendiente' : 'Completada'}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <span className="font-medium">{format(new Date(sale.createdAt), "d MMM, HH:mm", { locale: es })}</span>
                                <span className="text-gray-300">•</span>
                                <span>{itemCount} {itemCount === 1 ? 'producto' : 'productos'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right side: Total & Actions */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                        <div className={cn(
                            "text-xl font-bold",
                            isPending ? "text-amber-600" : "text-emerald-700"
                        )}>
                            {formatCurrency(total)}
                        </div>
                        {isPending && (
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 font-medium shadow-sm transition-all hover:scale-105"
                                    onClick={() => onResume(sale)}
                                >
                                    <Play className="h-3.5 w-3.5 mr-2 fill-current" />
                                    Reanudar
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                    onClick={() => {
                                        if (confirm('¿Eliminar esta venta pendiente?')) {
                                            onDelete(sale.id)
                                        }
                                    }}
                                >
                                    <Trash2 className="h-4.5 w-4.5" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

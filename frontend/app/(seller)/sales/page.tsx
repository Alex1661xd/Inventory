'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/backend'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Play, Trash2, RefreshCw, ShoppingBag, Clock, CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

// Loading Modal Component
function LoadingModal({ isOpen, message }: { isOpen: boolean; message: string }) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 animate-scale-in">
                <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
                <div className="text-center">
                    <p className="font-semibold text-gray-900 text-lg">{message}</p>
                    <p className="text-sm text-gray-500 mt-1">Por favor espera...</p>
                </div>
            </div>
        </div>
    )
}

export default function SalesHistoryPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [resumingId, setResumingId] = useState<string | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)
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



    const deletePendingSale = async () => {
        if (!deleteId) return
        try {
            await api.invoices.cancel(deleteId)
            toast.success('Venta pendiente eliminada')
            loadInvoices()
        } catch (e) {
            console.error(e)
            toast.error('Error eliminando venta')
        } finally {
            setDeleteId(null)
        }
    }



    const resumeSale = async (sale: any) => {
        setResumingId(sale.id)
        // Small delay to show loading state
        await new Promise(resolve => setTimeout(resolve, 1500))
        router.push(`/pos?resume=${sale.id}`)
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

    const totalRevenue = completedSales.reduce((acc, s) => acc + Number(s.total || 0), 0)

    return (
        <>
            <LoadingModal isOpen={!!resumingId} message="Cargando venta" />

            <div className="space-y-6 pb-20 md:pb-0">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>
                            Historial de Ventas
                        </h1>
                        <p className="text-gray-500 text-sm md:text-base">Registro de transacciones</p>
                    </div>
                    <Button variant="outline" onClick={loadInvoices} disabled={loading} className="self-start sm:self-auto">
                        <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                        Actualizar
                    </Button>
                </div>

                {/* Stats Summary - Minimal Design */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Card className="bg-white border-gray-200">
                        <CardContent className="h-24 flex flex-col items-center justify-center p-4">
                            <div className="text-3xl font-bold text-gray-900">{completedSales.length}</div>
                            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">Completadas</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-gray-200">
                        <CardContent className="h-24 flex flex-col items-center justify-center p-4">
                            <div className="text-3xl font-bold text-gray-900">{pendingSales.length}</div>
                            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">Pendientes</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-900 border-gray-900 text-white col-span-2 md:col-span-1">
                        <CardContent className="h-24 flex flex-col items-center justify-center p-4">
                            <div className="text-2xl md:text-3xl font-bold">{formatCurrency(totalRevenue)}</div>
                            <div className="text-xs text-gray-400 font-medium uppercase tracking-wide mt-1">Total</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter Tabs - Elegant Style */}
                <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
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
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-600 hover:text-gray-900"
                            )}
                        >
                            {tab.label}
                            <span className={cn(
                                "ml-2 text-xs px-1.5 py-0.5 rounded-full",
                                activeTab === tab.key ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-600"
                            )}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Sales List */}
                <div className="space-y-3">
                    {loading ? (
                        <Card className="p-10 text-center border-gray-200">
                            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-gray-400 mb-2" />
                            <p className="text-gray-500">Cargando ventas...</p>
                        </Card>
                    ) : filteredSales.length === 0 ? (
                        <Card className="p-10 text-center border-dashed border-2 border-gray-200">
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
                                onDelete={(id: string) => setDeleteId(id)}
                                isResuming={resumingId === sale.id}
                            />
                        ))
                    )}
                </div>
            </div>

            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={(val) => !val && setDeleteId(null)}
                onConfirm={deletePendingSale}
                title="¿Eliminar venta pendiente?"
                description="Esta acción no se puede deshacer. La venta pendiente se eliminará permanentemente."
                confirmText="Eliminar"
                cancelText="Cancelar"
                variant="destructive"
            />
        </>
    )
}

function SaleCard({ sale, formatCurrency, calculatePendingTotal, onResume, onDelete, isResuming }: any) {
    const isPending = sale.type === 'pending'
    const total = isPending ? calculatePendingTotal(sale) : sale.total
    const itemCount = sale.items?.length || 0

    return (
        <Card className={cn(
            "overflow-hidden transition-all hover:shadow-md border-gray-200",
            isPending && "bg-gray-50/50"
        )}>
            <CardContent className="p-0">
                <div className="flex items-center justify-between gap-4 p-4 sm:p-5">
                    {/* Left side: Icon + Info */}
                    <div className="flex items-center gap-4 min-w-0">
                        {/* Status Icon - Monochrome */}
                        <div className={cn(
                            "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0",
                            isPending ? "bg-gray-200" : "bg-gray-900"
                        )}>
                            {isPending ? (
                                <Clock className="h-5 w-5 text-gray-600" />
                            ) : (
                                <CheckCircle2 className="h-5 w-5 text-white" />
                            )}
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex flex-col justify-center">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-gray-900 truncate">
                                    {sale.customer?.name || 'Cliente Ocasional'}
                                </span>
                                {isPending && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 font-medium">
                                        Pendiente
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                                <span>{format(new Date(sale.createdAt), "d MMM, HH:mm", { locale: es })}</span>
                                <span className="text-gray-300">•</span>
                                <span>{itemCount} {itemCount === 1 ? 'producto' : 'productos'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right side: Total & Actions */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-lg sm:text-xl font-bold text-gray-900">
                            {formatCurrency(total)}
                        </div>
                        {isPending && (
                            <div className="flex items-center gap-1.5">
                                <Button
                                    size="sm"
                                    className="h-9 px-3 bg-gray-900 hover:bg-gray-800 font-medium"
                                    onClick={() => onResume(sale)}
                                    disabled={isResuming}
                                >
                                    {isResuming ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Play className="h-3.5 w-3.5 mr-1.5 fill-current" />
                                            Reanudar
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"

                                    className="h-9 w-9 text-red-600 bg-red-50 hover:bg-red-100 transition-colors border border-red-100"
                                    onClick={() => onDelete(sale.id)}
                                    disabled={isResuming}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}


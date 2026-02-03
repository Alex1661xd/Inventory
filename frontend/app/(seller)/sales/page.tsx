'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/backend'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { format, isToday, isThisMonth, subDays, isWithinInterval, startOfDay, endOfDay, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { useMemo } from 'react'
import { Play, Trash2, RefreshCw, ShoppingBag, Clock, CheckCircle2, Loader2, Eye, User, Wallet, Calendar, Package, ChevronLeft, ChevronRight } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
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

function SaleDetailsDialog({ saleId, isOpen, onClose, formatCurrency }: { saleId: string | null, isOpen: boolean, onClose: () => void, formatCurrency: any }) {
    const [sale, setSale] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (saleId && isOpen) {
            loadDetails()
        }
    }, [saleId, isOpen])

    const loadDetails = async () => {
        setLoading(true)
        try {
            const data = await api.invoices.get(saleId!)
            setSale(data)
        } catch (e) {
            toast.error('Error cargando detalles')
            onClose()
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-white border-0 shadow-2xl">
                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
                        <p className="text-gray-500 font-medium">Cargando detalles...</p>
                    </div>
                ) : sale && (
                    <div className="flex flex-col h-full max-h-[90vh]">
                        {/* Header Details */}
                        <div className="bg-gray-900 text-white p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">Factura</div>
                                    <h2 className="text-2xl font-bold flex items-center gap-2">
                                        #{sale.id.slice(-6).toUpperCase()}
                                        <span className={cn(
                                            "text-xs px-2 py-0.5 rounded-full",
                                            sale.status === 'PAID' ? "bg-emerald-500/20 text-emerald-400" : "bg-orange-500/20 text-orange-400"
                                        )}>
                                            {sale.status === 'PAID' ? 'Completada' : 'Pendiente'}
                                        </span>
                                    </h2>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">Total</div>
                                    <div className="text-3xl font-black text-white">{formatCurrency(sale.total)}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 mt-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                        <User className="h-5 w-5 text-gray-300" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase font-bold text-gray-400">Cliente</div>
                                        <div className="font-semibold">{sale.customer?.name || 'Cliente Ocasional'}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                        <Wallet className="h-5 w-5 text-gray-300" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase font-bold text-gray-400">Pago</div>
                                        <div className="font-semibold">{sale.paymentMethod || 'Efectivo'}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                        <Calendar className="h-5 w-5 text-gray-300" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase font-bold text-gray-400">Fecha</div>
                                        <div className="font-semibold">{format(new Date(sale.createdAt), "d 'de' MMMM, yyyy", { locale: es })}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                        <Package className="h-5 w-5 text-gray-300" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase font-bold text-gray-400">Vendedor</div>
                                        <div className="font-semibold">{sale.seller?.name || 'Sistema'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="font-bold text-gray-900 border-l-4 border-gray-900 pl-3">Productos</h3>
                                <span className="text-xs font-medium bg-gray-200 text-gray-600 px-2 py-1 rounded">
                                    {sale.items?.length} productos
                                </span>
                            </div>

                            <div className="space-y-3">
                                {sale.items?.map((item: any, idx: number) => (
                                    <div key={idx} className="bg-white p-3 rounded-xl border border-gray-200 flex items-center gap-4 group hover:border-gray-400 transition-colors shadow-sm">
                                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm">
                                            {item.quantity}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-gray-900 truncate">{item.product?.name || 'Producto'}</div>
                                            <div className="text-xs text-gray-500">P. Unitario: {formatCurrency(item.unitPrice)}</div>
                                        </div>
                                        <div className="text-right font-black text-gray-900">
                                            {formatCurrency(item.quantity * item.unitPrice)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 bg-white border-t border-gray-100 flex justify-end">
                            <Button variant="outline" onClick={onClose} className="px-8 border-gray-200 hover:bg-gray-50">Cerrar</Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default function SalesHistoryPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [resumingId, setResumingId] = useState<string | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [detailId, setDetailId] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'all' | 'completed' | 'pending'>('all')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5

    // Lists & Filters
    const [allInvoices, setAllInvoices] = useState<any[]>([])
    const [dateFilter, setDateFilter] = useState<'today' | 'month' | '15days' | 'custom' | 'all'>('month')
    const [customDateRange, setCustomDateRange] = useState<{
        from: string
        to: string
    }>({ from: '', to: '' })

    // Filter Logic
    const filteredInvoices = useMemo(() => {
        if (!allInvoices.length) return []

        const now = new Date()

        return allInvoices.filter(invoice => {
            const date = new Date(invoice.createdAt)

            switch (dateFilter) {
                case 'today':
                    return isToday(date)
                case 'month':
                    return isThisMonth(date)
                case '15days':
                    return isWithinInterval(date, {
                        start: subDays(now, 15),
                        end: now
                    })
                case 'custom':
                    if (customDateRange.from && customDateRange.to) {
                        return isWithinInterval(date, {
                            start: startOfDay(parseISO(customDateRange.from)),
                            end: endOfDay(parseISO(customDateRange.to))
                        })
                    }
                    return true
                case 'all':
                default:
                    return true
            }
        })
    }, [allInvoices, dateFilter, customDateRange])

    const completedSales = useMemo(() => filteredInvoices.filter((i: any) => i.status === 'PAID'), [filteredInvoices])
    const pendingSales = useMemo(() => filteredInvoices.filter((i: any) => i.status === 'PENDING'), [filteredInvoices])

    useEffect(() => {
        loadInvoices()
    }, [])

    // Reset pagination when filter or tab changes
    useEffect(() => {
        setCurrentPage(1)
    }, [dateFilter, customDateRange, activeTab])

    const loadInvoices = async () => {
        setLoading(true)
        try {
            const data = await api.invoices.list()

            setAllInvoices(data)
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

    // Pagination Logic
    const totalPages = Math.ceil(filteredSales.length / itemsPerPage)
    const paginatedSales = filteredSales.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

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

                {/* Date Filters */}
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
                        <div className="flex flex-nowrap lg:flex-wrap gap-1.5 bg-gray-100 p-1 rounded-lg min-w-max lg:min-w-0">
                            {[
                                { id: 'today', label: 'Hoy' },
                                { id: 'month', label: 'Este Mes' },
                                { id: '15days', label: '15 Días' },
                                { id: 'all', label: 'Todo' },
                                { id: 'custom', label: 'Personalizado' },
                            ].map((filter) => (
                                <button
                                    key={filter.id}
                                    onClick={() => setDateFilter(filter.id as any)}
                                    className={cn(
                                        "px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all whitespace-nowrap",
                                        dateFilter === filter.id
                                            ? "bg-white text-gray-900 shadow-sm"
                                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
                                    )}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {dateFilter === 'custom' && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full lg:w-auto animate-in fade-in slide-in-from-left-2 duration-300">
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <input
                                    type="date"
                                    value={customDateRange.from}
                                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, from: e.target.value }))}
                                    className="h-9 px-3 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 w-full sm:w-40"
                                />
                                <span className="text-gray-400">-</span>
                                <input
                                    type="date"
                                    value={customDateRange.to}
                                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, to: e.target.value }))}
                                    className="h-9 px-3 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 w-full sm:w-40"
                                />
                            </div>
                        </div>
                    )}
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
                        <>
                            {paginatedSales.map((sale) => (
                                <SaleCard
                                    key={sale.id}
                                    sale={sale}
                                    formatCurrency={formatCurrency}
                                    calculatePendingTotal={calculatePendingTotal}
                                    onResume={resumeSale}
                                    onDelete={(id: string) => setDeleteId(id)}
                                    onViewDetails={(id: string) => setDetailId(id)}
                                    isResuming={resumingId === sale.id}
                                />
                            ))}

                            {/* Pagination Status & UI */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-gray-100 mt-4">
                                <div className="text-sm text-gray-500 font-medium order-2 sm:order-1">
                                    Mostrando <span className="text-gray-900">{Math.min(filteredSales.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(filteredSales.length, currentPage * itemsPerPage)}</span> de <span className="text-gray-900">{filteredSales.length}</span> ventas
                                </div>

                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-1.5 order-1 sm:order-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="h-9 w-9 p-0 rounded-lg border-gray-200 bg-white"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>

                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                <Button
                                                    key={page}
                                                    variant={currentPage === page ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => setCurrentPage(page)}
                                                    className={cn(
                                                        "h-9 w-9 rounded-lg border-gray-200 transition-all font-bold",
                                                        currentPage === page ? "bg-gray-900 text-white shadow-md scale-105" : "text-gray-600 hover:bg-gray-50 bg-white"
                                                    )}
                                                >
                                                    {page}
                                                </Button>
                                            ))}
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="h-9 w-9 p-0 rounded-lg border-gray-200 bg-white"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <SaleDetailsDialog
                saleId={detailId}
                isOpen={!!detailId}
                onClose={() => setDetailId(null)}
                formatCurrency={formatCurrency}
            />

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

function SaleCard({ sale, formatCurrency, calculatePendingTotal, onResume, onDelete, onViewDetails, isResuming }: any) {
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

                        {!isPending && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-gray-500 hover:text-gray-900 border border-transparent hover:border-gray-200 transition-all bg-gray-50"
                                onClick={() => onViewDetails(sale.id)}
                            >
                                <Eye className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}


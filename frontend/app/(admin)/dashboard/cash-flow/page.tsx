'use client'

import { useState, useEffect } from 'react'
import { api, type CashShift } from '@/lib/backend'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Wallet, ArrowRight, TrendingUp, TrendingDown, Clock, Search, ChevronLeft, ChevronRight, History, Calendar, Filter, Loader2 } from 'lucide-react'
import { formatThousands, cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

const ITEMS_PER_PAGE = 10

// Componente de Modal de Carga
function LoadingModal({ isOpen, message }: { isOpen: boolean; message: string }) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
                <div className="text-center">
                    <p className="font-bold text-gray-900 text-xl">{message}</p>
                    <p className="text-sm text-gray-500 mt-1">Por favor espera un momento...</p>
                </div>
            </div>
        </div>
    )
}

export default function CashFlowHistoryPage() {
    const [history, setHistory] = useState<CashShift[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingMessage, setLoadingMessage] = useState('Cargando historial...')
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)

    // Filters
    const today = new Date()
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0])
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0])
    const [activeDateFilter, setActiveDateFilter] = useState<string>('month')

    useEffect(() => {
        loadHistory()
    }, [startDate, endDate])

    const loadHistory = async () => {
        setLoading(true)
        try {
            const data = await api.cashFlow.history({
                startDate,
                endDate
            })
            setHistory(data)
        } catch (error) {
            console.error('Error loading history:', error)
            toast.error('Error al cargar historial de caja')
        } finally {
            setLoading(false)
        }
    }

    const handleQuickFilter = (type: string) => {
        if (type === activeDateFilter && type !== 'custom') return

        setLoadingMessage('Actualizando período...')
        const now = new Date()
        const todayStr = now.toISOString().split('T')[0]
        setEndDate(todayStr)
        setActiveDateFilter(type)

        if (type === 'today') {
            setStartDate(todayStr)
        } else if (type === '15days') {
            const date = new Date()
            date.setDate(date.getDate() - 14)
            setStartDate(date.toISOString().split('T')[0])
        } else if (type === 'month') {
            const date = new Date(now.getFullYear(), now.getMonth(), 1)
            setStartDate(date.toISOString().split('T')[0])
        }
    }

    const filteredHistory = history.filter(shift =>
        shift.seller?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shift.id.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const paginatedHistory = filteredHistory.slice(startIndex, startIndex + ITEMS_PER_PAGE)

    const stats = {
        open: history.filter(s => s.status === 'OPEN').length,
        closed: history.filter(s => s.status === 'CLOSED').length,
        totalInitial: history.reduce((acc, s) => acc + Number(s.initialAmount), 0)
    }

    return (
        <>
            <LoadingModal isOpen={loading} message={loadingMessage} />

            <div className="space-y-8 pb-10 animate-in fade-in duration-700">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider">
                            <History className="h-3 w-3" /> Auditoría de Caja
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                            Control de Flujo
                        </h1>
                        <p className="text-gray-500 max-w-md">
                            Gestión centralizada de arqueos, turnos y movimientos de efectivo por vendedor.
                        </p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Buscar por vendedor o ID..."
                                className="pl-10 h-12 bg-white border-gray-200 rounded-2xl shadow-sm focus:ring-indigo-500 transition-all font-medium"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value)
                                    setCurrentPage(1)
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Filtros de Fecha */}
                <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm rounded-3xl overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-end justify-between">
                            <div className="flex flex-wrap gap-4 items-end">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Período de Reporte</Label>
                                    <div className="flex p-1 bg-gray-100/80 rounded-xl w-fit border border-gray-200/50">
                                        {[
                                            { id: 'today', label: 'Hoy' },
                                            { id: '15days', label: '14 Días' },
                                            { id: 'month', label: 'Este Mes' },
                                            { id: 'custom', label: 'Personalizado' },
                                        ].map((f) => (
                                            <button
                                                key={f.id}
                                                onClick={() => handleQuickFilter(f.id)}
                                                className={cn(
                                                    "px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200",
                                                    activeDateFilter === f.id
                                                        ? "bg-white text-gray-900 shadow-sm"
                                                        : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
                                                )}
                                            >
                                                {f.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {activeDateFilter === 'custom' && (
                                    <div className="flex items-end gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-medium text-gray-400">Desde</Label>
                                            <Input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                className="w-40 h-10 rounded-xl bg-white border-gray-200 shadow-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-medium text-gray-400">Hasta</Label>
                                            <Input
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                className="w-40 h-10 rounded-xl bg-white border-gray-200 shadow-sm"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Cajas Abiertas"
                        value={stats.open.toString()}
                        icon={<Clock className="h-5 w-5 text-emerald-600" />}
                        color="bg-emerald-50"
                    />
                    <StatCard
                        title="Cajas Cerradas"
                        value={stats.closed.toString()}
                        icon={<Wallet className="h-5 w-5 text-indigo-600" />}
                        color="bg-indigo-50"
                    />
                    <StatCard
                        title="Promedio Ventas"
                        value={`$${formatThousands(stats.closed > 0 ? (history.filter(s => s.status === 'CLOSED').reduce((acc, s) => {
                            const system = Number(s.systemAmount || 0);
                            const initial = Number(s.initialAmount || 0);
                            const netManual = s.transactions.reduce((tacc, tx) => {
                                const amt = Number(tx.amount);
                                return tacc + (tx.type === 'DEPOSIT' ? amt : -amt);
                            }, 0);
                            return acc + (system - initial - netManual);
                        }, 0) / stats.closed) : 0)}`}
                        icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
                        color="bg-blue-50"
                    />
                    <StatCard
                        title="Diferencia Total"
                        value={`${history.reduce((acc, s) => acc + Number(s.difference || 0), 0) >= 0 ? '+' : ''}$${formatThousands(history.reduce((acc, s) => acc + Number(s.difference || 0), 0))}`}
                        icon={<TrendingDown className="h-5 w-5 text-amber-600" />}
                        color="bg-amber-50"
                    />
                </div>

                {/* History Table */}
                <Card className="border-none shadow-2xl shadow-indigo-100/50 bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50/80 border-none hover:bg-gray-50/80">
                                    <TableHead className="py-5 pl-8 text-xs font-bold uppercase tracking-wider text-gray-500">Vendedor</TableHead>
                                    <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-500">Horarios</TableHead>
                                    <TableHead className="text-right text-xs font-bold uppercase tracking-wider text-gray-500">Base Inicial</TableHead>
                                    <TableHead className="text-right text-xs font-bold uppercase tracking-wider text-gray-500">Ventas (Efe)</TableHead>
                                    <TableHead className="text-right text-xs font-bold uppercase tracking-wider text-gray-500">Movimientos</TableHead>
                                    <TableHead className="text-right text-xs font-bold uppercase tracking-wider text-gray-500">Esperado</TableHead>
                                    <TableHead className="text-right text-xs font-bold uppercase tracking-wider text-gray-500">Arqueo Real</TableHead>
                                    <TableHead className="text-right text-xs font-bold uppercase tracking-wider text-gray-500">Diferencia</TableHead>
                                    <TableHead className="pr-8 text-center text-xs font-bold uppercase tracking-wider text-gray-500">Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i} className="animate-pulse">
                                            <TableCell colSpan={9} className="h-16 bg-gray-50/30" />
                                        </TableRow>
                                    ))
                                ) : paginatedHistory.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center py-20 text-gray-400 font-medium">
                                            No se encontraron registros que coincidan con la búsqueda o el período.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedHistory.map((shift: any) => {
                                        const initial = Number(shift.initialAmount)
                                        const final = shift.finalAmount ? Number(shift.finalAmount) : 0
                                        const system = shift.systemAmount ? Number(shift.systemAmount) : 0
                                        const diff = shift.difference ? Number(shift.difference) : 0
                                        const isOpen = shift.status === 'OPEN'

                                        return (
                                            <TableRow key={shift.id} className="hover:bg-indigo-50/30 transition-colors border-b border-gray-100 last:border-none">
                                                <TableCell className="py-5 pl-8">
                                                    <div className="font-bold text-gray-900">{shift.seller?.name || 'Vendedor'}</div>
                                                    <div className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded w-fit mt-1">
                                                        ID: {shift.id.substring(0, 8)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full w-fit">
                                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                                            {format(new Date(shift.openingTime), 'dd MMM, HH:mm', { locale: es })}
                                                        </div>
                                                        {!isOpen && shift.closingTime && (
                                                            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium ml-2">
                                                                <ArrowRight className="h-3 w-3" />
                                                                {format(new Date(shift.closingTime), 'HH:mm', { locale: es })}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-medium text-gray-500">
                                                    ${formatThousands(initial)}
                                                </TableCell>
                                                <TableCell className="text-right font-semibold text-gray-900">
                                                    {isOpen ? (
                                                        <span className="text-gray-300">$0</span>
                                                    ) : (
                                                        <div className="text-emerald-600">
                                                            ${formatThousands(system - initial - shift.transactions.reduce((acc: number, tx: any) => {
                                                                const amt = Number(tx.amount)
                                                                return acc + (tx.type === 'DEPOSIT' ? amt : -amt)
                                                            }, 0))}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className={cn(
                                                        "text-xs font-medium",
                                                        shift.transactions.length > 0 ? "text-gray-900" : "text-gray-300"
                                                    )}>
                                                        {shift.transactions.length > 0 ? (
                                                            <>
                                                                {shift.transactions.reduce((acc: number, tx: any) => {
                                                                    const amt = Number(tx.amount)
                                                                    return acc + (tx.type === 'DEPOSIT' ? amt : -amt)
                                                                }, 0) > 0 && "+"}
                                                                ${formatThousands(shift.transactions.reduce((acc: number, tx: any) => {
                                                                    const amt = Number(tx.amount)
                                                                    return acc + (tx.type === 'DEPOSIT' ? amt : -amt)
                                                                }, 0))}
                                                            </>
                                                        ) : '$0'}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="bg-gray-100/50 px-3 py-1.5 rounded-xl inline-block font-bold text-gray-900 border border-gray-200/50">
                                                        ${isOpen ? formatThousands(initial) : formatThousands(system)}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {!isOpen ? (
                                                        <span className="font-black text-indigo-600 text-lg">
                                                            ${formatThousands(final)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-300 italic text-xs">Pendiente...</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {!isOpen ? (
                                                        <div className={cn(
                                                            "inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-black ring-1 ring-inset",
                                                            diff === 0 ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20" :
                                                                diff > 0 ? "bg-blue-50 text-blue-700 ring-blue-600/20" :
                                                                    "bg-red-50 text-red-700 ring-red-600/20"
                                                        )}>
                                                            {diff > 0 && "+"}
                                                            ${formatThousands(diff)}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-200">--</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="pr-8 text-center">
                                                    <Badge
                                                        className={cn(
                                                            "rounded-full px-4 py-1 border-none shadow-sm font-bold uppercase text-[10px]",
                                                            isOpen ? "bg-indigo-600 text-white animate-pulse" : "bg-gray-200 text-gray-600"
                                                        )}
                                                    >
                                                        {isOpen ? 'En Curso' : 'Cerrada'}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-5 bg-gray-50/30 border-t border-gray-100/50">
                            <p className="text-sm text-gray-500 font-medium">
                                Mostrando <span className="text-gray-900">{startIndex + 1}</span>-
                                <span className="text-gray-900">{Math.min(startIndex + ITEMS_PER_PAGE, filteredHistory.length)}</span> de
                                <span className="text-gray-900"> {filteredHistory.length}</span> registros
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-9 w-9 rounded-xl border-gray-200 bg-white"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4 text-gray-600" />
                                </Button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <Button
                                            key={page}
                                            variant={currentPage === page ? "default" : "ghost"}
                                            size="sm"
                                            className={cn(
                                                "h-9 w-9 rounded-xl text-xs font-bold transition-all",
                                                currentPage === page ? "bg-gray-900 text-white shadow-md scale-105" : "text-gray-600 hover:bg-gray-100"
                                            )}
                                            onClick={() => setCurrentPage(page)}
                                        >
                                            {page}
                                        </Button>
                                    ))}
                                </div>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-9 w-9 rounded-xl border-gray-200 bg-white"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight className="h-4 w-4 text-gray-600" />
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </>
    )
}

function StatCard({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) {
    return (
        <Card className="border-none shadow-lg shadow-indigo-100/30 overflow-hidden bg-white group hover:-translate-y-1 transition-all duration-300">
            <CardContent className="p-6">
                <div className="flex justify-between items-start">
                    <div className="space-y-4">
                        <div className={cn("p-2.5 rounded-2xl w-fit shadow-inner transition-transform group-hover:scale-110 duration-300", color)}>
                            {icon}
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</p>
                            <p className="text-2xl font-black text-gray-900 tabular-nums leading-none">{value}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

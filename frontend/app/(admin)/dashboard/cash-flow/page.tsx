'use client'

import { useState, useEffect } from 'react'
import { api, type CashShift } from '@/lib/backend'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Wallet, ArrowRight, TrendingUp, TrendingDown, Clock, Search, ChevronLeft, ChevronRight, History } from 'lucide-react'
import { formatThousands, cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const ITEMS_PER_PAGE = 10

export default function CashFlowHistoryPage() {
    const [history, setHistory] = useState<CashShift[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        loadHistory()
    }, [])

    const loadHistory = async () => {
        setLoading(true)
        try {
            const data = await api.cashFlow.history()
            setHistory(data)
        } catch (error) {
            toast.error('Error al cargar historial de caja')
        } finally {
            setLoading(false)
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
        <div className="space-y-8 pb-10 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
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

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Buscar por vendedor o ID..."
                        className="pl-10 h-12 bg-white border-gray-200 rounded-2xl shadow-sm focus:ring-indigo-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value)
                            setCurrentPage(1)
                        }}
                    />
                </div>
            </div>

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
                                        <TableCell colSpan={8} className="h-16 bg-gray-50/30" />
                                    </TableRow>
                                ))
                            ) : paginatedHistory.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-20 text-gray-400 font-medium">
                                        No se encontraron registros que coincidan con la búsqueda.
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
                                                    {!isOpen && (
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
                    <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Mostrando <span className="font-bold">{startIndex + 1}</span> a <span className="font-bold">{Math.min(startIndex + ITEMS_PER_PAGE, filteredHistory.length)}</span> de <span className="font-bold">{filteredHistory.length}</span> registros
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                className="rounded-xl h-10 w-10 p-0 border-gray-200"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <Button
                                    key={i}
                                    variant={currentPage === i + 1 ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={cn(
                                        "rounded-xl h-10 w-10 p-0 font-bold",
                                        currentPage === i + 1 ? "bg-black hover:bg-black/90 shadow-lg shadow-black/20" : "border-gray-200"
                                    )}
                                >
                                    {i + 1}
                                </Button>
                            ))}
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                className="rounded-xl h-10 w-10 p-0 border-gray-200"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
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

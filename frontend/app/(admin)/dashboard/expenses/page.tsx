'use client'

import { useState, useEffect } from 'react'
import { api, Expense, ExpenseCategory, Supplier } from '@/lib/backend'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { formatThousands, parseThousands, cn } from '@/lib/utils'
import { Plus, Trash2, Receipt, TrendingUp, TrendingDown, DollarSign, Calendar, Filter, PiggyBank, Building2, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
    RENT: 'Arriendo',
    UTILITIES: 'Servicios',
    PAYROLL: 'Nómina',
    SUPPLIES: 'Suministros',
    MAINTENANCE: 'Mantenimiento',
    TRANSPORT: 'Transporte',
    MARKETING: 'Marketing',
    TAXES: 'Impuestos',
    INSURANCE: 'Seguros',
    OTHER: 'Otros',
}

const CATEGORY_ICONS: Record<ExpenseCategory, string> = {
    RENT: '🏠',
    UTILITIES: '💡',
    PAYROLL: '👷',
    SUPPLIES: '📦',
    MAINTENANCE: '🔧',
    TRANSPORT: '🚚',
    MARKETING: '📢',
    TAXES: '🏛️',
    INSURANCE: '🛡️',
    OTHER: '📋',
}

type ProfitLossData = {
    period: { startDate: string; endDate: string };
    revenue: { totalSales: number; salesCount: number };
    costOfGoodsSold: number;
    grossProfit: number;
    grossMargin: number;
    operatingExpenses: { byCategory: { category: string; total: number }[]; totalExpenses: number };
    netProfit: number;
    netMargin: number;
}

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

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([])
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingMessage, setLoadingMessage] = useState('Cargando datos...')
    const [showCreate, setShowCreate] = useState(false)
    const [profitLoss, setProfitLoss] = useState<ProfitLossData | null>(null)

    // Filters
    const today = new Date()
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0])
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0])
    const [filterCategory, setFilterCategory] = useState<string>('')
    const [activeDateFilter, setActiveDateFilter] = useState<string>('month')

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

    // Form state
    const [formAmount, setFormAmount] = useState('')
    const [formDescription, setFormDescription] = useState('')
    const [formCategory, setFormCategory] = useState<ExpenseCategory>('OTHER')
    const [formDate, setFormDate] = useState(today.toISOString().split('T')[0])
    const [formSupplierId, setFormSupplierId] = useState('')
    const [submitting, setSubmitting] = useState(false)

    // Pagination & Delete confirmation
    const [currentPage, setCurrentPage] = useState(1)
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null)
    const itemsPerPage = 10

    useEffect(() => {
        loadData()
    }, [startDate, endDate, filterCategory])

    const loadData = async () => {
        setLoading(true)
        try {
            const [expensesData, suppliersData, plData] = await Promise.all([
                api.expenses.list({
                    startDate,
                    endDate,
                    category: filterCategory || undefined
                }),
                api.suppliers.list(),
                api.expenses.profitLoss(startDate, endDate)
            ])
            setExpenses(expensesData)
            setSuppliers(suppliersData)
            setProfitLoss(plData)
        } catch (error) {
            console.error('Error loading data:', error)
            toast.error('Error al cargar los datos')
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async () => {
        if (!formAmount || Number(parseThousands(formAmount)) <= 0) {
            return toast.error('Ingresa un monto válido')
        }
        if (!formDescription.trim()) {
            return toast.error('Ingresa una descripción')
        }

        setLoadingMessage('Registrando gasto...')
        setSubmitting(true)
        try {
            await api.expenses.create({
                amount: parseThousands(formAmount),
                description: formDescription.trim(),
                category: formCategory,
                date: formDate,
                supplierId: formSupplierId || undefined,
            })
            toast.success('Gasto registrado correctamente')
            setShowCreate(false)
            resetForm()
            loadData()
        } catch (error) {
            toast.error('Error al registrar el gasto')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = (id: string) => {
        setExpenseToDelete(id)
        setDeleteConfirmOpen(true)
    }

    const confirmDelete = async () => {
        if (!expenseToDelete) return

        setLoadingMessage('Eliminando gasto...')
        setSubmitting(true)
        try {
            await api.expenses.remove(expenseToDelete)
            toast.success('Gasto eliminado')
            loadData()
        } catch (error) {
            toast.error('Error al eliminar')
        } finally {
            setSubmitting(false)
            setExpenseToDelete(null)
        }
    }

    const resetForm = () => {
        setFormAmount('')
        setFormDescription('')
        setFormCategory('OTHER')
        setFormDate(today.toISOString().split('T')[0])
        setFormSupplierId('')
    }

    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

    return (
        <>
            <LoadingModal isOpen={loading || submitting} message={loadingMessage} />

            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>
                            💰 Gastos y Utilidad
                        </h1>
                        <p className="text-gray-500 mt-1">Control de gastos operativos y estado de resultados</p>
                    </div>
                    <Button onClick={() => setShowCreate(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Registrar Gasto
                    </Button>
                </div>

                {/* Filtros */}
                <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-end justify-between">
                            <div className="flex flex-wrap gap-4 items-end">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Período</Label>
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
                                                className="w-40 h-10 rounded-xl bg-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-medium text-gray-400">Hasta</Label>
                                            <Input
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                className="w-40 h-10 rounded-xl bg-white"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2 w-full lg:w-auto">
                                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Filtrar por Categoría</Label>
                                <Select
                                    value={filterCategory || "ALL"}
                                    onValueChange={(v: string) => setFilterCategory(v === "ALL" ? "" : v)}
                                >
                                    <SelectTrigger className="w-full lg:w-60 h-10 rounded-xl bg-white">
                                        <SelectValue placeholder="Todas las categorías" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl shadow-xl">
                                        <SelectItem value="ALL">Todas las categorías</SelectItem>
                                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>
                                                <span className="flex items-center gap-2">
                                                    <span>{CATEGORY_ICONS[key as ExpenseCategory]}</span>
                                                    <span>{label}</span>
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Estado de Resultados (P&L) */}
                {profitLoss && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-xl bg-emerald-500/10">
                                        <TrendingUp className="h-6 w-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-emerald-700 font-medium">Ventas</p>
                                        <p className="text-2xl font-bold text-emerald-900">
                                            ${formatThousands(profitLoss.revenue.totalSales)}
                                        </p>
                                        <p className="text-xs text-emerald-600">{profitLoss.revenue.salesCount} facturas</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-xl bg-orange-500/10">
                                        <Receipt className="h-6 w-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-orange-700 font-medium">Costo de Ventas</p>
                                        <p className="text-2xl font-bold text-orange-900">
                                            ${formatThousands(profitLoss.costOfGoodsSold)}
                                        </p>
                                        <p className="text-xs text-orange-600">Costo de mercancía</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-xl bg-blue-500/10">
                                        <PiggyBank className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-blue-700 font-medium">Gastos Operativos</p>
                                        <p className="text-2xl font-bold text-blue-900">
                                            ${formatThousands(profitLoss.operatingExpenses.totalExpenses)}
                                        </p>
                                        <p className="text-xs text-blue-600">{profitLoss.operatingExpenses.byCategory.length} categorías</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className={cn(
                            "border-2",
                            profitLoss.netProfit >= 0
                                ? "bg-gradient-to-br from-green-50 to-green-100/50 border-green-400"
                                : "bg-gradient-to-br from-red-50 to-red-100/50 border-red-400"
                        )}>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "p-3 rounded-xl",
                                        profitLoss.netProfit >= 0 ? "bg-green-500/10" : "bg-red-500/10"
                                    )}>
                                        <DollarSign className={cn(
                                            "h-6 w-6",
                                            profitLoss.netProfit >= 0 ? "text-green-600" : "text-red-600"
                                        )} />
                                    </div>
                                    <div>
                                        <p className={cn(
                                            "text-sm font-medium",
                                            profitLoss.netProfit >= 0 ? "text-green-700" : "text-red-700"
                                        )}>
                                            Utilidad Neta
                                        </p>
                                        <p className={cn(
                                            "text-2xl font-bold",
                                            profitLoss.netProfit >= 0 ? "text-green-900" : "text-red-900"
                                        )}>
                                            ${formatThousands(profitLoss.netProfit)}
                                        </p>
                                        <p className={cn(
                                            "text-xs",
                                            profitLoss.netProfit >= 0 ? "text-green-600" : "text-red-600"
                                        )}>
                                            Margen: {profitLoss.netMargin}%
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Resumen de Resultado */}
                {profitLoss && (
                    <Card className="overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
                            <CardTitle className="flex items-center gap-2">
                                📊 Estado de Resultados
                                <span className="text-sm font-normal text-white/70 ml-2">
                                    {new Date(startDate).toLocaleDateString('es-CO')} - {new Date(endDate).toLocaleDateString('es-CO')}
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                <div className="flex justify-between items-center p-4 hover:bg-gray-50">
                                    <span className="font-medium">Ingresos por Ventas</span>
                                    <span className="text-lg font-bold text-emerald-600">
                                        +${formatThousands(profitLoss.revenue.totalSales)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-4 hover:bg-gray-50 pl-8">
                                    <span className="text-gray-600">(-) Costo de Mercancía Vendida</span>
                                    <span className="text-red-600">
                                        -${formatThousands(profitLoss.costOfGoodsSold)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-blue-50/50 font-medium">
                                    <span>= Utilidad Bruta</span>
                                    <span className={profitLoss.grossProfit >= 0 ? "text-blue-600" : "text-red-600"}>
                                        ${formatThousands(profitLoss.grossProfit)}
                                        <span className="text-xs ml-1 opacity-70">({profitLoss.grossMargin}%)</span>
                                    </span>
                                </div>

                                {profitLoss.operatingExpenses.byCategory.map((cat) => (
                                    <div key={cat.category} className="flex justify-between items-center p-4 hover:bg-gray-50 pl-8">
                                        <span className="text-gray-600 flex items-center gap-2">
                                            {CATEGORY_ICONS[cat.category as ExpenseCategory] || '📋'}
                                            {CATEGORY_LABELS[cat.category as ExpenseCategory] || cat.category}
                                        </span>
                                        <span className="text-red-600">
                                            -${formatThousands(cat.total)}
                                        </span>
                                    </div>
                                ))}

                                <div className={cn(
                                    "flex justify-between items-center p-5 font-bold text-lg",
                                    profitLoss.netProfit >= 0 ? "bg-green-100" : "bg-red-100"
                                )}>
                                    <span>= UTILIDAD NETA</span>
                                    <span className={profitLoss.netProfit >= 0 ? "text-green-700" : "text-red-700"}>
                                        ${formatThousands(profitLoss.netProfit)}
                                        <span className="text-sm ml-1 opacity-70">({profitLoss.netMargin}%)</span>
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Lista de Gastos */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>📋 Registro de Gastos</span>
                            <span className="text-sm font-normal text-gray-500">
                                Total: <span className="font-bold text-gray-900">${formatThousands(totalExpenses)}</span>
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8 text-gray-500">Cargando gastos...</div>
                        ) : expenses.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-5xl mb-4">💸</div>
                                <p className="text-gray-500">No hay gastos registrados en este período</p>
                                <Button onClick={() => setShowCreate(true)} variant="outline" className="mt-4">
                                    Registrar primer gasto
                                </Button>
                            </div>
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Fecha</TableHead>
                                            <TableHead>Categoría</TableHead>
                                            <TableHead>Descripción</TableHead>
                                            <TableHead>Proveedor</TableHead>
                                            <TableHead className="text-right">Monto</TableHead>
                                            <TableHead className="w-12"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {expenses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((expense) => (
                                            <TableRow key={expense.id}>
                                                <TableCell className="font-medium">
                                                    {new Date(expense.date).toLocaleDateString('es-CO')}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-xs font-medium">
                                                        {CATEGORY_ICONS[expense.category]}
                                                        {CATEGORY_LABELS[expense.category]}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="max-w-[200px] truncate">
                                                    {expense.description}
                                                </TableCell>
                                                <TableCell className="text-gray-500">
                                                    {expense.supplier?.name || '-'}
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-red-600">
                                                    -${formatThousands(expense.amount)}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => handleDelete(expense.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {/* Paginación */}
                                {expenses.length > itemsPerPage && (
                                    <div className="flex items-center justify-between px-2 py-4 border-t">
                                        <p className="text-sm text-gray-500 font-medium">
                                            Mostrando <span className="text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span>-
                                            <span className="text-gray-900">{Math.min(expenses.length, currentPage * itemsPerPage)}</span> de
                                            <span className="text-gray-900"> {expenses.length}</span> gastos
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-9 w-9 rounded-xl border-gray-200"
                                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                disabled={currentPage === 1}
                                            >
                                                <ChevronLeft className="h-4 w-4 text-gray-600" />
                                            </Button>
                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: Math.ceil(expenses.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
                                                    <Button
                                                        key={page}
                                                        variant={currentPage === page ? "default" : "ghost"}
                                                        size="sm"
                                                        className={cn(
                                                            "h-9 w-9 rounded-xl text-xs font-bold",
                                                            currentPage === page ? "bg-gray-900 text-white shadow-md" : "text-gray-600 hover:bg-gray-100"
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
                                                className="h-9 w-9 rounded-xl border-gray-200"
                                                onClick={() => setCurrentPage(p => Math.min(Math.ceil(expenses.length / itemsPerPage), p + 1))}
                                                disabled={currentPage === Math.ceil(expenses.length / itemsPerPage)}
                                            >
                                                <ChevronRight className="h-4 w-4 text-gray-600" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Dialog de Crear Gasto */}
                <Dialog open={showCreate} onOpenChange={setShowCreate}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Registrar Gasto</DialogTitle>
                            <DialogDescription>
                                Registra un gasto operativo del negocio
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Monto *</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                        <Input
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="0"
                                            value={formAmount}
                                            onChange={(e) => setFormAmount(formatThousands(e.target.value))}
                                            className="pl-7"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Fecha *</Label>
                                    <Input
                                        type="date"
                                        value={formDate}
                                        onChange={(e) => setFormDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Categoría *</Label>
                                <Select value={formCategory} onValueChange={(v: string) => setFormCategory(v as ExpenseCategory)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>
                                                {CATEGORY_ICONS[key as ExpenseCategory]} {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Descripción *</Label>
                                <Input
                                    placeholder="Ej: Pago de arriendo mes de febrero"
                                    value={formDescription}
                                    onChange={(e) => setFormDescription(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Proveedor (opcional)</Label>
                                <Select
                                    value={formSupplierId || "NONE"}
                                    onValueChange={(v: string) => setFormSupplierId(v === "NONE" ? "" : v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar proveedor..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="NONE">Sin proveedor</SelectItem>
                                        {suppliers.map((s) => (
                                            <SelectItem key={s.id} value={s.id}>
                                                {s.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowCreate(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleCreate} disabled={submitting}>
                                {submitting ? 'Guardando...' : 'Guardar Gasto'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <ConfirmDialog
                    open={deleteConfirmOpen}
                    onOpenChange={setDeleteConfirmOpen}
                    onConfirm={confirmDelete}
                    title="¿Eliminar este gasto?"
                    description="Esta acción no se puede deshacer. El gasto será removido permanentemente de los registros y del estado de resultados."
                    confirmText="Eliminar Gasto"
                    cancelText="No, mantener"
                    variant="destructive"
                />
            </div>
        </>
    )
}

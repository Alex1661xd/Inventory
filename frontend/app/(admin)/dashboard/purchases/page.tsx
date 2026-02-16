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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label'

export default function PurchasesPage() {
    const [purchases, setPurchases] = useState<Purchase[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [dateRange, setDateRange] = useState({ from: '', to: '' })
    const [paymentModal, setPaymentModal] = useState<{ open: boolean, purchase: Purchase | null }>({
        open: false,
        purchase: null
    })
    const [paymentData, setPaymentData] = useState({ amount: '', notes: '' })
    const [savingPayment, setSavingPayment] = useState(false)

    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const itemsPerPage = 12

    const [debouncedSearch, setDebouncedSearch] = useState('')

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500)
        return () => clearTimeout(timer)
    }, [searchQuery])

    const loadPurchases = async (page = 1) => {
        setLoading(true)
        try {
            const response = await api.purchases.list({
                from: dateRange.from,
                to: dateRange.to,
                search: debouncedSearch,
                page,
                limit: itemsPerPage
            })
            setPurchases(response.data)
            setTotalPages(response.totalPages)
            setCurrentPage(response.page)
        } catch (e: any) {
            toast.error('Error al cargar compras: ' + e.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadPurchases(1)
        setCurrentPage(1)
    }, [dateRange, debouncedSearch])

    useEffect(() => {
        loadPurchases(currentPage)
    }, [currentPage])

    const stats = {
        totalInvestment: purchases.reduce((sum, p) => sum + Number(p.total), 0),
        pendingPayment: purchases.filter(p => !p.isPaid).reduce((sum, p) => sum + Number(p.total), 0),
        count: purchases.length,
        itemsCount: purchases.reduce((sum, p) => sum + (p._count?.items || 0), 0)
    }

    const handleMarkAsPaid = async (e: React.MouseEvent, id: string) => {
        e.preventDefault()
        e.stopPropagation()

        if (!confirm('¿Seguro que deseas marcar esta compra como pagada en su totalidad?')) return

        try {
            await api.purchases.pay(id)
            toast.success('Compra pagada al 100%')
            loadPurchases()
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const openPaymentModal = (e: React.MouseEvent, purchase: Purchase) => {
        e.preventDefault()
        e.stopPropagation()
        const pending = Number(purchase.total) - Number(purchase.amountPaid)
        setPaymentData({ amount: pending.toString(), notes: '' })
        setPaymentModal({ open: true, purchase })
    }

    const handleAddPayment = async () => {
        if (!paymentModal.purchase) return
        const amount = parseFloat(paymentData.amount)
        if (isNaN(amount) || amount <= 0) return toast.error('Ingresa un monto válido')

        setSavingPayment(true)
        try {
            await api.purchases.addPayment(paymentModal.purchase.id, {
                amount,
                notes: paymentData.notes
            })
            toast.success('Abono registrado correctamente')
            setPaymentModal({ open: false, purchase: null })
            loadPurchases()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setSavingPayment(false)
        }
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
                        <div className="text-[10px] font-black opacity-80 uppercase tracking-tighter mb-2">Deuda a Proveedores</div>
                        <div className="text-3xl font-black">
                            ${formatThousands(stats.pendingPayment)}
                        </div>
                        <div className="mt-2 text-[9px] font-medium opacity-60">Compras pendientes de pago</div>
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
                ) : purchases.length === 0 ? (
                    <div className="text-center py-20 bg-white/30 rounded-3xl border-2 border-dashed border-[hsl(var(--border))]">
                        <div className="text-6xl mb-4">📦</div>
                        <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">Sin registros</h3>
                        <p className="text-[hsl(var(--muted))]">No hemos encontrado ninguna compra que coincida.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {purchases.map((purchase: Purchase) => (
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
                                            <div className="space-y-4 mb-6">
                                                <div className="space-y-1">
                                                    <div className="flex items-center text-xs text-[hsl(var(--muted))] font-medium">
                                                        <span className="mr-2">👤</span> {purchase.buyer.name}
                                                    </div>
                                                    <div className="flex items-center text-xs text-[hsl(var(--muted))] font-medium">
                                                        <span className="mr-2">📦</span> {purchase._count?.items} productos
                                                    </div>
                                                </div>

                                                <div className="bg-[hsl(var(--surface-elevated))] p-3 rounded-xl space-y-2 border border-[hsl(var(--border))]">
                                                    <div className="flex justify-between text-[11px] font-bold">
                                                        <span className="text-[hsl(var(--muted))] uppercase tracking-tighter">Inversión Total:</span>
                                                        <div className="text-right">
                                                            <span className="text-[hsl(var(--foreground))]">${formatThousands(Number(purchase.total))}</span>
                                                            {Number(purchase.additionalCosts) > 0 && (
                                                                <div className="text-[8px] text-blue-600 font-black">
                                                                    (INC. FLETE: ${formatThousands(Number(purchase.additionalCosts))})
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between text-[11px] font-bold">
                                                        <span className="text-[hsl(var(--muted))] uppercase tracking-tighter">Pagado:</span>
                                                        <span className="text-emerald-600">${formatThousands(Number(purchase.amountPaid))}</span>
                                                    </div>
                                                    <div className="flex justify-between text-[11px] font-black border-t pt-1 border-dashed border-[hsl(var(--border))]">
                                                        <span className="text-[hsl(var(--muted))] uppercase tracking-tighter">Saldo Pendiente:</span>
                                                        <span className="text-amber-600">${formatThousands(Number(purchase.total) - Number(purchase.amountPaid))}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center justify-between pt-4 border-t border-[hsl(var(--border))] gap-3">
                                                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${purchase.isPaid
                                                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                                    : 'bg-amber-100 text-amber-700 border-amber-200'
                                                    }`}>
                                                    {purchase.isPaid ? 'Totalmente Pagado' : 'Pendiente de Pago'}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {!purchase.isPaid && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8 text-[10px] font-black rounded-full border-amber-200 text-amber-700 hover:bg-amber-50"
                                                                onClick={(e) => openPaymentModal(e, purchase)}
                                                            >
                                                                ABONAR
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                className="h-8 text-[10px] font-black bg-emerald-600 text-white hover:bg-emerald-700 rounded-full shadow-sm"
                                                                onClick={(e) => handleMarkAsPaid(e, purchase.id)}
                                                            >
                                                                LIQUIDAR
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-8">
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    Anterior
                                </Button>
                                <span className="flex items-center px-4 font-bold text-sm">
                                    Página {currentPage} de {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Siguiente
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Payment Modal */}
            <Dialog open={paymentModal.open} onOpenChange={(open) => setPaymentModal(prev => ({ ...prev, open }))}>
                <DialogContent className="sm:max-w-[425px] rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">Registrar Abono</DialogTitle>
                    </DialogHeader>
                    {paymentModal.purchase && (
                        <div className="space-y-6 py-4">
                            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                                <p className="text-xs font-black text-amber-800 uppercase tracking-widest mb-1">Saldo Pendiente</p>
                                <p className="text-3xl font-black text-amber-700">
                                    ${formatThousands(Number(paymentModal.purchase.total) - Number(paymentModal.purchase.amountPaid))}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-black text-[hsl(var(--muted))] uppercase">Monto a Pagar</Label>
                                    <Input
                                        type="number"
                                        className="h-12 text-lg font-bold rounded-xl border-[hsl(var(--border))]"
                                        value={paymentData.amount}
                                        onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-black text-[hsl(var(--muted))] uppercase">Notas / Observaciones</Label>
                                    <Input
                                        className="h-12 rounded-xl border-[hsl(var(--border))]"
                                        placeholder="Ej: Pago en efectivo parte 1..."
                                        value={paymentData.notes}
                                        onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setPaymentModal({ open: false, purchase: null })}
                            className="rounded-xl h-11 font-bold"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleAddPayment}
                            disabled={savingPayment}
                            className="rounded-xl h-11 font-black bg-[hsl(var(--primary))] text-white shadow-lg"
                        >
                            {savingPayment ? 'Registrando...' : 'Confirmar Pago'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

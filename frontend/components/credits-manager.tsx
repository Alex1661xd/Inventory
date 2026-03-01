'use client'

import { useEffect, useMemo, useState } from 'react'
import { api, type CreditPayment, type CreditSale, type CreditSaleStatus } from '@/lib/backend'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatThousands, parseThousands } from '@/lib/utils'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

const STATUS_OPTIONS: Array<{ value: '' | CreditSaleStatus; label: string }> = [
    { value: '', label: 'Todos' },
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'PARTIAL', label: 'Parcial' },
    { value: 'PAID', label: 'Pagado' },
    { value: 'OVERDUE', label: 'Vencido' },
    { value: 'CANCELLED', label: 'Cancelado' },
]

function statusLabel(status: CreditSaleStatus) {
    if (status === 'PENDING') return 'Pendiente'
    if (status === 'PARTIAL') return 'Parcial'
    if (status === 'PAID') return 'Pagado'
    if (status === 'OVERDUE') return 'Vencido'
    return 'Cancelado'
}

function statusClass(status: CreditSaleStatus) {
    if (status === 'PAID') return 'bg-emerald-100 text-emerald-700'
    if (status === 'PARTIAL') return 'bg-blue-100 text-blue-700'
    if (status === 'OVERDUE') return 'bg-red-100 text-red-700'
    if (status === 'CANCELLED') return 'bg-gray-200 text-gray-600'
    return 'bg-amber-100 text-amber-700'
}

function formatMoney(value: number | string) {
    const amount = Number(value || 0)
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
    }).format(amount)
}

export function CreditsManager({ isAdminView = false }: { isAdminView?: boolean }) {
    const [loading, setLoading] = useState(false)
    const [credits, setCredits] = useState<CreditSale[]>([])
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState<'' | CreditSaleStatus>('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [selectedCredit, setSelectedCredit] = useState<CreditSale | null>(null)
    const [detailsOpen, setDetailsOpen] = useState(false)
    const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null)
    const [savingPayment, setSavingPayment] = useState(false)
    const [paymentForm, setPaymentForm] = useState({
        amount: '',
        paymentMethod: 'CASH' as 'CASH' | 'CARD' | 'TRANSFER' | 'OTHER',
        notes: '',
    })

    const totalBalance = useMemo(
        () => credits.reduce((acc, item) => acc + Number(item.balance || 0), 0),
        [credits],
    )

    const loadCredits = async (targetPage = page) => {
        setLoading(true)
        try {
            const res = await api.credits.list({
                page: targetPage,
                limit: 12,
                search: search || undefined,
                status: status || undefined,
            })
            setCredits(res.data || [])
            setPage(res.page || 1)
            setTotalPages(res.totalPages || 1)
        } catch (e: any) {
            toast.error(e.message || 'No se pudo cargar la cartera')
        } finally {
            setLoading(false)
        }
    }

    const loadCreditDetail = async (id: string) => {
        if (loadingDetailId === id) return
        setLoadingDetailId(id)
        setDetailsOpen(true)
        setSelectedCredit(null)
        try {
            const detail = await api.credits.get(id)
            setSelectedCredit(detail)
            setSelectedId(id)
            const suggested = Math.min(Number(detail.installmentAmount || 0), Number(detail.balance || 0))
            setPaymentForm({
                amount: suggested > 0 ? formatThousands(Math.round(suggested)) : '',
                paymentMethod: 'CASH',
                notes: '',
            })
        } catch (e: any) {
            toast.error(e.message || 'No se pudo cargar el credito')
            setDetailsOpen(false)
        } finally {
            setLoadingDetailId(null)
        }
    }

    const submitPayment = async () => {
        if (!selectedId || !selectedCredit) return
        const amount = parseThousands(paymentForm.amount || '')
        if (!Number.isFinite(amount) || amount <= 0) {
            toast.error('Ingresa un monto valido')
            return
        }

        setSavingPayment(true)
        try {
            const updated = await api.credits.addPayment(selectedId, {
                amount,
                paymentMethod: paymentForm.paymentMethod,
                notes: paymentForm.notes.trim() || undefined,
            })
            setSelectedCredit(updated)
            toast.success('Abono registrado')
            await loadCredits(page)
        } catch (e: any) {
            toast.error(e.message || 'No se pudo registrar el abono')
        } finally {
            setSavingPayment(false)
        }
    }

    useEffect(() => {
        loadCredits(1)
        setPage(1)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, status])

    useEffect(() => {
        loadCredits(page)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page])

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-[hsl(var(--foreground))]" style={{ fontFamily: 'var(--font-display)' }}>
                        Modulo Credito
                    </h2>
                    <p className="text-sm text-[hsl(var(--muted))]">
                        Cartera activa y registro de abonos por cliente.
                    </p>
                </div>
                <Button variant="outline" onClick={() => loadCredits(page)} disabled={loading}>
                    {loading ? 'Actualizando...' : 'Refrescar'}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Card className="bg-[hsl(var(--surface-elevated))] border-none shadow-sm overflow-hidden">
                    <div className="p-6 flex flex-col items-center justify-center min-h-[120px]">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted))] opacity-70 mb-2">Creditos en pagina</p>
                        <p className="text-2xl font-black">{credits.length}</p>
                    </div>
                </Card>
                <Card className="bg-[hsl(var(--surface-elevated))] border-none shadow-sm overflow-hidden">
                    <div className="p-6 flex flex-col items-center justify-center min-h-[120px]">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted))] opacity-70 mb-2">Saldo pendiente</p>
                        <p className="text-2xl font-black text-amber-700">{formatMoney(totalBalance)}</p>
                    </div>
                </Card>
                <Card className="bg-[hsl(var(--primary))] text-white border-none shadow-md overflow-hidden">
                    <div className="p-6 flex flex-col items-center justify-center min-h-[120px]">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Vista</p>
                        <p className="text-2xl font-black">{isAdminView ? 'Admin' : 'Vendedor'}</p>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                    placeholder="Buscar cliente, documento o factura..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as '' | CreditSaleStatus)}
                    className="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm"
                >
                    {STATUS_OPTIONS.map((option) => (
                        <option key={option.value || 'all'} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <Button variant="outline" onClick={() => { setSearch(''); setStatus('') }}>
                    Limpiar filtros
                </Button>
            </div>

            <div className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                {credits.map((credit) => (
                    <Card key={credit.id} className="border border-gray-200">
                        <div className="p-4 space-y-3">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className="text-sm text-gray-500">Cliente</p>
                                    <p className="font-semibold">{credit.customer?.name || 'Sin cliente'}</p>
                                    <p className="text-xs text-gray-500">
                                        Factura #{credit.invoice?.invoiceNumber || 'N/A'}
                                    </p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${statusClass(credit.status)}`}>
                                    {statusLabel(credit.status)}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <p className="text-gray-500">Total</p>
                                    <p className="font-semibold">{formatMoney(credit.totalAmount)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Saldo</p>
                                    <p className="font-semibold text-amber-700">{formatMoney(credit.balance)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Abonado</p>
                                    <p className="font-semibold">{formatMoney(credit.paidAmount)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Cuotas</p>
                                    <p className="font-semibold">{credit.installmentsCount}</p>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button size="sm" onClick={() => loadCreditDetail(credit.id)} disabled={loadingDetailId === credit.id}>
                                    {loadingDetailId === credit.id ? 'Cargando...' : 'Ver detalle'}
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
                {!loading && credits.length === 0 && (
                    <Card className="col-span-full border-dashed border-2 border-gray-200">
                        <div className="p-10 text-center text-sm text-gray-500">
                            No hay creditos para los filtros seleccionados.
                        </div>
                    </Card>
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                        Anterior
                    </Button>
                    <span className="text-sm text-gray-600">Pagina {page} de {totalPages}</span>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                        Siguiente
                    </Button>
                </div>
            )}

            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Detalle de credito</DialogTitle>
                        <DialogDescription>Consulta historial y registra abonos.</DialogDescription>
                    </DialogHeader>
                    {!selectedCredit && loadingDetailId && (
                        <div className="py-12 text-center text-sm text-gray-500 font-medium">Cargando detalle del crédito...</div>
                    )}
                            {selectedCredit && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <Card className="bg-slate-50 border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="p-3 flex flex-col items-center justify-center min-h-[80px] text-center">
                                        <p className="text-[10px] font-black uppercase text-[hsl(var(--muted))] opacity-70 mb-1">Cliente</p>
                                        <p className="font-bold text-[hsl(var(--foreground))] line-clamp-1">{selectedCredit.customer?.name}</p>
                                    </div>
                                </Card>
                                <Card className="bg-indigo-50 border border-indigo-200 shadow-sm overflow-hidden">
                                    <div className="p-3 flex flex-col items-center justify-center min-h-[80px] text-center">
                                        <p className="text-[10px] font-black uppercase text-[hsl(var(--muted))] opacity-70 mb-1">Factura</p>
                                        <p className="font-bold text-[hsl(var(--foreground))]">#{selectedCredit.invoice?.invoiceNumber}</p>
                                    </div>
                                </Card>
                                <Card className="bg-amber-50 border border-amber-200 shadow-sm overflow-hidden">
                                    <div className="p-3 flex flex-col items-center justify-center min-h-[80px] text-center">
                                        <p className="text-[10px] font-black uppercase text-[hsl(var(--muted))] opacity-70 mb-1">Saldo</p>
                                        <p className="font-black text-amber-700">{formatMoney(selectedCredit.balance)}</p>
                                    </div>
                                </Card>
                                <Card className="bg-emerald-50 border border-emerald-200 shadow-sm overflow-hidden">
                                    <div className="p-3 flex flex-col items-center justify-center min-h-[80px] text-center">
                                        <p className="text-[10px] font-black uppercase text-[hsl(var(--muted))] opacity-70 mb-1">Valor cuota</p>
                                        <p className="font-black text-[hsl(var(--primary))]">{formatMoney(selectedCredit.installmentAmount)}</p>
                                    </div>
                                </Card>
                            </div>

                            {selectedCredit.status !== 'PAID' && selectedCredit.status !== 'CANCELLED' && (
                                <Card className="border border-gray-200">
                                    <CardHeader className="pb-2"><CardTitle className="text-base">Registrar abono</CardTitle></CardHeader>
                                    <div className="p-6 pt-0 space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                            <div className="space-y-1">
                                                <Label className="text-xs font-black text-[hsl(var(--muted))] uppercase">Monto</Label>
                                                <Input
                                                    type="text"
                                                    inputMode="numeric"
                                                    className="h-10 font-bold"
                                                    value={paymentForm.amount}
                                                    onChange={(e) => setPaymentForm((prev) => ({ ...prev, amount: formatThousands(e.target.value) }))}
                                                    placeholder="Ej: 150.000"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs font-black text-[hsl(var(--muted))] uppercase">Metodo</Label>
                                                <select
                                                    value={paymentForm.paymentMethod}
                                                    onChange={(e) => setPaymentForm((prev) => ({ ...prev, paymentMethod: e.target.value as any }))}
                                                    className="h-10 rounded-md border border-[hsl(var(--border))] bg-white px-3 text-sm w-full font-bold"
                                                >
                                                    <option value="CASH">Efectivo</option>
                                                    <option value="CARD">Tarjeta</option>
                                                    <option value="TRANSFER">Transferencia</option>
                                                    <option value="OTHER">Otro</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1 md:col-span-1">
                                                <Label className="text-xs font-black text-[hsl(var(--muted))] uppercase">Notas</Label>
                                                <Input
                                                    className="h-10"
                                                    value={paymentForm.notes}
                                                    onChange={(e) => setPaymentForm((prev) => ({ ...prev, notes: e.target.value }))}
                                                    placeholder="Opcional"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end pt-2">
                                            <Button onClick={submitPayment} disabled={savingPayment} className="h-10 font-black rounded-xl px-6 bg-[hsl(var(--primary))] text-white shadow-lg">
                                                {savingPayment ? 'Guardando...' : 'Registrar abono'}
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            )}

                            <div>
                                <h4 className="font-semibold mb-2">Ultimos abonos</h4>
                                <div className="space-y-2 max-h-56 overflow-auto pr-1">
                                    {(selectedCredit.payments || []).map((payment: CreditPayment) => (
                                        <div key={payment.id} className="border border-gray-200 rounded-md px-3 py-2 text-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold">{formatMoney(payment.amount)}</span>
                                                <span className="text-xs text-gray-500">{new Date(payment.paidAt).toLocaleString()}</span>
                                            </div>
                                            <div className="text-xs text-gray-600">
                                                {payment.paymentMethod} · {payment.createdBy?.name || 'Usuario'}
                                            </div>
                                            {payment.notes && <div className="text-xs text-gray-500">{payment.notes}</div>}
                                        </div>
                                    ))}
                                    {(selectedCredit.payments || []).length === 0 && (
                                        <div className="text-sm text-gray-500">Sin abonos registrados.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { api, type Purchase } from '@/lib/backend'
import { format } from 'date-fns'
import {
    ArrowLeft,
    Printer,
    Calendar,
    User,
    Truck,
    Package,
    ArrowRight,
    TrendingUp,
    DollarSign
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatThousands } from '@/lib/utils'

export default function PurchaseDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const [purchase, setPurchase] = useState<Purchase | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadPurchase = async () => {
            try {
                const data = await api.purchases.get(id as string)
                if (data) setPurchase(data)
            } catch (error) {
                toast.error('Error al cargar la compra')
            } finally {
                setLoading(false)
            }
        }
        loadPurchase()
    }, [id])

    const handlePrint = () => {
        window.print()
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="w-12 h-12 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin" />
            <p className="text-[hsl(var(--muted))] font-medium">Cargando detalles...</p>
        </div>
    )

    if (!purchase) return (
        <div className="p-8 text-center py-40 bg-white/30 rounded-3xl border-2 border-dashed border-[hsl(var(--border))]">
            <div className="text-6xl mb-4">🚫</div>
            <h3 className="text-xl font-bold">Compra no encontrada</h3>
            <Button onClick={() => router.back()} className="mt-4">Regresar</Button>
        </div>
    )

    return (
        <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-20">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full shadow-sm">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-3xl font-black text-[hsl(var(--foreground))]" style={{ fontFamily: 'var(--font-display)' }}>
                                Compra #{purchase.purchaseNumber}
                            </h2>
                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 border border-emerald-200">
                                {purchase.status}
                            </span>
                        </div>
                        <p className="text-[hsl(var(--muted))] font-medium flex items-center gap-1.5 uppercase text-xs tracking-wider">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(purchase.date), 'dd MMMM, yyyy')}
                        </p>
                    </div>
                </div>
                <Button onClick={handlePrint} variant="outline" className="h-11 rounded-xl font-bold shadow-sm border border-[hsl(var(--border))] uppercase tracking-tighter text-xs">
                    <Printer className="mr-2 h-4 w-4" /> Imprimir / PDF
                </Button>
            </div>

            {/* Info Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-white/50 border-[hsl(var(--border))] shadow-sm rounded-3xl overflow-hidden">
                    <CardHeader className="bg-[hsl(var(--surface-elevated))] border-b border-[hsl(var(--border))] py-4">
                        <CardTitle className="text-xs font-black uppercase text-[hsl(var(--muted))] tracking-widest flex items-center gap-2">
                            <Truck className="h-4 w-4 text-blue-500" /> Al Proveedor
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <p className="text-lg font-black text-[hsl(var(--foreground))] uppercase">{purchase.supplier.name}</p>
                        <p className="text-xs text-[hsl(var(--muted))] font-bold mt-1">RIF/ID: {purchase.supplier.taxId || 'N/A'}</p>
                        <p className="text-xs text-[hsl(var(--muted))] font-medium mt-1">{purchase.supplier.email || 'Sin correo'}</p>
                    </CardContent>
                </Card>

                <Card className="bg-white/50 border-[hsl(var(--border))] shadow-sm rounded-3xl overflow-hidden">
                    <CardHeader className="bg-[hsl(var(--surface-elevated))] border-b border-[hsl(var(--border))] py-4">
                        <CardTitle className="text-xs font-black uppercase text-[hsl(var(--muted))] tracking-widest flex items-center gap-2">
                            <User className="h-4 w-4 text-purple-500" /> Comprado por
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <p className="text-lg font-black text-[hsl(var(--foreground))]">{purchase.buyer.name}</p>
                        <p className="text-xs text-[hsl(var(--muted))] font-medium mt-1 uppercase tracking-widest">Responsable de recepción</p>
                    </CardContent>
                </Card>

                <Card className={`${purchase.isPaid ? 'bg-[hsl(var(--primary))]' : 'bg-amber-600'} text-white border-none shadow-md rounded-3xl overflow-hidden`}>
                    <CardHeader className="bg-white/10 py-4 pb-1">
                        <CardTitle className="text-[10px] font-black uppercase opacity-80 tracking-widest flex justify-between items-center">
                            Estado Financiero
                            <span className="bg-white text-black px-2 py-0.5 rounded-full text-[8px]">
                                {purchase.isPaid ? 'PAGADO' : 'PENDIENTE'}
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 flex flex-col gap-2">
                        <div className="flex justify-between items-end border-b border-white/20 pb-2">
                            <span className="text-[10px] font-black opacity-80 uppercase tracking-widest">Total Factura</span>
                            <div className="text-2xl font-black italic tracking-tighter">
                                ${formatThousands(Number(purchase.total))}
                            </div>
                        </div>
                        <div className="flex justify-between items-end border-b border-white/20 pb-2">
                            <span className="text-[10px] font-black opacity-80 uppercase tracking-widest">Abonado</span>
                            <div className="text-xl font-bold italic tracking-tighter text-emerald-300">
                                ${formatThousands(Number(purchase.amountPaid))}
                            </div>
                        </div>
                        <div className="flex justify-between items-end pt-1">
                            <span className="text-[10px] font-black opacity-80 uppercase tracking-widest">Saldo Restante</span>
                            <div className="text-2xl font-black italic tracking-tighter text-amber-200">
                                ${formatThousands(Number(purchase.total) - Number(purchase.amountPaid))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Items Table */}
            <Card className="shadow-lg border-[hsl(var(--border))] overflow-hidden rounded-3xl mb-8">
                <CardHeader className="bg-[hsl(var(--surface-elevated))] border-b border-[hsl(var(--border))]">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Package className="h-5 w-5 text-emerald-500" />
                        Desglose de Productos recibidos
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-[hsl(var(--background))] border-b border-[hsl(var(--border))]">
                                    <th className="px-6 py-4 text-xs font-black text-[hsl(var(--muted))] uppercase tracking-widest">Producto</th>
                                    <th className="px-6 py-4 text-xs font-black text-[hsl(var(--muted))] uppercase tracking-widest">SKU</th>
                                    <th className="px-6 py-4 text-center text-xs font-black text-[hsl(var(--muted))] uppercase tracking-widest">Cantidad</th>
                                    <th className="px-6 py-4 text-right text-xs font-black text-[hsl(var(--muted))] uppercase tracking-widest">Costo Unit.</th>
                                    <th className="px-6 py-4 text-right text-xs font-black text-[hsl(var(--muted))] uppercase tracking-widest">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[hsl(var(--border))]">
                                {purchase.items.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-[hsl(var(--surface-elevated))] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-[hsl(var(--foreground))] text-base group-hover:text-[hsl(var(--primary))] transition-colors">
                                                {item.product?.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-[10px] font-bold font-mono text-[hsl(var(--muted))] uppercase tracking-wider italic">
                                                {item.product?.sku || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-black text-lg bg-blue-50 text-blue-700 px-3 py-1 rounded-lg border border-blue-100 min-w-10 inline-block text-center">
                                                {item.quantity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium text-[hsl(var(--muted))]">
                                            ${formatThousands(Number(item.costPrice))}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="font-black text-[hsl(var(--foreground))] text-lg">
                                                ${formatThousands(item.quantity * Number(item.costPrice))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
                {/* Tabla Footer para Subtotal y Flete */}
                <div className="bg-[hsl(var(--surface-elevated))] border-t border-[hsl(var(--border))] p-6 flex flex-col items-end gap-2">
                    <div className="flex justify-between w-full max-w-[300px] items-center text-sm font-medium text-[hsl(var(--muted))]">
                        <span className="uppercase tracking-widest text-[10px] font-black">Subtotal (Items):</span>
                        <span className="text-[hsl(var(--foreground))] font-bold">${formatThousands(Number(purchase.subtotal))}</span>
                    </div>
                    {Number(purchase.additionalCosts) > 0 && (
                        <div className="flex justify-between w-full max-w-[300px] items-center text-sm font-medium text-blue-600">
                            <span className="uppercase tracking-widest text-[10px] font-black">Gastos Adicionales / Flete:</span>
                            <span className="font-bold">+ ${formatThousands(Number(purchase.additionalCosts))}</span>
                        </div>
                    )}
                    <div className="flex justify-between w-full max-w-[300px] items-center pt-2 mt-2 border-t border-dashed border-[hsl(var(--border))]">
                        <span className="uppercase tracking-widest text-xs font-black text-[hsl(var(--primary))]">Inversión Final:</span>
                        <span className="text-2xl font-black text-[hsl(var(--foreground))] italic tracking-tighter">
                            ${formatThousands(Number(purchase.total))}
                        </span>
                    </div>
                </div>
            </Card>

            {/* Payment History and Impact Sections */}
            <div className="grid gap-8 lg:grid-cols-2">
                {/* Payment History */}
                <Card className="shadow-lg border-[hsl(var(--border))] overflow-hidden rounded-3xl">
                    <CardHeader className="bg-[hsl(var(--surface-elevated))] border-b border-[hsl(var(--border))]">
                        <CardTitle className="text-lg font-bold flex items-center gap-2 uppercase tracking-tighter">
                            <DollarSign className="h-5 w-5 text-amber-500" />
                            Historial de Pagos / Abonos
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 max-h-[400px] overflow-y-auto">
                        {!purchase.payments || purchase.payments.length === 0 ? (
                            <div className="p-10 text-center space-y-3">
                                <div className="text-4xl">🧾</div>
                                <p className="text-sm font-bold text-[hsl(var(--muted))] italic">No hay pagos registrados aún para esta compra.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="sticky top-0 bg-[hsl(var(--background))] border-b border-[hsl(var(--border))] z-10">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black text-[hsl(var(--muted))] uppercase tracking-widest">Fecha</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-[hsl(var(--muted))] uppercase tracking-widest">Monto</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-[hsl(var(--muted))] uppercase tracking-widest">Observación</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[hsl(var(--border))]">
                                    {purchase.payments.map((payment, idx) => (
                                        <tr key={idx} className="hover:bg-[hsl(var(--surface-elevated))] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="text-xs font-bold text-[hsl(var(--foreground))]">
                                                    {format(new Date(payment.date), 'dd/MM/yyyy HH:mm')}
                                                </div>
                                                <div className="text-[9px] text-[hsl(var(--muted))] uppercase font-medium mt-0.5">
                                                    Reg: {payment.createdBy?.name || 'Sistema'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-black text-emerald-700 text-base">
                                                    ${formatThousands(Number(payment.amount))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-xs text-[hsl(var(--muted))] font-medium line-clamp-2 italic">
                                                    {payment.notes || 'Pago sin notas'}
                                                </p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </CardContent>
                </Card>

                {/* Impacts */}
                <div className="space-y-6">
                    <Card className="bg-emerald-50 border-emerald-100 border-2 rounded-3xl p-6 relative overflow-hidden group">
                        <div className="absolute right-[-20px] top-[-20px] text-emerald-100 h-32 w-32 group-hover:scale-110 transition-transform duration-500">
                            <TrendingUp className="h-full w-full" />
                        </div>
                        <div className="relative">
                            <h4 className="text-emerald-800 font-black uppercase text-xs tracking-widest flex items-center gap-2 mb-3">
                                <span className="p-1.5 bg-emerald-500 text-white rounded-lg"><TrendingUp className="h-4 w-4" /></span>
                                Inventario
                            </h4>
                            <p className="text-emerald-700 text-xs font-medium leading-relaxed">
                                Se ha incrementado el stock y actualizado el <span className="font-bold underline decoration-emerald-300">Precio de Costo</span> de estos productos para cálculos de utilidad.
                            </p>
                        </div>
                    </Card>

                    <Card className="bg-amber-50 border-amber-100 border-2 rounded-3xl p-6 relative overflow-hidden group">
                        <div className="absolute right-[-20px] top-[-20px] text-amber-100 h-32 w-32 group-hover:scale-110 transition-transform duration-500">
                            <DollarSign className="h-full w-full" />
                        </div>
                        <div className="relative">
                            <h4 className="text-amber-800 font-black uppercase text-xs tracking-widest flex items-center gap-2 mb-3">
                                <span className="p-1.5 bg-amber-500 text-white rounded-lg"><ArrowRight className="h-4 w-4" /></span>
                                Finanzas
                            </h4>
                            <p className="text-amber-700 text-xs font-medium leading-relaxed">
                                {purchase.isPaid
                                    ? `Esta compra está totalmente liquidada. Se registraron gastos por $${formatThousands(Number(purchase.total))}.`
                                    : `Compra pendiente de liquidar. Se han abonado $${formatThousands(Number(purchase.amountPaid))} hasta la fecha.`
                                }
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}

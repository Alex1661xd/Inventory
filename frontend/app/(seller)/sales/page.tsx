'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/backend'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Play, Trash2, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function SalesHistoryPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [selectedTab, setSelectedTab] = useState('completed')

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
            loadInvoices() // Reload list
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

    const translatePaymentMethod = (method: string) => {
        const map: Record<string, string> = {
            'CASH': 'Efectivo',
            'CARD': 'Tarjeta',
            'TRANSFER': 'Transferencia',
            'OTHER': 'Otro'
        }
        return map[method] || method
    }

    const calculatePendingTotal = (sale: any) => {
        // Backend structure: sale.items[] -> { quantity, unitPrice }
        if (sale.items) {
            return sale.items.reduce((acc: number, item: any) => acc + (Number(item.unitPrice) * item.quantity), 0)
        }
        return 0
    }

    return (
        <div className="space-y-6 pb-20 md:pb-0">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]" style={{ fontFamily: 'var(--font-display)' }}>
                        Historial de Ventas
                    </h1>
                    <p className="text-[hsl(var(--muted))]">Registro de todas las transacciones realizadas</p>
                </div>
            </div>

            {/* Mobile View: Tabs */}
            <div className="md:hidden">
                <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="completed">Finalizadas ({completedSales.length})</TabsTrigger>
                        <TabsTrigger value="pending">Pendientes ({pendingSales.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="completed" className="mt-4">
                        <CompletedSalesList invoices={completedSales} loading={loading} formatCurrency={formatCurrency} translatePaymentMethod={translatePaymentMethod} />
                    </TabsContent>

                    <TabsContent value="pending" className="mt-4">
                        <PendingSalesList pendingSales={pendingSales} calculatePendingTotal={calculatePendingTotal} formatCurrency={formatCurrency} resumeSale={resumeSale} deletePendingSale={deletePendingSale} />
                    </TabsContent>
                </Tabs>
            </div>

            {/* Desktop View: Two Columns */}
            <div className="hidden md:grid md:grid-cols-2 gap-6 items-start">
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            ✅ Finalizadas
                            <Badge variant="secondary">{completedSales.length}</Badge>
                        </h2>
                    </div>
                    <CompletedSalesList invoices={completedSales} loading={loading} formatCurrency={formatCurrency} translatePaymentMethod={translatePaymentMethod} />
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            ⏸️ Pendientes
                            <Badge variant="destructive">{pendingSales.length}</Badge>
                        </h2>
                    </div>
                    <PendingSalesList pendingSales={pendingSales} calculatePendingTotal={calculatePendingTotal} formatCurrency={formatCurrency} resumeSale={resumeSale} deletePendingSale={deletePendingSale} />
                </div>
            </div>
        </div>
    )
}

function CompletedSalesList({ invoices, loading, formatCurrency, translatePaymentMethod }: any) {
    if (loading) return <Card className="p-10 text-center">Cargando ventas...</Card>
    if (invoices.length === 0) return <Card className="p-10 text-center text-muted-foreground">No hay ventas registradas.</Card>

    return (
        <Card className="overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoices.map((invoice: any) => (
                        <TableRow key={invoice.id}>
                            <TableCell className="text-xs">
                                {format(new Date(invoice.createdAt), "d MMM, HH:mm", { locale: es })}
                            </TableCell>
                            <TableCell>
                                <div className="font-medium truncate max-w-[120px]">
                                    {invoice.customer?.name || 'Cliente Ocasional'}
                                </div>
                            </TableCell>
                            <TableCell className="text-right font-bold">
                                {formatCurrency(invoice.total)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    )
}

function PendingSalesList({ pendingSales, calculatePendingTotal, formatCurrency, resumeSale, deletePendingSale }: any) {
    if (pendingSales.length === 0) return (
        <Card className="p-10 text-center text-muted-foreground bg-gray-50/50 border-dashed border-2">
            No hay ventas pendientes.
        </Card>
    )

    return (
        <div className="space-y-4">
            {pendingSales.map((sale: any) => (
                <Card key={sale.id} className="p-4 bg-amber-50 border-amber-200 hover:border-amber-300 transition-all shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <div className="font-bold text-lg">{sale.customer?.name || 'Venta sin cliente'}</div>
                            <div className="text-xs text-muted-foreground">
                                {format(new Date(sale.createdAt), "d MMM, HH:mm", { locale: es })}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xl font-bold text-primary">
                                {formatCurrency(calculatePendingTotal(sale))}
                            </div>
                            <div className="text-[10px] uppercase font-bold text-muted-foreground">
                                {sale.items?.length || 0} items
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                            size="sm"
                            onClick={() => resumeSale(sale)}
                        >
                            <Play className="h-4 w-4 mr-2" />
                            Reanudar
                        </Button>
                        <Button
                            variant="destructive"
                            size="icon"
                            className="h-9 w-9"
                            onClick={() => {
                                if (confirm('¿Eliminar esta venta pendiente?')) {
                                    deletePendingSale(sale.id)
                                }
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </Card>
            ))}
        </div>
    )
}

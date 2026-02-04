'use client'

import { useState, useEffect } from 'react'
import { api, type CashShift } from '@/lib/backend'
import { toast } from 'sonner'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Wallet, ArrowUpRight, ArrowDownLeft, AlertCircle } from 'lucide-react'
import { formatThousands } from '@/lib/utils'

export default function CashFlowHistoryPage() {
    const [history, setHistory] = useState<CashShift[]>([])
    const [loading, setLoading] = useState(true)

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

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>
                    Historial de Cajas
                </h1>
                <p className="text-gray-500">Supervisa los cierres de caja y arqueos de tus vendedores.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white border-none shadow-lg">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 rounded-xl">
                                <Wallet className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Cajas Cerradas</p>
                                <p className="text-2xl font-bold">{history.filter(s => s.status === 'CLOSED').length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Could add total discrepancies here */}
            </div>

            <Card className="bg-white border-none shadow-xl overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50">
                            <TableHead>Vendedor</TableHead>
                            <TableHead>Apertura / Cierre</TableHead>
                            <TableHead className="text-right">Monto Inicial</TableHead>
                            <TableHead className="text-right">Ventas Efectivo</TableHead>
                            <TableHead className="text-right">Esperado Sistema</TableHead>
                            <TableHead className="text-right">Monto Real</TableHead>
                            <TableHead className="text-right">Diferencia</TableHead>
                            <TableHead>Estado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-10 text-gray-400">Cargando historial...</TableCell>
                            </TableRow>
                        ) : history.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-10 text-gray-400">No hay registros de caja aún.</TableCell>
                            </TableRow>
                        ) : (
                            history.map((shift: any) => {
                                const initial = Number(shift.initialAmount)
                                const final = shift.finalAmount ? Number(shift.finalAmount) : 0
                                const system = shift.systemAmount ? Number(shift.systemAmount) : 0
                                const diff = shift.difference ? Number(shift.difference) : 0
                                // Ventas = Sistema - Inicial - (Ingresos/Egresos directos)
                                // Por simplicidad mostramos lo que el backend calculó

                                return (
                                    <TableRow key={shift.id}>
                                        <TableCell>
                                            <div className="font-medium text-gray-900">{shift.seller?.name || 'Vendedor'}</div>
                                            <div className="text-xs text-gray-500">ID: {shift.id.substring(0, 8)}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {format(new Date(shift.openingTime), 'dd MMM, HH:mm', { locale: es })}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {shift.closingTime ? format(new Date(shift.closingTime), 'dd MMM, HH:mm', { locale: es }) : 'En proceso...'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-medium text-gray-600">
                                            ${formatThousands(initial)}
                                        </TableCell>
                                        <TableCell className="text-right text-gray-900">
                                            {shift.status === 'OPEN' ? '$0' : `$${formatThousands(system - initial)}`}
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-gray-900">
                                            {shift.status === 'OPEN' ? `$${formatThousands(initial)}` : `$${formatThousands(system)}`}
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-blue-700">
                                            {shift.status === 'CLOSED' ? `$${formatThousands(final)}` : '---'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {shift.status === 'CLOSED' && (
                                                <div className={cn(
                                                    "font-bold flex items-center justify-end gap-1",
                                                    diff === 0 ? "text-emerald-600" : diff > 0 ? "text-blue-600" : "text-red-600"
                                                )}>
                                                    {diff > 0 && <ArrowUpRight className="h-4 w-4" />}
                                                    {diff < 0 && <AlertCircle className="h-4 w-4" />}
                                                    ${formatThousands(diff)}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={shift.status === 'OPEN' ? 'default' : 'secondary'} className={shift.status === 'OPEN' ? 'bg-emerald-500' : ''}>
                                                {shift.status === 'OPEN' ? 'Abierta' : 'Cerrada'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ')
}

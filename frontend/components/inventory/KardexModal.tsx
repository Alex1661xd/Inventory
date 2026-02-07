import { useEffect, useState, useMemo } from 'react'
import { api, type StockMovement } from '@/lib/backend'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface KardexModalProps {
    isOpen: boolean
    onClose: () => void
    product: { id: string; name: string } | null
    warehouseId?: string
}

export function KardexModal({ isOpen, onClose, product, warehouseId }: KardexModalProps) {
    const [activeWarehouseId, setActiveWarehouseId] = useState<string | undefined>(warehouseId)
    const [movements, setMovements] = useState<StockMovement[]>([])
    const [loading, setLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 8

    useEffect(() => {
        if (isOpen && product) {
            setCurrentPage(1)
            setActiveWarehouseId(warehouseId)
            loadKardex(warehouseId)
        }
    }, [isOpen, product, warehouseId])

    const loadKardex = async (wid: string | undefined) => {
        if (!product) return
        setLoading(true)
        try {
            const data = await api.inventory.kardex(product.id, wid)
            setMovements(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const toggleView = (global: boolean) => {
        const newWid = global ? undefined : warehouseId
        setActiveWarehouseId(newWid)
        setCurrentPage(1)
        loadKardex(newWid)
    }

    const getTypeLabel = (type: string) => {
        const map: Record<string, { label: string, color: string }> = {
            'SALE': { label: 'Venta', color: 'bg-green-100 text-green-800 border-green-200' },
            'PURCHASE': { label: 'Compra', color: 'bg-blue-100 text-blue-800 border-blue-200' },
            'ADJUSTMENT': { label: 'Ajuste', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
            'TRANSFER_IN': { label: 'Entrada (Traslado)', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
            'TRANSFER_OUT': { label: 'Salida (Traslado)', color: 'bg-orange-100 text-orange-800 border-orange-200' },
            'RETURN': { label: 'Devolución', color: 'bg-purple-100 text-purple-800 border-purple-200' },
            'DAMAGE': { label: 'Daño/Merma', color: 'bg-red-100 text-red-800 border-red-200' },
            'INITIAL': { label: 'Inv. Inicial', color: 'bg-gray-100 text-gray-800 border-gray-200' },
        }
        return map[type] || { label: type, color: 'bg-gray-100 border-gray-200' }
    }

    // Client-side pagination
    const paginatedMovements = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        return movements.slice(startIndex, startIndex + itemsPerPage)
    }, [movements, currentPage])

    const totalPages = Math.ceil(movements.length / itemsPerPage)

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-[95vw] lg:max-w-6xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-white">
                <DialogHeader className="p-6 pb-4 border-b bg-gray-50/50">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                <span className="text-3xl">📊</span> Kardex de Inventario
                            </DialogTitle>
                            <div className="mt-2 flex flex-col gap-1">
                                <DialogDescription className="text-base text-gray-600">
                                    Historial para <span className="font-bold text-gray-900 border-b-2 border-indigo-500">{product?.name}</span>
                                </DialogDescription>
                                <div className="flex items-center gap-2 mt-1">
                                    {activeWarehouseId ? (
                                        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
                                            <span className="text-amber-600 text-lg">📍</span>
                                            <p className="text-xs text-amber-800 leading-tight">
                                                Estas viendo el historial <strong>exclusivo de este almacén</strong>.
                                                Los saldos reflejan solo el stock aquí.
                                            </p>
                                            <Button
                                                variant="link"
                                                size="sm"
                                                className="text-indigo-600 font-bold h-auto p-0 underline ml-2"
                                                onClick={() => toggleView(true)}
                                            >
                                                Ver Global
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg text-indigo-800">
                                            <span className="text-lg">🌍</span>
                                            <p className="text-xs leading-tight">
                                                Estas viendo el <strong>Kardex Global</strong> (Todos los almacenes).
                                                {warehouseId && (
                                                    <Button
                                                        variant="link"
                                                        size="sm"
                                                        className="text-indigo-600 font-bold h-auto p-0 underline ml-2"
                                                        onClick={() => toggleView(false)}
                                                    >
                                                        Volver al Almacén
                                                    </Button>
                                                )}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {loading && (
                            <div className="flex items-center gap-2 text-indigo-600 font-medium animate-pulse shrink-0">
                                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                Cargando...
                            </div>
                        )}
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-auto p-0 min-h-[400px]">
                    <Table>
                        <TableHeader className="bg-gray-100/80 sticky top-0 z-10 backdrop-blur-sm">
                            <TableRow>
                                <TableHead className="w-[180px] font-bold text-gray-700">Fecha / Hora</TableHead>
                                <TableHead className="w-[160px] font-bold text-gray-700">Tipo Movimiento</TableHead>
                                <TableHead className="font-bold text-gray-700">Almacén</TableHead>
                                <TableHead className="text-right font-bold w-[120px] text-gray-700">Cantidad</TableHead>
                                <TableHead className="text-right font-bold w-[120px] text-gray-700">Saldo Final</TableHead>
                                <TableHead className="font-bold text-gray-700">Responsable</TableHead>
                                <TableHead className="font-bold min-w-[250px] text-gray-700">Detalles de Operación</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: itemsPerPage }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><div className="h-4 w-28 bg-gray-100 rounded animate-pulse" /></TableCell>
                                        <TableCell><div className="h-7 w-24 bg-gray-100 rounded-full animate-pulse" /></TableCell>
                                        <TableCell><div className="h-4 w-32 bg-gray-100 rounded animate-pulse" /></TableCell>
                                        <TableCell><div className="h-4 w-16 bg-gray-100 rounded animate-pulse ml-auto" /></TableCell>
                                        <TableCell><div className="h-4 w-16 bg-gray-100 rounded animate-pulse ml-auto" /></TableCell>
                                        <TableCell><div className="h-4 w-24 bg-gray-100 rounded animate-pulse" /></TableCell>
                                        <TableCell><div className="h-4 w-full bg-gray-100 rounded animate-pulse" /></TableCell>
                                    </TableRow>
                                ))
                            ) : paginatedMovements.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
                                            <span className="text-5xl">Empty</span>
                                            <p className="text-lg font-medium">No hay movimientos registrados para este producto.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedMovements.map((mov) => {
                                    const typeInfo = getTypeLabel(mov.type)
                                    const isPositive = mov.quantity > 0

                                    return (
                                        <TableRow key={mov.id} className="hover:bg-blue-50/30 transition-colors border-b">
                                            <TableCell className="text-xs font-medium text-gray-500">
                                                <div className="font-bold text-gray-900 text-sm">
                                                    {format(new Date(mov.createdAt), 'dd MMMM, yyyy', { locale: es })}
                                                </div>
                                                <div className="flex items-center gap-1 mt-1 text-indigo-500">
                                                    <span>🕒</span> {format(new Date(mov.createdAt), 'HH:mm:ss', { locale: es })}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={cn("font-bold whitespace-nowrap px-3 py-1 uppercase text-[10px]", typeInfo.color)}>
                                                    {typeInfo.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm font-semibold text-gray-700">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-400">🏠</span>
                                                    {mov.warehouse.name}
                                                </div>
                                                {mov.type === 'TRANSFER_OUT' && (
                                                    <div className="text-[10px] text-orange-600 font-bold ml-6 uppercase mt-1">Salida de Stock</div>
                                                )}
                                                {mov.type === 'TRANSFER_IN' && (
                                                    <div className="text-[10px] text-indigo-600 font-bold ml-6 uppercase mt-1">Ingreso de Stock</div>
                                                )}
                                            </TableCell>
                                            <TableCell className={cn("text-right font-black tabular-nums text-lg", isPositive ? "text-emerald-600" : "text-rose-600")}>
                                                {isPositive ? '+' : ''}{mov.quantity}
                                            </TableCell>
                                            <TableCell className="text-right font-black tabular-nums text-gray-900 bg-gray-50/30 text-lg">
                                                {mov.balanceAfter}
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                                                        {(mov.user?.name || 'S')[0]}
                                                    </div>
                                                    <span className="font-medium text-gray-700">{mov.user?.name || 'Sistema'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm p-4">
                                                {mov.reference && (
                                                    <div className="font-bold text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded w-fit mb-2 border border-indigo-100 flex items-center gap-1">
                                                        <span>🔖</span> {mov.reference}
                                                    </div>
                                                )}
                                                <div className="text-gray-600 leading-tight italic bg-white p-2 rounded border border-dashed text-xs">
                                                    {mov.notes || 'Sin observaciones adicionales'}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {totalPages > 1 && (
                    <DialogFooter className="p-4 border-t bg-gray-50 flex items-center justify-between sm:justify-between">
                        <div className="text-sm text-gray-500 font-medium">
                            Mostrando <span className="text-gray-900 font-bold">{paginatedMovements.length}</span> de <span className="text-gray-900 font-bold">{movements.length}</span> movimientos total
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="h-9 px-4 font-bold"
                            >
                                ← Anterior
                            </Button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <Button
                                        key={page}
                                        variant={currentPage === page ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setCurrentPage(page)}
                                        className={cn("w-9 h-9 p-0 font-bold", currentPage === page ? "bg-indigo-600" : "")}
                                    >
                                        {page}
                                    </Button>
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="h-9 px-4 font-bold"
                            >
                                Siguiente →
                            </Button>
                        </div>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    )
}

'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { api, type AuditLog } from '@/lib/backend'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
    Shield,
    Filter,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Clock,
    User,
    Calendar,
    Eye,
    X,
} from 'lucide-react'

type FieldMap = Record<string, string>
type JsonObject = Record<string, unknown>

const ACTION_LABELS: Record<string, string> = {
    CREATE: 'Creado',
    UPDATE: 'Actualizado',
    DELETE: 'Eliminado',
    CANCEL: 'Cancelado',
    TRANSFER: 'Transferido',
    LOGIN: 'Inicio de sesion',
    STOCK_UPDATE: 'Ajuste de stock',
    PAYMENT: 'Pago',
    BAN: 'Vetado',
    UNBAN: 'Quitar veto',
}

const ENTITY_LABELS: Record<string, string> = {
    Product: 'Producto',
    Invoice: 'Venta',
    Purchase: 'Compra',
    Warehouse: 'Almacen',
    Inventory: 'Inventario',
    User: 'Usuario',
    Expense: 'Gasto',
    Customer: 'Cliente',
    Supplier: 'Proveedor',
    Category: 'Categoria',
    CashShift: 'Turno de caja',
}

const FIELD_LABELS: FieldMap = {
    name: 'Nombre',
    description: 'Descripcion',
    sku: 'SKU',
    costPrice: 'Costo',
    salePrice: 'Precio venta',
    images: 'Imagenes',
    isPublic: 'Visible en catalogo',
    categoryId: 'Categoria',
    barcode: 'Codigo de barras',
    status: 'Estado',
    amount: 'Monto',
    total: 'Total',
    subtotal: 'Subtotal',
    discount: 'Descuento',
    paymentMethod: 'Metodo de pago',
    address: 'Direccion',
    phone: 'Telefono',
    email: 'Email',
    docNumber: 'Documento',
    role: 'Rol',
    active: 'Activo',
    notes: 'Notas',
    date: 'Fecha',
    supplierId: 'Proveedor',
    customerId: 'Cliente',
    warehouseId: 'Almacen',
    purchaseNumber: 'Numero de compra',
    invoiceNumber: 'Numero de factura',
    buyerId: 'Comprador',
    sellerId: 'Vendedor',
    paymentStatus: 'Estado de pago',
    initialStock: 'Stock inicial',
    initialWarehouseId: 'Bodega inicial',
    isBanned: 'Vetado',
    banReason: 'Motivo veto',
    bannedAt: 'Fecha veto',
}

function getActionLabel(action: string) {
    return ACTION_LABELS[action] || action
}

function getEntityLabel(entity: string) {
    return ENTITY_LABELS[entity] || entity
}

function getActionTone(action: string) {
    if (action === 'DELETE' || action === 'CANCEL') return 'text-red-700 bg-red-50 border-red-200'
    if (action === 'CREATE') return 'text-emerald-700 bg-emerald-50 border-emerald-200'
    if (action === 'UPDATE') return 'text-blue-700 bg-blue-50 border-blue-200'
    if (action === 'BAN') return 'text-amber-700 bg-amber-50 border-amber-200'
    if (action === 'UNBAN') return 'text-lime-700 bg-lime-50 border-lime-200'
    return 'text-slate-700 bg-slate-50 border-slate-200'
}

function formatDateTime(value: string) {
    return new Date(value).toLocaleString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    })
}

function formatRelative(value: string) {
    const diff = Date.now() - new Date(value).getTime()
    const min = Math.floor(diff / 60000)
    if (min < 1) return 'Hace un momento'
    if (min < 60) return `Hace ${min} min`
    const hrs = Math.floor(min / 60)
    if (hrs < 24) return `Hace ${hrs} h`
    const days = Math.floor(hrs / 24)
    return `Hace ${days} d`
}

function normalizeJson(input: unknown): JsonObject {
    if (!input || typeof input !== 'object' || Array.isArray(input)) return {}
    return input as JsonObject
}

function formatValue(key: string, value: unknown) {
    if (value === null || value === undefined || value === '') {
        return <span className="text-slate-400 italic">Vacio</span>
    }

    if (typeof value === 'boolean') {
        return <span className={cn('font-medium', value ? 'text-emerald-700' : 'text-rose-700')}>{value ? 'Si' : 'No'}</span>
    }

    const moneyKeys = ['price', 'total', 'amount', 'subtotal', 'discount', 'cost']
    if (typeof value === 'number' && moneyKeys.some((k) => key.toLowerCase().includes(k))) {
        return (
            <span className="font-mono text-emerald-700">
                {new Intl.NumberFormat('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                    maximumFractionDigits: 0,
                }).format(value)}
            </span>
        )
    }

    if (typeof value === 'object') {
        return (
            <pre className="text-[11px] text-slate-600 whitespace-pre-wrap break-all">
                {JSON.stringify(value, null, 2)}
            </pre>
        )
    }

    return <span className="text-slate-800">{String(value)}</span>
}

function getDiffRows(log: AuditLog) {
    const oldData = normalizeJson(log.oldValue)
    const newData = normalizeJson(log.newValue)
    const keys = Array.from(new Set([...Object.keys(oldData), ...Object.keys(newData)]))
        .filter((k) => !['id', 'tenantId', 'createdAt', 'updatedAt'].includes(k))

    return keys.map((key) => {
        const oldVal = oldData[key]
        const newVal = newData[key]
        const changed = JSON.stringify(oldVal) !== JSON.stringify(newVal)
        return { key, oldVal, newVal, changed }
    })
}

export default function AuditPage() {
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [loading, setLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const [filterEntity, setFilterEntity] = useState('')
    const [filterAction, setFilterAction] = useState('')
    const [filterFrom, setFilterFrom] = useState('')
    const [filterTo, setFilterTo] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
    const limit = 20

    const hasActiveFilters = !!(filterEntity || filterAction || filterFrom || filterTo)

    const loadLogs = useCallback(async () => {
        setLoading(true)
        try {
            const result = await api.audit.list({
                page: currentPage,
                limit,
                entity: filterEntity || undefined,
                action: filterAction || undefined,
                from: filterFrom || undefined,
                to: filterTo || undefined,
            })
            const rows = Array.isArray(result) ? result : result?.data || []
            setLogs(rows)
            setTotalItems(Array.isArray(result) ? result.length : result.total || 0)
            setTotalPages(Array.isArray(result) ? 1 : result.totalPages || 1)
        } catch (e: any) {
            toast.error(e?.message || 'No se pudo cargar auditoria')
        } finally {
            setLoading(false)
        }
    }, [currentPage, filterEntity, filterAction, filterFrom, filterTo])

    useEffect(() => {
        loadLogs()
    }, [loadLogs])

    useEffect(() => {
        setCurrentPage(1)
    }, [filterEntity, filterAction, filterFrom, filterTo])

    const clearFilters = () => {
        setFilterEntity('')
        setFilterAction('')
        setFilterFrom('')
        setFilterTo('')
    }

    const currentRows = useMemo(() => logs.length, [logs])

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                        <Shield className="h-7 w-7 text-slate-700" />
                        Auditoria
                    </h2>
                    <p className="text-sm text-slate-600">Revision de eventos del sistema por accion, fecha y entidad.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowFilters((v) => !v)} className="h-10">
                        <Filter className="h-4 w-4 mr-2" />
                        Filtros
                    </Button>
                    <Button variant="outline" onClick={loadLogs} disabled={loading} className="h-10">
                        <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
                        Refrescar
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Total registros</p>
                        <p className="text-2xl font-semibold text-slate-900 mt-1">{totalItems.toLocaleString()}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Pagina</p>
                        <p className="text-2xl font-semibold text-slate-900 mt-1">
                            {currentPage}
                            <span className="text-base text-slate-500"> / {totalPages}</span>
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Resultados visibles</p>
                        <p className="text-2xl font-semibold text-slate-900 mt-1">{currentRows}</p>
                    </CardContent>
                </Card>
            </div>

            {showFilters && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Filtros</CardTitle>
                        <CardDescription>Acota por entidad, accion y rango de fecha.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div className="space-y-1.5">
                                <Label>Entidad</Label>
                                <select
                                    value={filterEntity}
                                    onChange={(e) => setFilterEntity(e.target.value)}
                                    className="w-full h-10 rounded-md border border-slate-200 px-3 text-sm bg-white"
                                >
                                    <option value="">Todas</option>
                                    {Object.keys(ENTITY_LABELS).map((key) => (
                                        <option key={key} value={key}>{ENTITY_LABELS[key]}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Accion</Label>
                                <select
                                    value={filterAction}
                                    onChange={(e) => setFilterAction(e.target.value)}
                                    className="w-full h-10 rounded-md border border-slate-200 px-3 text-sm bg-white"
                                >
                                    <option value="">Todas</option>
                                    {Object.keys(ACTION_LABELS).map((key) => (
                                        <option key={key} value={key}>{ACTION_LABELS[key]}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="inline-flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5" />
                                    Desde
                                </Label>
                                <Input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="inline-flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5" />
                                    Hasta
                                </Label>
                                <Input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} />
                            </div>
                        </div>
                        {hasActiveFilters && (
                            <div className="flex justify-end">
                                <Button variant="ghost" onClick={clearFilters}>
                                    <X className="h-4 w-4 mr-1.5" />
                                    Limpiar
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Eventos</CardTitle>
                    <CardDescription>Lista cronologica de actividad registrada.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {loading && (
                        <div className="text-sm text-slate-500 py-8 text-center">Cargando registros...</div>
                    )}
                    {!loading && logs.length === 0 && (
                        <div className="text-sm text-slate-500 py-8 text-center">No hay eventos para los filtros seleccionados.</div>
                    )}
                    {!loading && logs.map((log) => (
                        <div
                            key={log.id}
                            className="border border-slate-200 rounded-lg p-3 hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                                <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full border', getActionTone(log.action))}>
                                            {getActionLabel(log.action)}
                                        </span>
                                        <span className="text-xs text-slate-600 px-2.5 py-1 rounded-full border border-slate-200 bg-white">
                                            {getEntityLabel(log.entity)}
                                        </span>
                                        {log.entityId && (
                                            <span className="text-xs font-mono text-slate-500">ID: {log.entityId}</span>
                                        )}
                                    </div>
                                    <div className="text-sm text-slate-700 inline-flex items-center gap-1.5">
                                        <User className="h-3.5 w-3.5 text-slate-500" />
                                        <span className="font-medium">{log.userName || 'Sistema'}</span>
                                        <span className="text-slate-400">({log.userRole || 'SERVICE'})</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 md:gap-3">
                                    <div className="text-right">
                                        <div className="text-xs text-slate-500 inline-flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5" />
                                            {formatRelative(log.createdAt)}
                                        </div>
                                        <div className="text-xs text-slate-400">{formatDateTime(log.createdAt)}</div>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={() => setSelectedLog(log)}>
                                        <Eye className="h-4 w-4 mr-1.5" />
                                        Ver
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1 || loading}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1.5" />
                        Anterior
                    </Button>
                    <span className="text-sm text-slate-600">
                        Pagina {currentPage} de {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages || loading}
                    >
                        Siguiente
                        <ChevronRight className="h-4 w-4 ml-1.5" />
                    </Button>
                </div>
            )}

            <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
                <DialogContent className="max-w-4xl max-h-[88vh] overflow-y-auto">
                    {selectedLog && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-xl">
                                    {getActionLabel(selectedLog.action)} - {getEntityLabel(selectedLog.entity)}
                                </DialogTitle>
                            </DialogHeader>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <Card>
                                    <CardContent className="p-3">
                                        <p className="text-xs text-slate-500">Usuario</p>
                                        <p className="font-medium text-slate-900">{selectedLog.userName || 'Sistema'}</p>
                                        <p className="text-xs text-slate-500 mt-1">{selectedLog.userRole || 'SERVICE'}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-3">
                                        <p className="text-xs text-slate-500">Entidad</p>
                                        <p className="font-medium text-slate-900">{getEntityLabel(selectedLog.entity)}</p>
                                        <p className="text-xs text-slate-500 mt-1">{selectedLog.entityId || 'Sin ID'}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-3">
                                        <p className="text-xs text-slate-500">Fecha</p>
                                        <p className="font-medium text-slate-900">{formatDateTime(selectedLog.createdAt)}</p>
                                        <p className="text-xs text-slate-500 mt-1">{formatRelative(selectedLog.createdAt)}</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">Cambios</CardTitle>
                                    <CardDescription>Comparacion entre estado anterior y nuevo.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-auto border border-slate-200 rounded-md">
                                        <table className="w-full text-sm">
                                            <thead className="bg-slate-50 border-b border-slate-200">
                                                <tr>
                                                    <th className="text-left px-3 py-2 font-semibold text-slate-600">Campo</th>
                                                    <th className="text-left px-3 py-2 font-semibold text-slate-600">Antes</th>
                                                    <th className="text-left px-3 py-2 font-semibold text-slate-600">Despues</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {getDiffRows(selectedLog).length === 0 && (
                                                    <tr>
                                                        <td colSpan={3} className="px-3 py-6 text-center text-slate-500">
                                                            No hay cambios detallados para mostrar.
                                                        </td>
                                                    </tr>
                                                )}
                                                {getDiffRows(selectedLog).map((row) => (
                                                    <tr key={row.key} className={row.changed ? 'bg-amber-50/50' : ''}>
                                                        <td className="px-3 py-2 text-slate-700 font-medium">
                                                            {FIELD_LABELS[row.key] || row.key}
                                                        </td>
                                                        <td className="px-3 py-2">{formatValue(row.key, row.oldVal)}</td>
                                                        <td className="px-3 py-2">{formatValue(row.key, row.newVal)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>

                            {(selectedLog.oldValue || selectedLog.newValue || selectedLog.metadata) && (
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base">Vista tecnica</CardTitle>
                                        <CardDescription>Datos crudos para revision detallada.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {selectedLog.oldValue && (
                                            <div>
                                                <p className="text-xs font-medium text-slate-500 mb-1">OLD_VALUE</p>
                                                <pre className="bg-slate-50 border border-slate-200 rounded-md p-3 text-[11px] overflow-auto max-h-44">
                                                    {JSON.stringify(selectedLog.oldValue, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                        {selectedLog.newValue && (
                                            <div>
                                                <p className="text-xs font-medium text-slate-500 mb-1">NEW_VALUE</p>
                                                <pre className="bg-slate-50 border border-slate-200 rounded-md p-3 text-[11px] overflow-auto max-h-44">
                                                    {JSON.stringify(selectedLog.newValue, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                        {selectedLog.metadata && (
                                            <div>
                                                <p className="text-xs font-medium text-slate-500 mb-1">METADATA</p>
                                                <pre className="bg-slate-50 border border-slate-200 rounded-md p-3 text-[11px] overflow-auto max-h-44">
                                                    {JSON.stringify(selectedLog.metadata, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

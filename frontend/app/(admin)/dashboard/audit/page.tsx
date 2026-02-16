'use client'

import { useState, useEffect, useCallback } from 'react'
import { api, AuditLog, PaginatedResponse } from '@/lib/backend'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
    Shield,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    Clock,
    User,
    Package,
    FileText,
    Eye,
    EyeOff,
    Calendar,
    Activity,
    AlertTriangle,
    X
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

// Action labels & colors - Quiet Luxury Palette
const ACTION_CONFIG: Record<string, { label: string; color: string; icon: string; bgClass: string; dotColor: string }> = {
    CREATE: { label: 'Creación', color: 'text-[hsl(var(--success))]', icon: '✨', bgClass: 'bg-[hsl(var(--success)/0.05)] border-[hsl(var(--success)/0.2)]', dotColor: 'bg-[hsl(var(--success))]' },
    UPDATE: { label: 'Actualización', color: 'text-[hsl(var(--primary))]', icon: '✏️', bgClass: 'bg-[hsl(var(--primary)/0.05)] border-[hsl(var(--primary)/0.2)]', dotColor: 'bg-[hsl(var(--primary))]' },
    DELETE: { label: 'Eliminación', color: 'text-[hsl(var(--error))]', icon: '🗑️', bgClass: 'bg-[hsl(var(--error)/0.05)] border-[hsl(var(--error)/0.2)]', dotColor: 'bg-[hsl(var(--error))]' },
    CANCEL: { label: 'Cancelación', color: 'text-[hsl(var(--warning))]', icon: '❌', bgClass: 'bg-[hsl(var(--warning)/0.05)] border-[hsl(var(--warning)/0.2)]', dotColor: 'bg-[hsl(var(--warning))]' },
    TRANSFER: { label: 'Transferencia', color: 'text-[hsl(var(--accent))]', icon: '🔄', bgClass: 'bg-[hsl(var(--accent)/0.05)] border-[hsl(var(--accent)/0.2)]', dotColor: 'bg-[hsl(var(--accent))]' },
    LOGIN: { label: 'Inicio de sesión', color: 'text-[hsl(var(--info))]', icon: '🔑', bgClass: 'bg-[hsl(var(--info)/0.05)] border-[hsl(var(--info)/0.2)]', dotColor: 'bg-[hsl(var(--info))]' },
    STOCK_UPDATE: { label: 'Ajuste de stock', color: 'text-[hsl(var(--primary-light))]', icon: '📦', bgClass: 'bg-[hsl(var(--primary-light)/0.05)] border-[hsl(var(--primary-light)/0.2)]', dotColor: 'bg-[hsl(var(--primary-light))]' },
    PAYMENT: { label: 'Pago', color: 'text-[hsl(var(--accent))]', icon: '💳', bgClass: 'bg-[hsl(var(--accent)/0.05)] border-[hsl(var(--accent)/0.2)]', dotColor: 'bg-[hsl(var(--accent))]' },
}

const ENTITY_CONFIG: Record<string, { label: string; icon: string }> = {
    Product: { label: 'Producto', icon: '📦' },
    Invoice: { label: 'Venta', icon: '🧾' },
    Purchase: { label: 'Compra', icon: '🛒' },
    Warehouse: { label: 'Almacén', icon: '🏢' },
    Inventory: { label: 'Inventario', icon: '📋' },
    User: { label: 'Usuario', icon: '👤' },
    Expense: { label: 'Gasto', icon: '💰' },
    Customer: { label: 'Cliente', icon: '👥' },
    Supplier: { label: 'Proveedor', icon: '🏭' },
    Category: { label: 'Categoría', icon: '📁' },
    CashShift: { label: 'Turno de Caja', icon: '💵' },
}

const FIELD_LABELS: Record<string, string> = {
    name: 'Nombre',
    description: 'Descripción',
    sku: 'SKU / Referencia',
    costPrice: 'Precio Costo',
    salePrice: 'Precio Venta',
    images: 'Imágenes',
    isPublic: 'Visible en Catálogo',
    categoryId: 'Categoría',
    barcode: 'Código de Barras',
    status: 'Estado',
    amount: 'Monto',
    total: 'Total',
    subtotal: 'Subtotal',
    discount: 'Descuento',
    paymentMethod: 'Método de Pago',
    address: 'Dirección',
    phone: 'Teléfono',
    email: 'Email',
    docNumber: 'Documento',
    businessName: 'Nombre del Negocio',
    userName: 'Nombre de Usuario',
    role: 'Rol',
    active: 'Activo',
    notes: 'Notas',
    date: 'Fecha',
    supplierId: 'Proveedor',
    customerId: 'Cliente',
    warehouseId: 'Bodega',
    purchaseNumber: 'N° de Compra',
    invoiceNumber: 'N° de Factura',
    items: 'Cantidad de Ítems',
    buyerId: 'Comprador',
    sellerId: 'Vendedor',
    paymentStatus: 'Estado de Pago',
    initialStock: 'Stock Inicial',
    initialWarehouseId: 'Bodega Inicial',
}

function formatDetailValue(key: string, value: any) {
    if (value === null || value === undefined) return <span className="text-gray-400 italic">Vacio</span>
    if (typeof value === 'boolean') return value ? <span className="text-emerald-600 font-bold">Sí</span> : <span className="text-rose-600 font-bold">No</span>

    const lowerKey = key.toLowerCase()
    if (lowerKey.includes('price') || lowerKey.includes('total') || lowerKey === 'amount' || lowerKey === 'subtotal' || lowerKey === 'discount') {
        return <span className="font-mono text-emerald-700 font-bold">
            {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)}
        </span>
    }

    if (key === 'images' && Array.isArray(value)) {
        return <span className="text-blue-600 font-medium underline cursor-pointer">{value.length} imagen(es)</span>
    }

    if (typeof value === 'object') return <pre className="text-[10px] opacity-70">{JSON.stringify(value, null, 2)}</pre>

    return <span className="text-gray-800 font-medium">{String(value)}</span>
}

function getActionConfig(action: string) {
    return ACTION_CONFIG[action] || { label: action, color: 'text-[hsl(var(--muted))]', icon: '📝', bgClass: 'bg-[hsl(var(--muted-light)/0.3)] border-[hsl(var(--border))]', dotColor: 'bg-[hsl(var(--muted))]' }
}

function getEntityConfig(entity: string) {
    return ENTITY_CONFIG[entity] || { label: entity, icon: '📄' }
}

function formatDate(dateStr: string) {
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'Hace un momento'
    if (minutes < 60) return `Hace ${minutes} min`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `Hace ${hours}h`
    const days = Math.floor(hours / 24)
    if (days < 7) return `Hace ${days}d`
    return formatDate(dateStr)
}

export default function AuditPage() {
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [loading, setLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const limit = 20

    // Filters
    const [filterEntity, setFilterEntity] = useState('')
    const [filterAction, setFilterAction] = useState('')
    const [filterFrom, setFilterFrom] = useState('')
    const [filterTo, setFilterTo] = useState('')
    const [showFilters, setShowFilters] = useState(false)

    // Detail modal
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)

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
            const logsData = Array.isArray(result) ? result : (result?.data || [])
            setLogs(logsData)
            setTotalPages(Array.isArray(result) ? 1 : (result.totalPages || 1))
            setTotalItems(Array.isArray(result) ? result.length : (result.total || 0))
        } catch (e: any) {
            toast.error(e.message || 'Error cargando logs de auditoría')
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
        setCurrentPage(1)
    }

    const hasActiveFilters = filterEntity || filterAction || filterFrom || filterTo

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-4xl font-bold text-[hsl(var(--foreground))] flex items-center gap-3 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                        <Shield className="w-9 h-9 text-[hsl(var(--primary))]" />
                        Auditoría
                    </h2>
                    <p className="text-[hsl(var(--muted))] text-lg mt-1 font-medium italic opacity-80">
                        Registro maestro de actividad y seguridad.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn("group h-11 border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]", showFilters && "bg-[hsl(var(--primary)/0.05)] border-[hsl(var(--primary))]")}
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        Filtros
                        {hasActiveFilters && (
                            <span className="ml-2 w-2 h-2 rounded-full bg-[hsl(var(--primary))] animate-pulse" />
                        )}
                    </Button>
                    <Button variant="outline" onClick={loadLogs} disabled={loading} className="group h-11 border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]">
                        <RefreshCw className={cn("w-4 h-4 mr-2 text-[hsl(var(--muted))] transition-transform duration-700", loading && "animate-spin text-[hsl(var(--primary))]")} />
                        {loading ? 'Cargando...' : 'Refrescar'}
                    </Button>
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <Card className="border-[hsl(var(--border))] glass-effect animate-fade-in shadow-lg overflow-hidden">
                    <div className="h-1 bg-[hsl(var(--primary)/0.3)] w-full" />
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-600 flex items-center gap-1.5">
                                    <Package className="w-3.5 h-3.5" />
                                    Entidad
                                </Label>
                                <select
                                    value={filterEntity}
                                    onChange={(e) => setFilterEntity(e.target.value)}
                                    className="w-full h-11 px-3 rounded-lg border-2 border-[hsl(var(--muted-light))] bg-white/80 text-sm focus:ring-0 focus:border-[hsl(var(--primary))] outline-none transition-all duration-300 font-medium"
                                >
                                    <option value="">Todas</option>
                                    {Object.entries(ENTITY_CONFIG).map(([key, cfg]) => (
                                        <option key={key} value={key}>{cfg.icon} {cfg.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-600 flex items-center gap-1.5">
                                    <Activity className="w-3.5 h-3.5" />
                                    Acción
                                </Label>
                                <select
                                    value={filterAction}
                                    onChange={(e) => setFilterAction(e.target.value)}
                                    className="w-full h-11 px-3 rounded-lg border-2 border-[hsl(var(--muted-light))] bg-white/80 text-sm focus:ring-0 focus:border-[hsl(var(--primary))] outline-none transition-all duration-300 font-medium"
                                >
                                    <option value="">Todas</option>
                                    {Object.entries(ACTION_CONFIG).map(([key, cfg]) => (
                                        <option key={key} value={key}>{cfg.icon} {cfg.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-600 flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" />
                                    Desde
                                </Label>
                                <Input
                                    type="date"
                                    value={filterFrom}
                                    onChange={(e) => setFilterFrom(e.target.value)}
                                    className="h-11 border-2 border-[hsl(var(--muted-light))] bg-white/80 focus:border-[hsl(var(--primary))] transition-all duration-300"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-600 flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" />
                                    Hasta
                                </Label>
                                <Input
                                    type="date"
                                    value={filterTo}
                                    onChange={(e) => setFilterTo(e.target.value)}
                                    className="h-11 border-2 border-[hsl(var(--muted-light))] bg-white/80 focus:border-[hsl(var(--primary))] transition-all duration-300"
                                />
                            </div>
                        </div>
                        {hasActiveFilters && (
                            <div className="mt-4 flex justify-end">
                                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.05)] font-semibold">
                                    <X className="w-4 h-4 mr-1 ml-[-2px]" />
                                    Limpiar filtros
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <Card className="bg-white border-[hsl(var(--border))] shadow-sm overflow-hidden group hover:border-[hsl(var(--primary))] transition-all duration-500">
                    <div className="h-full w-1 bg-[hsl(var(--primary))] absolute left-0 top-0" />
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-widest text-[hsl(var(--muted))] font-bold">Total Entradas</p>
                                <p className="text-3xl font-bold mt-2 text-[hsl(var(--foreground))]" style={{ fontFamily: 'var(--font-display)' }}>{totalItems.toLocaleString()}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-[hsl(var(--primary)/0.05)] group-hover:bg-[hsl(var(--primary))] transition-colors duration-500">
                                <FileText className="w-6 h-6 text-[hsl(var(--primary))] group-hover:text-white transition-colors duration-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-[hsl(var(--border))] shadow-sm overflow-hidden group hover:border-[hsl(var(--accent))] transition-all duration-500">
                    <div className="h-full w-1 bg-[hsl(var(--accent))] absolute left-0 top-0" />
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-widest text-[hsl(var(--muted))] font-bold">Página Actual</p>
                                <p className="text-3xl font-bold mt-2 text-[hsl(var(--foreground))]" style={{ fontFamily: 'var(--font-display)' }}>
                                    {currentPage} <span className="text-sm font-medium text-[hsl(var(--muted))] tracking-normal">/ {totalPages}</span>
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-[hsl(var(--accent)/0.05)] group-hover:bg-[hsl(var(--accent))] transition-colors duration-500">
                                <Activity className="w-6 h-6 text-[hsl(var(--accent))] group-hover:text-white transition-colors duration-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-[hsl(var(--border))] shadow-sm overflow-hidden group hover:border-[hsl(var(--secondary-dark))] transition-all duration-500">
                    <div className="h-full w-1 bg-[hsl(var(--secondary-dark))] absolute left-0 top-0" />
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-widest text-[hsl(var(--muted))] font-bold">Segmento</p>
                                <p className="text-3xl font-bold mt-2 text-[hsl(var(--foreground))]" style={{ fontFamily: 'var(--font-display)' }}>{logs.length}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-[hsl(var(--secondary-dark)/0.05)] group-hover:bg-[hsl(var(--secondary-dark))] transition-colors duration-500">
                                <Eye className="w-6 h-6 text-[hsl(var(--secondary-dark))] group-hover:text-white transition-colors duration-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Audit Log Timeline */}
            <Card className="shadow-2xl border-0 overflow-hidden bg-white/70 backdrop-blur-md rounded-3xl">
                <CardHeader className="bg-white/40 border-b border-[hsl(var(--border))] py-8 px-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-3 text-2xl font-bold text-[hsl(var(--foreground))]" style={{ fontFamily: 'var(--font-display)' }}>
                                <Clock className="w-6 h-6 text-[hsl(var(--primary))]" />
                                Bitácora de Operaciones
                            </CardTitle>
                            <CardDescription className="text-base text-[hsl(var(--muted))] mt-1 font-medium">
                                {totalItems} {totalItems === 1 ? 'evento documentado' : 'eventos documentados'} en el sistema.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading && logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-[hsl(var(--muted))]">
                            <RefreshCw className="w-10 h-10 animate-spin mb-6 text-[hsl(var(--primary)/0.4)]" />
                            <p className="font-bold tracking-widest text-xs uppercase opacity-60">Sincronizando información...</p>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-[hsl(var(--muted))]">
                            <Shield className="w-16 h-16 mb-6 opacity-20 text-[hsl(var(--primary))]" />
                            <p className="font-bold tracking-widest text-sm uppercase opacity-70">Sin registros encontrados</p>
                            <p className="text-sm mt-3 font-medium">Ajusta los parámetros de búsqueda.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[hsl(var(--border)/0.5)]">
                            {logs.map((log, idx) => {
                                const actionCfg = getActionConfig(log.action)
                                const entityCfg = getEntityConfig(log.entity)
                                const isFocused = selectedLog?.id === log.id

                                return (
                                    <div
                                        key={log.id}
                                        className={cn(
                                            "group relative px-8 py-6 transition-all duration-500 cursor-pointer overflow-hidden",
                                            isFocused ? "bg-[hsl(var(--primary)/0.03)]" : "hover:bg-[hsl(var(--surface-elevated))]"
                                        )}
                                        onClick={() => setSelectedLog(log)}
                                    >
                                        <div className="flex items-start gap-6 relative z-10">
                                            {/* Timeline indicator refined */}
                                            <div className="flex flex-col items-center mt-1">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center text-xl border-2 shadow-sm transition-all duration-500",
                                                    actionCfg.bgClass,
                                                    "group-hover:scale-110 group-hover:-rotate-3 group-hover:shadow-lg group-hover:bg-white"
                                                )}>
                                                    {actionCfg.icon}
                                                </div>
                                                {idx < logs.length - 1 && (
                                                    <div className="w-[2px] h-10 bg-[hsl(var(--border))] mt-3 group-hover:bg-[hsl(var(--primary)/0.2)] transition-colors duration-500" />
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <span className={cn("text-sm font-black uppercase tracking-widest", actionCfg.color)}>
                                                        {actionCfg.label}
                                                    </span>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--border))] opacity-50" />
                                                    <span className="text-sm font-semibold text-[hsl(var(--foreground))] flex items-center gap-2 px-2.5 py-1 rounded-full bg-[hsl(var(--surface-elevated))] border border-[hsl(var(--border))]">
                                                        {entityCfg.icon} {entityCfg.label}
                                                    </span>
                                                    {log.entityId && (
                                                        <span className="text-[10px] font-bold text-[hsl(var(--muted))] font-mono border border-[hsl(var(--border))] px-2 py-0.5 rounded-md hidden sm:inline-block shadow-sm">
                                                            ID: {log.entityId.slice(0, 8)}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-5 mt-3 text-sm text-[hsl(var(--muted))]">
                                                    {log.userName && (
                                                        <span className="flex items-center gap-2 font-medium text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)] px-3 py-1 rounded-lg">
                                                            <User className="w-3.5 h-3.5" />
                                                            {log.userName}
                                                        </span>
                                                    )}
                                                    {log.userRole && (
                                                        <span className={cn(
                                                            "text-[10px] px-2.5 py-1 rounded-full font-black tracking-widest uppercase border shadow-sm",
                                                            log.userRole === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                                log.userRole === 'SUPER_ADMIN' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                                    'bg-blue-50 text-blue-700 border-blue-200'
                                                        )}>
                                                            {log.userRole}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-2 font-semibold text-[hsl(var(--muted))]">
                                                        <Clock className="w-3.5 h-3.5 opacity-60" />
                                                        {timeAgo(log.createdAt)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Quick peek indicator */}
                                            <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center translate-x-4 group-hover:translate-x-0">
                                                <div className="w-10 h-10 rounded-full bg-[hsl(var(--primary))] text-white flex items-center justify-center shadow-lg">
                                                    <Eye className="w-5 h-5" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                        Página {currentPage} de {totalPages} ({totalItems} registros totales)
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1 || loading}
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Anterior
                        </Button>
                        <div className="flex items-center gap-1">
                            {(() => {
                                const pages: number[] = []
                                const maxVisible = 5
                                let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
                                let end = Math.min(totalPages, start + maxVisible - 1)
                                if (end - start + 1 < maxVisible) {
                                    start = Math.max(1, end - maxVisible + 1)
                                }
                                for (let i = start; i <= end; i++) pages.push(i)
                                return pages.map(p => (
                                    <Button
                                        key={p}
                                        variant={currentPage === p ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setCurrentPage(p)}
                                        className={cn(
                                            "w-10 h-10 p-0 rounded-xl transition-all duration-300 font-bold",
                                            currentPage === p ? "bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-dark))] shadow-lg shadow-[hsl(var(--primary)/0.2)]" : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
                                        )}
                                        disabled={loading}
                                    >
                                        {p}
                                    </Button>
                                ))
                            })()}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages || loading}
                        >
                            Siguiente
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    {selectedLog && (() => {
                        const actionCfg = getActionConfig(selectedLog.action)
                        const entityCfg = getEntityConfig(selectedLog.entity)
                        return (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-4 text-2xl font-bold text-[hsl(var(--foreground))]" style={{ fontFamily: 'var(--font-display)' }}>
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border-2 shadow-inner bg-white shrink-0",
                                            actionCfg.bgClass
                                        )}>
                                            {actionCfg.icon}
                                        </div>
                                        <div className="flex flex-col">
                                            <span>{actionCfg.label}</span>
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--muted))] mt-[-2px]">{entityCfg.label}</span>
                                        </div>
                                    </DialogTitle>
                                </DialogHeader>

                                <div className="space-y-5 mt-2">
                                    <div className="grid grid-cols-2 gap-6 bg-[hsl(var(--surface-elevated))] p-6 rounded-2xl border border-[hsl(var(--border))]">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] text-[hsl(var(--muted))] uppercase tracking-widest font-black">Acción Específica</Label>
                                            <p className={cn("text-base font-bold", actionCfg.color)}>{actionCfg.label} <span className="text-xs opacity-60 font-mono">({selectedLog.action})</span></p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] text-[hsl(var(--muted))] uppercase tracking-widest font-black">Entorno / Entidad</Label>
                                            <p className="text-base font-bold text-[hsl(var(--foreground))]">{entityCfg.icon} {entityCfg.label}</p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] text-[hsl(var(--muted))] uppercase tracking-widest font-black">Identificador Único</Label>
                                            <p className="text-sm font-mono text-[hsl(var(--primary))] bg-white/50 px-2 py-1 rounded inline-block border border-[hsl(var(--border))]">{selectedLog.entityId || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] text-[hsl(var(--muted))] uppercase tracking-widest font-black">Cronología</Label>
                                            <p className="text-sm font-semibold text-[hsl(var(--foreground))]">{formatDate(selectedLog.createdAt)}</p>
                                        </div>
                                    </div>

                                    {/* User Info */}
                                    <div className="bg-white rounded-2xl p-6 border-2 border-[hsl(var(--primary)/0.1)] shadow-sm">
                                        <Label className="text-[10px] text-[hsl(var(--primary))] uppercase tracking-[0.2em] font-black flex items-center gap-2 mb-4">
                                            <User className="w-4 h-4" />
                                            Operador Responsable
                                        </Label>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                            <div>
                                                <p className="text-[10px] font-bold text-[hsl(var(--muted))] uppercase tracking-widest">Identidad</p>
                                                <p className="text-base font-bold text-[hsl(var(--foreground))]">{selectedLog.userName || 'Sistema Autónomo'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-[hsl(var(--muted))] uppercase tracking-widest">Nivel de Acceso</p>
                                                <div className="mt-1">
                                                    <span className={cn(
                                                        "text-[10px] px-3 py-1 rounded-full font-black tracking-widest uppercase border shadow-sm inline-block",
                                                        selectedLog.userRole === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                            selectedLog.userRole === 'SUPER_ADMIN' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                                'bg-blue-50 text-blue-700 border-blue-200'
                                                    )}>
                                                        {selectedLog.userRole || 'SERVICE'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-[hsl(var(--muted))] uppercase tracking-widest">ID Operador</p>
                                                <p className="text-xs font-mono text-[hsl(var(--muted))] break-all mt-1">{selectedLog.userId || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Data Comparison: Human Friendly View */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-[10px] text-[hsl(var(--primary))] uppercase tracking-[0.2em] font-black flex items-center gap-2">
                                                <Activity className="w-4 h-4" />
                                                Detalle de los Cambios
                                            </Label>
                                            <span className="text-[9px] text-gray-400 font-mono italic">Formato humano</span>
                                        </div>

                                        <div className="border border-[hsl(var(--border))] rounded-2xl overflow-hidden shadow-sm bg-white">
                                            <table className="w-full text-sm border-collapse">
                                                <thead className="bg-[hsl(var(--surface-elevated))] border-b border-[hsl(var(--border))]">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted))] w-1/3">Campo</th>
                                                        {selectedLog.oldValue && (
                                                            <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-rose-600">Antes</th>
                                                        )}
                                                        <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-emerald-600">
                                                            {selectedLog.oldValue ? 'Después' : 'Valor'}
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
                                                    {(() => {
                                                        const oldData = (selectedLog.oldValue || {}) as any
                                                        const newData = (selectedLog.newValue || {}) as any
                                                        // Get unique keys from both
                                                        const keys = Array.from(new Set([
                                                            ...Object.keys(oldData),
                                                            ...Object.keys(newData)
                                                        ])).filter(k => k !== 'id' && k !== 'tenantId' && k !== 'createdAt' && k !== 'updatedAt')

                                                        if (keys.length === 0) {
                                                            return (
                                                                <tr>
                                                                    <td colSpan={3} className="px-4 py-8 text-center text-gray-400 italic">No se registraron cambios en los datos</td>
                                                                </tr>
                                                            )
                                                        }

                                                        return keys.map(key => {
                                                            const hasChanged = selectedLog.oldValue && selectedLog.newValue &&
                                                                JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])

                                                            return (
                                                                <tr key={key} className={cn(
                                                                    "transition-colors",
                                                                    hasChanged ? "bg-amber-50/30" : "hover:bg-gray-50/50"
                                                                )}>
                                                                    <td className="px-4 py-3 font-semibold text-gray-600">
                                                                        {FIELD_LABELS[key] || key}
                                                                        {hasChanged && <span className="ml-1.5 inline-block w-1 h-1 rounded-full bg-amber-500 animate-pulse" />}
                                                                    </td>
                                                                    {selectedLog.oldValue && (
                                                                        <td className="px-4 py-3 text-rose-800/70 line-through decoration-rose-300 opacity-80">
                                                                            {formatDetailValue(key, oldData[key])}
                                                                        </td>
                                                                    )}
                                                                    <td className={cn(
                                                                        "px-4 py-3 font-medium",
                                                                        hasChanged ? "text-emerald-800" : "text-gray-800"
                                                                    )}>
                                                                        {formatDetailValue(key, newData[key])}
                                                                    </td>
                                                                </tr>
                                                            )
                                                        })
                                                    })()}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Advanced View: RAW JSON */}
                                    <div className="pt-6">
                                        <details className="group">
                                            <summary className="cursor-pointer list-none flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted))] hover:text-[hsl(var(--primary))] transition-colors">
                                                <AlertTriangle className="w-3.5 h-3.5" />
                                                Vista Técnica (JSON)
                                                <ChevronRight className="w-3.5 h-3.5 transition-transform group-open:rotate-90 ml-auto" />
                                            </summary>
                                            <div className="mt-4 grid gap-4">
                                                {selectedLog.oldValue && (
                                                    <div className="space-y-2">
                                                        <Label className="text-[9px] text-rose-500 font-bold uppercase tracking-widest">OLD_VALUE</Label>
                                                        <pre className="bg-rose-50/20 border border-rose-100 rounded-xl p-4 text-[11px] font-mono overflow-auto max-h-40 text-rose-900 shadow-inner">
                                                            {JSON.stringify(selectedLog.oldValue, null, 2)}
                                                        </pre>
                                                    </div>
                                                )}
                                                {selectedLog.newValue && (
                                                    <div className="space-y-2">
                                                        <Label className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">NEW_VALUE</Label>
                                                        <pre className="bg-emerald-50/20 border border-emerald-100 rounded-xl p-4 text-[11px] font-mono overflow-auto max-h-40 text-emerald-900 shadow-inner">
                                                            {JSON.stringify(selectedLog.newValue, null, 2)}
                                                        </pre>
                                                    </div>
                                                )}
                                                {selectedLog.metadata && (
                                                    <div className="space-y-2">
                                                        <Label className="text-[9px] text-amber-500 font-bold uppercase tracking-widest">METADATA</Label>
                                                        <pre className="bg-amber-50/20 border border-amber-100 rounded-xl p-4 text-[11px] font-mono overflow-auto max-h-40 text-amber-900 shadow-inner">
                                                            {JSON.stringify(selectedLog.metadata, null, 2)}
                                                        </pre>
                                                    </div>
                                                )}
                                            </div>
                                        </details>
                                    </div>

                                    {/* ID */}
                                    <div className="pt-3 border-t">
                                        <p className="text-xs text-gray-400">
                                            <span className="font-medium">Log ID:</span>{' '}
                                            <span className="font-mono">{selectedLog.id}</span>
                                        </p>
                                    </div>
                                </div>
                            </>
                        )
                    })()}
                </DialogContent>
            </Dialog>
        </div>
    )
}

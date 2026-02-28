'use client'

import { useState, useEffect } from 'react'
import { api, type Customer } from '@/lib/backend'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Loader2, Pencil, Phone, Plus, RefreshCw, Search, ShieldAlert, ShieldCheck, Trash2, UserRound, X } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const COUNTRIES = [
    { code: '57', name: 'Colombia' },
    { code: '58', name: 'Venezuela' },
    { code: '34', name: 'Espana' },
    { code: '1', name: 'USA/Canada' },
    { code: '52', name: 'Mexico' },
    { code: '507', name: 'Panama' },
    { code: '593', name: 'Ecuador' },
    { code: '51', name: 'Peru' },
    { code: '54', name: 'Argentina' },
    { code: '56', name: 'Chile' },
    { code: '506', name: 'Costa Rica' },
    { code: '502', name: 'Guatemala' },
]

export default function CustomersPage({ forceAdminView = false }: { forceAdminView?: boolean }) {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [search, setSearch] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const [totalItems, setTotalItems] = useState(0)
    const itemsPerPage = 12
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [itemToDelete, setItemToDelete] = useState<string | null>(null)
    const [itemToToggleBan, setItemToToggleBan] = useState<Customer | null>(null)
    const [banReasonInput, setBanReasonInput] = useState('')
    const [isAdminUser, setIsAdminUser] = useState(forceAdminView)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        docNumber: '',
        address: ''
    })
    const [countryCode, setCountryCode] = useState('57')
    const [localPhone, setLocalPhone] = useState('')

    const loadCustomers = async (page = 1, query = search, refresh = false) => {
        setLoading(true)
        try {
            const response = await api.customers.list({ page, limit: itemsPerPage, search: query, refresh })
            const customersData = Array.isArray(response) ? response : (response?.data || [])
            setCustomers(customersData)
            setTotalPages(Array.isArray(response) ? 1 : (response.totalPages || 1))
            setTotalItems(Array.isArray(response) ? response.length : (response.total || 0))
            setCurrentPage(Array.isArray(response) ? 1 : (response.page || 1))
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadCustomers(1, search)
    }, [search])

    useEffect(() => {
        const loadRole = async () => {
            try {
                const me = await api.auth.me()
                setIsAdminUser(forceAdminView || me.role === 'ADMIN' || me.role === 'SUPER_ADMIN')
            } catch {
                setIsAdminUser(forceAdminView)
            }
        }
        loadRole()
    }, [forceAdminView])

    useEffect(() => {
        loadCustomers(currentPage, search)
    }, [currentPage])

    const startCreate = () => {
        setEditingId(null)
        setFormData({ name: '', email: '', phone: '', docNumber: '', address: '' })
        setCountryCode('57')
        setLocalPhone('')
        setShowForm(true)
    }

    const parsePhone = (phone: string) => {
        if (!phone) return { code: '57', local: '' }
        const matched = COUNTRIES.sort((a, b) => b.code.length - a.code.length)
            .find(c => phone.startsWith(c.code))
        if (matched) {
            return { code: matched.code, local: phone.slice(matched.code.length) }
        }
        return { code: '57', local: phone }
    }

    const startEdit = (customer: Customer) => {
        setEditingId(customer.id)
        setFormData({
            name: customer.name,
            email: customer.email || '',
            phone: customer.phone || '',
            docNumber: customer.docNumber || '',
            address: customer.address || ''
        })
        const parsed = parsePhone(customer.phone || '')
        setCountryCode(parsed.code)
        setLocalPhone(parsed.local)
        setShowForm(true)
    }

    const handleSubmit = async () => {
        if (!formData.name.trim()) return toast.error('El nombre es obligatorio')
        if (!formData.docNumber.trim()) return toast.error('El documento es obligatorio')
        if (!localPhone.trim()) return toast.error('El teléfono es obligatorio')

        const finalPhone = `${countryCode}${localPhone.replace(/\D/g, '')}`
        const submissionData = { ...formData, phone: finalPhone }

        setSaving(true)
        try {
            if (editingId) {
                await api.customers.update(editingId, submissionData)
                toast.success('Cliente actualizado')
                await loadCustomers(currentPage, search, true)
            } else {
                const created = await api.customers.create(submissionData)
                toast.success('Cliente creado')
                setSearch(created.name)
                await loadCustomers(1, created.name, true)
            }
            resetForm()
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setSaving(false)
        }
    }

    const remove = (id: string) => {
        setItemToDelete(id)
    }

    const startToggleBan = (customer: Customer) => {
        setItemToToggleBan(customer)
        setBanReasonInput(customer.banReason || '')
    }

    const confirmToggleBan = async () => {
        if (!itemToToggleBan) return

        const nextIsBanned = !itemToToggleBan.isBanned
        if (nextIsBanned && !banReasonInput.trim()) {
            toast.error('Debes indicar un motivo para vetar al cliente')
            return
        }

        try {
            await api.customers.setBan(itemToToggleBan.id, {
                isBanned: nextIsBanned,
                banReason: nextIsBanned ? banReasonInput.trim() : undefined,
            })
            toast.success(nextIsBanned ? 'Cliente vetado' : 'Veto retirado')
            await loadCustomers(currentPage, search, true)
            setItemToToggleBan(null)
            setBanReasonInput('')
        } catch (e: any) {
            toast.error(e.message)
        }
    }

    const confirmDelete = async () => {
        if (!itemToDelete) return
        try {
            await api.customers.remove(itemToDelete)
            toast.success('Cliente eliminado')
            await loadCustomers(currentPage, search, true)
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setItemToDelete(null)
        }
    }

    const resetForm = () => {
        setFormData({ name: '', email: '', phone: '', docNumber: '', address: '' })
        setEditingId(null)
        setShowForm(false)
    }

    // We use customers directly since they are already filtered by the API

    return (
        <div className="space-y-8 animate-fade-in pb-20 md:pb-0">
            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-4xl font-bold text-[hsl(var(--foreground))]" style={{ fontFamily: 'var(--font-display)' }}>
                        Clientes
                    </h2>
                    <p className="text-[hsl(var(--muted))] text-lg">
                        Gestiona tu base de clientes y sus datos de contacto.
                    </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button variant="outline" onClick={() => loadCustomers(currentPage, search, true)} disabled={loading} className="group">
                        <RefreshCw className={loading ? 'mr-2 h-4 w-4 animate-spin' : 'mr-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-500'} />
                        <span>{loading ? 'Actualizando...' : 'Refrescar'}</span>
                    </Button>
                    <Button onClick={startCreate} className="shadow-lg hover:shadow-xl transition-all">
                        <Plus className="mr-2 h-4 w-4" />
                        Registrar Cliente
                    </Button>
                </div>
            </div>

            {/* Filter Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-[rgb(230,225,220)]">
                <div className="w-full md:max-w-md relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(120,115,110)]" />
                    <Input
                        placeholder="Buscar por nombre, documento o teléfono..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 h-12"
                    />
                </div>
                <div className="text-sm text-[rgb(120,115,110)] font-medium">
                    {totalItems} clientes registrados
                </div>
            </div>

            {/* Customers Grid */}
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {customers.map((c, index) => (
                    <div
                        key={c.id}
                        className="group relative rounded-xl border border-[rgb(230,225,220)] bg-white p-3 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full animate-fade-in"
                        style={{ animationDelay: `${index * 0.05}s` }}
                    >
                        <div className="aspect-square w-16 h-16 md:w-20 md:h-20 rounded-full bg-[hsl(var(--background))] overflow-hidden mb-3 flex items-center justify-center relative mx-auto">
                            <UserRound className="h-8 w-8 md:h-10 md:w-10 text-[hsl(var(--muted))] group-hover:scale-110 transition-transform duration-500" />
                        </div>

                        <div className="space-y-1.5 flex-grow text-center">
                            <h3 className="text-sm md:text-lg font-bold text-[hsl(var(--foreground))] leading-tight line-clamp-2 min-h-[2.5em]" title={c.name}>
                                {c.name}
                            </h3>
                            {c.isBanned && (
                                <div className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-[10px] font-semibold text-red-700">
                                    <ShieldAlert className="h-3 w-3" />
                                    Cliente vetado
                                </div>
                            )}

                            <div className="flex flex-col gap-0.5 items-center justify-center text-xs text-[rgb(120,115,110)]">
                                {c.docNumber && (
                                    <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-[10px] md:text-xs">
                                        {c.docNumber}
                                    </span>
                                )}
                                {c.phone && (
                                    <span className="flex items-center gap-1 text-[10px] md:text-xs truncate max-w-full">
                                        <Phone className="h-3 w-3" /> {c.phone}
                                    </span>
                                )}
                            </div>
                            {c.isBanned && c.banReason && (
                                <p className="text-[10px] md:text-xs text-red-700 line-clamp-2 px-1" title={c.banReason}>
                                    {c.banReason}
                                </p>
                            )}
                        </div>

                        <div className={cn(
                            "mt-3 pt-3 border-t border-[rgb(230,225,220)] gap-1.5",
                            isAdminUser ? "grid grid-cols-3" : "grid grid-cols-2",
                        )}>
                            <Button
                                variant="secondary"
                                size="sm"
                                className="h-7 md:h-8 text-[10px] md:text-xs font-bold px-1"
                                onClick={() => startEdit(c)}
                            >
                                <Pencil className="h-3.5 w-3.5 md:mr-1" />
                                <span className="hidden md:inline">Editar</span>
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="h-7 md:h-8 text-[10px] md:text-xs font-bold px-1"
                                onClick={() => remove(c.id)}
                            >
                                <Trash2 className="h-3.5 w-3.5 md:mr-1" />
                                <span className="hidden md:inline">Eliminar</span>
                            </Button>
                            {isAdminUser && (
                                <Button
                                    variant={c.isBanned ? "outline" : "destructive"}
                                    size="sm"
                                    className="h-7 md:h-8 text-[10px] md:text-xs font-bold px-1"
                                    onClick={() => startToggleBan(c)}
                                >
                                    {c.isBanned ? (
                                        <ShieldCheck className="h-3.5 w-3.5 md:mr-1" />
                                    ) : (
                                        <ShieldAlert className="h-3.5 w-3.5 md:mr-1" />
                                    )}
                                    <span className="hidden md:inline">{c.isBanned ? 'Quitar veto' : 'Vetar'}</span>
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1 || loading}
                    >
                        Anterior
                    </Button>
                    <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <Button
                                key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className={cn(
                                    "w-8 h-8 p-0",
                                    currentPage === page && "bg-[rgb(25,35,25)] text-white"
                                )}
                                disabled={loading}
                            >
                                {page}
                            </Button>
                        ))}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages || loading}
                    >
                        Siguiente
                    </Button>
                </div>
            )}

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-[rgb(25,35,25)]/40 backdrop-blur-sm" onClick={resetForm} />
                    <Card className="w-full max-w-xl relative z-10 animate-scale-in">
                        <CardHeader className="border-b border-[rgb(230,225,220)]">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-2xl" style={{ fontFamily: 'var(--font-display)' }}>
                                        {editingId ? 'Editar Cliente' : 'Nuevo Cliente'}
                                    </CardTitle>
                                    <CardDescription>
                                        Registra la información de contacto del cliente.
                                    </CardDescription>
                                </div>
                                <Button variant="ghost" onClick={resetForm} size="icon" className="rounded-full">
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Nombre Completo <span className="text-red-500">*</span></Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ej. Juan Pérez"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Documento / CC / NIT <span className="text-red-500">*</span></Label>
                                    <Input
                                        value={formData.docNumber}
                                        onChange={(e) => setFormData({ ...formData, docNumber: e.target.value })}
                                        placeholder="Ej. 123456789"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Teléfono <span className="text-red-500">*</span></Label>
                                    <div className="flex gap-2">
                                        <Select value={countryCode} onValueChange={setCountryCode}>
                                            <SelectTrigger className="w-[120px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="z-[60]">
                                                {COUNTRIES.map(c => (
                                                    <SelectItem key={c.code} value={c.code}>
                                                        {c.name} (+{c.code})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            value={localPhone}
                                            onChange={(e) => setLocalPhone(e.target.value)}
                                            placeholder="3001234567"
                                            className="flex-1"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Correo Electrónico</Label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="cliente@ejemplo.com"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Dirección</Label>
                                    <Input
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="Ej. Calle 123 # 45-67"
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <div className="p-6 border-t border-[rgb(230,225,220)] flex gap-3">
                            <Button onClick={handleSubmit} className="flex-1 h-12 text-lg shadow-xl" disabled={saving}>
                                {saving ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</span> : editingId ? 'Guardar Cambios' : 'Crear Cliente'}
                            </Button>
                            <Button variant="outline" onClick={resetForm} className="h-12" disabled={saving}>
                                Cancelar
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Confirmation Dialog */}
            <ConfirmDialog
                open={!!itemToDelete}
                onOpenChange={(open) => !open && setItemToDelete(null)}
                onConfirm={confirmDelete}
                title="¿Eliminar cliente?"
                description="Esta acción no se puede deshacer. Los datos del cliente serán eliminados permanentemente."
                confirmText="Sí, eliminar"
                variant="destructive"
            />

            {itemToToggleBan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-[rgb(25,35,25)]/40 backdrop-blur-sm" onClick={() => setItemToToggleBan(null)} />
                    <Card className="w-full max-w-lg relative z-10 animate-scale-in">
                        <CardHeader>
                            <CardTitle>{itemToToggleBan.isBanned ? 'Quitar veto de cliente' : 'Vetar cliente'}</CardTitle>
                            <CardDescription>
                                {itemToToggleBan.isBanned
                                    ? 'El cliente volverá a estar habilitado para ventas en todas las sedes.'
                                    : 'Este cliente no podrá ser seleccionado para ventas en ninguna sede.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-lg bg-gray-50 border p-3 text-sm">
                                <div className="font-semibold">{itemToToggleBan.name}</div>
                                {itemToToggleBan.docNumber && <div className="text-gray-600">Documento: {itemToToggleBan.docNumber}</div>}
                            </div>
                            {!itemToToggleBan.isBanned && (
                                <div className="space-y-2">
                                    <Label>Motivo del veto <span className="text-red-500">*</span></Label>
                                    <Input
                                        value={banReasonInput}
                                        onChange={(e) => setBanReasonInput(e.target.value)}
                                        placeholder="Ej. Incumplimiento reiterado de pagos"
                                        maxLength={500}
                                    />
                                </div>
                            )}
                            {itemToToggleBan.isBanned && itemToToggleBan.banReason && (
                                <div className="space-y-1">
                                    <Label>Motivo actual</Label>
                                    <p className="text-sm text-gray-700 rounded-md bg-gray-50 border p-3">{itemToToggleBan.banReason}</p>
                                </div>
                            )}
                            <div className="flex gap-3 pt-2">
                                <Button variant="outline" className="flex-1" onClick={() => setItemToToggleBan(null)}>
                                    Cancelar
                                </Button>
                                <Button
                                    variant={itemToToggleBan.isBanned ? "default" : "destructive"}
                                    className="flex-1"
                                    onClick={confirmToggleBan}
                                >
                                    {itemToToggleBan.isBanned ? 'Quitar veto' : 'Confirmar veto'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}

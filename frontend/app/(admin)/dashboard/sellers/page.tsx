'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/backend'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Loader2, Plus, RefreshCw, Search, Store, UserRound, X } from 'lucide-react'

type User = {
    id: string
    name: string
    email: string
    role: string
    tenantId: string
    warehouseId?: string
    warehouse?: {
        id: string
        name: string
    }
}

type Warehouse = {
    id: string
    name: string
}

export default function SellersPage() {
    const [sellers, setSellers] = useState<User[]>([])
    const [warehouses, setWarehouses] = useState<Warehouse[]>([])
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [showWarehouseModal, setShowWarehouseModal] = useState(false)
    const [selectedSeller, setSelectedSeller] = useState<User | null>(null)
    const [search, setSearch] = useState('')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [viewModal, setViewModal] = useState<{ seller: User | null; visible: boolean }>({ seller: null, visible: false })
    const [itemToDelete, setItemToDelete] = useState<string | null>(null)

    // Form State
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [warehouseId, setWarehouseId] = useState('')

    const filteredSellers = useMemo(() => {
        const q = search.trim().toLowerCase()
        if (!q) return sellers

        return sellers.filter((s) => {
            const haystack = [s.name, s.email].join(' ').toLowerCase()
            return haystack.includes(q)
        })
    }, [sellers, search])

    const load = async () => {
        setLoading(true)
        try {
            const [usersData, wsData] = await Promise.all([
                api.sellers.list(),
                api.warehouses.list()
            ])
            setSellers(usersData.filter((u: User) => u.role === 'SELLER'))
            setWarehouses(wsData)
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [])

    const resetForm = () => {
        setEditingId(null)
        setName('')
        setEmail('')
        setPassword('')
        setWarehouseId('')
        setShowForm(false)
    }

    const startCreate = () => {
        setEditingId(null)
        setName('')
        setEmail('')
        setPassword('')
        setWarehouseId(warehouses[0]?.id || '')
        setShowForm(true)
    }

    const startEdit = (s: User) => {
        setEditingId(s.id)
        setName(s.name)
        setEmail(s.email)
        setPassword('')
        setWarehouseId(s.warehouseId || '')
        setShowForm(true)
    }

    const startChangeWarehouse = (s: User) => {
        setSelectedSeller(s)
        setWarehouseId(s.warehouseId || '')
        setShowWarehouseModal(true)
    }

    const updateWarehouse = async () => {
        if (!selectedSeller) return
        if (!warehouseId) {
            toast.error('Debes seleccionar una sede')
            return
        }
        setSaving(true)
        try {
            await api.sellers.update(selectedSeller.id, { warehouseId })
            toast.success('Sede actualizada')
            setShowWarehouseModal(false)
            await load()
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setSaving(false)
        }
    }

    const create = async () => {
        if (!name.trim() || !email.trim()) {
            toast.error('Nombre y Email son obligatorios')
            return
        }

        if (!editingId && !password.trim()) {
            toast.error('La contraseña es obligatoria para nuevos vendedores')
            return
        }

        if (password && password.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres')
            return
        }

        if (!warehouseId) {
            toast.error('Debes asignar una sede al vendedor')
            return
        }

        setSaving(true)
        try {
            if (editingId) {
                // Not sending email update for now as it's complex with Auth
                const payload: any = { name: name.trim() }
                if (password.trim()) payload.password = password.trim()
                if (warehouseId) payload.warehouseId = warehouseId

                await api.sellers.update(editingId, payload)
                toast.success('Vendedor actualizado')
            } else {
                await api.sellers.create({
                    name: name.trim(),
                    email: email.trim(),
                    password: password.trim(),
                    role: 'SELLER',
                    warehouseId: warehouseId || undefined
                })
                toast.success('Vendedor creado')
            }
            resetForm()
            await load()
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setSaving(false)
        }
    }

    const remove = (id: string) => {
        setItemToDelete(id)
    }

    const confirmDelete = async () => {
        if (!itemToDelete) return
        const id = itemToDelete

        try {
            await api.sellers.remove(id)
            toast.success('Vendedor eliminado')
            if (editingId === id) resetForm()
            if (viewModal.seller?.id === id) setViewModal({ seller: null, visible: false })
            await load()
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setItemToDelete(null)
        }
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-4xl font-bold text-[hsl(var(--foreground))]" style={{ fontFamily: 'var(--font-display)' }}>
                        Vendedores
                    </h2>
                    <p className="text-[hsl(var(--muted))] text-lg">
                        Gestiona tu equipo de ventas y sus accesos.
                    </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button variant="outline" onClick={load} disabled={loading} className="group">
                        <RefreshCw className={loading ? 'mr-2 h-4 w-4 animate-spin' : 'mr-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-500'} />
                        <span>{loading ? 'Actualizando...' : 'Refrescar'}</span>
                    </Button>
                    <Button onClick={startCreate} className="shadow-lg hover:shadow-xl transition-all">
                        <Plus className="mr-2 h-4 w-4" />
                        Registrar Vendedor
                    </Button>
                </div>
            </div>

            {/* Filter Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-[rgb(230,225,220)]">
                <div className="w-full md:max-w-md relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(120,115,110)]" />
                    <Input
                        placeholder="Buscar por nombre o email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 h-12"
                    />
                </div>
                <div className="text-sm text-[rgb(120,115,110)] font-medium">
                    {filteredSellers.length} vendedores registrados
                </div>
            </div>

            {/* Sellers Grid */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredSellers.map((s, index) => (
                    <div
                        key={s.id}
                        className="group relative rounded-2xl border border-[rgb(230,225,220)] bg-white p-5 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col h-full animate-fade-in"
                        style={{ animationDelay: `${index * 0.05}s` }}
                    >
                        <div className="aspect-square w-full rounded-full bg-[hsl(var(--background))] overflow-hidden mb-4 flex items-center justify-center relative mx-auto max-w-[150px]">
                            <UserRound className="h-14 w-14 text-[hsl(var(--muted))] group-hover:scale-110 transition-transform duration-500" />
                        </div>

                        <div className="space-y-2 flex-grow text-center">
                            <h3 className="text-xl font-bold text-[hsl(var(--foreground))] leading-tight">
                                {s.name}
                            </h3>
                            <p className="text-sm text-[rgb(120,115,110)]">
                                {s.email}
                            </p>
                            <div className="mt-2 text-xs font-semibold px-2 py-1 bg-[hsl(var(--background))] rounded-lg inline-block text-[rgb(120,115,110)]">
                                <span className="inline-flex items-center gap-1">
                                    <Store className="h-3.5 w-3.5" /> {s.warehouse?.name || 'Sin sede asignada'}
                                </span>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-[rgb(230,225,220)] grid grid-cols-1 gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 font-bold w-full"
                                onClick={() => startChangeWarehouse(s)}
                            >
                                Cambiar de sede
                            </Button>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="h-9 font-bold"
                                    onClick={() => startEdit(s)}
                                >
                                    Editar
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="h-9 font-bold"
                                    onClick={() => remove(s.id)}
                                >
                                    Eliminar
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-[rgb(25,35,25)]/40 backdrop-blur-sm" onClick={resetForm} />
                    <Card className="w-full max-w-xl relative z-10 animate-scale-in">
                        <CardHeader className="border-b border-[rgb(230,225,220)]">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-2xl" style={{ fontFamily: 'var(--font-display)' }}>
                                        {editingId ? 'Editar Vendedor' : 'Nuevo Vendedor'}
                                    </CardTitle>
                                    <CardDescription>
                                        Registra los datos de acceso para tu vendedor.
                                    </CardDescription>
                                </div>
                                <Button variant="ghost" onClick={resetForm} size="icon" className="rounded-full">
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-2">
                                <Label>Nombre Completo</Label>
                                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Ana García" />
                            </div>
                            <div className="space-y-2">
                                <Label>Correo Electrónico</Label>
                                <Input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="ana@muebleria.com"
                                    disabled={!!editingId} // Disable email edit for now to avoid Auth complexity issues
                                    type="email"
                                />
                                {editingId && <p className="text-xs text-[hsl(var(--muted))]">El email no se puede cambiar directamente.</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Asignar Sede (Almacén)</Label>
                                <select
                                    className="flex h-11 w-full rounded-lg border border-[rgb(230,225,220)] bg-white/90 px-3 py-2 text-sm focus:outline-none focus:border-[rgb(25,35,25)]"
                                    value={warehouseId}
                                    onChange={(e) => setWarehouseId(e.target.value)}
                                >
                                    {warehouses.map((w) => (
                                        <option key={w.id} value={w.id}>{w.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>{editingId ? 'Cambiar Contraseña (Opcional)' : 'Contraseña'}</Label>
                                <Input
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    type="password"
                                    placeholder={editingId ? "Dejar en blanco para mantener la actual" : "Mínimo 6 caracteres"}
                                />
                            </div>
                        </CardContent>
                        <div className="p-6 border-t border-[rgb(230,225,220)] flex gap-3">
                            <Button onClick={create} className="flex-1 h-12 text-lg shadow-xl" disabled={saving}>
                                {saving ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</span> : editingId ? 'Guardar Cambios' : 'Crear Vendedor'}
                            </Button>
                            <Button variant="outline" onClick={resetForm} className="h-12" disabled={saving}>
                                Cancelar
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Simple Warehouse Modal for quick change */}
            {showWarehouseModal && selectedSeller && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-[rgb(25,35,25)]/40 backdrop-blur-sm" onClick={() => setShowWarehouseModal(false)} />
                    <Card className="w-full max-w-md relative z-10 animate-scale-in">
                        <CardHeader className="border-b border-[rgb(230,225,220)]">
                            <CardTitle className="text-xl">Cambiar sede de {selectedSeller.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Label>Seleccionar nueva sede</Label>
                                <select
                                    className="flex h-11 w-full rounded-lg border border-[rgb(230,225,220)] bg-white/90 px-3 py-2 text-sm focus:outline-none focus:border-[rgb(25,35,25)]"
                                    value={warehouseId}
                                    onChange={(e) => setWarehouseId(e.target.value)}
                                >
                                    {warehouses.map((w) => (
                                        <option key={w.id} value={w.id}>{w.name}</option>
                                    ))}
                                </select>
                            </div>
                        </CardContent>
                        <div className="p-6 border-t border-[rgb(230,225,220)] flex gap-3">
                            <Button onClick={updateWarehouse} className="flex-1 h-12" disabled={saving}>
                                {saving ? 'Cambiando...' : 'Cambiar Sede'}
                            </Button>
                            <Button variant="outline" onClick={() => setShowWarehouseModal(false)} className="h-12" disabled={saving}>
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
                title="¿Eliminar vendedor?"
                description="Se revocará el acceso inmediatamente y se eliminarán sus datos."
                confirmText="Sí, dar de baja"
                variant="destructive"
            />
        </div>
    )
}

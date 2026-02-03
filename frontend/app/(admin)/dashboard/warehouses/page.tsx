'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { api, type Warehouse } from '@/lib/backend'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

export default function WarehousesPage() {
    const [warehouses, setWarehouses] = useState<Warehouse[]>([])
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [search, setSearch] = useState('')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [viewModal, setViewModal] = useState<{ warehouse: Warehouse | null; visible: boolean }>({ warehouse: null, visible: false })
    const [itemToDelete, setItemToDelete] = useState<string | null>(null)

    const [name, setName] = useState('')
    const [address, setAddress] = useState('')

    const filteredWarehouses = useMemo(() => {
        const q = search.trim().toLowerCase()
        if (!q) return warehouses

        return warehouses.filter((w) => {
            const haystack = [w.name, w.address ?? ''].join(' ').toLowerCase()
            return haystack.includes(q)
        })
    }, [warehouses, search])

    const load = async () => {
        setLoading(true)
        try {
            const data = await api.warehouses.list()
            setWarehouses(data)
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
        setAddress('')
        setShowForm(false)
    }

    const startCreate = () => {
        setEditingId(null)
        setShowForm(true)
    }

    const startEdit = (w: Warehouse) => {
        setEditingId(w.id)
        setName(w.name ?? '')
        setAddress(w.address ?? '')
        setShowForm(true)
    }

    const create = async () => {
        if (!name.trim()) {
            toast.error('El nombre es obligatorio')
            return
        }

        setSaving(true)
        try {
            if (editingId) {
                await api.warehouses.update(editingId, { name: name.trim(), address: address.trim() || undefined })
                toast.success('Almacén actualizado')
            } else {
                await api.warehouses.create({ name: name.trim(), address: address.trim() || undefined })
                toast.success('Almacén creado')
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
            await api.warehouses.remove(id)
            toast.success('Almacén eliminado')
            if (editingId === id) resetForm()
            if (viewModal.warehouse?.id === id) setViewModal({ warehouse: null, visible: false })
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
                        Almacenes
                    </h2>
                    <p className="text-[hsl(var(--muted))] text-lg">
                        Gestiona tus bodegas, inventarios y puntos de venta físicos.
                    </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button variant="outline" onClick={load} disabled={loading} className="group">
                        <span className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}>
                            {loading ? '⚙️' : '🔄'}
                        </span>
                        <span>{loading ? 'Actualizando...' : 'Refrescar'}</span>
                    </Button>
                    <Button onClick={startCreate} className="shadow-lg hover:shadow-xl transition-all">
                        <span className="mr-2">🏢</span>
                        Crear Nuevo Almacén
                    </Button>
                </div>
            </div>

            {/* Filter Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-[rgb(230,225,220)]">
                <div className="w-full md:max-w-md relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">🔍</span>
                    <Input
                        placeholder="Buscar por nombre o dirección..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 h-12"
                    />
                </div>
                <div className="text-sm text-[rgb(120,115,110)] font-medium">
                    {filteredWarehouses.length} almacenes registrados
                </div>
            </div>

            {/* Warehouses Grid */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredWarehouses.map((w, index) => (
                    <div
                        key={w.id}
                        className="group relative rounded-2xl border border-[rgb(230,225,220)] bg-white p-5 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col h-full animate-fade-in"
                        style={{ animationDelay: `${index * 0.05}s` }}
                    >
                        <div className="aspect-video w-full rounded-xl bg-[hsl(var(--background))] overflow-hidden mb-4 flex items-center justify-center relative">
                            <span className="text-6xl group-hover:scale-125 transition-transform duration-500">🏢</span>
                            <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--foreground))]/5 to-transparent"></div>
                        </div>

                        <div className="space-y-2 flex-grow">
                            <h3 className="text-xl font-bold text-[hsl(var(--foreground))] leading-tight group-hover:text-[hsl(var(--primary))] transition-colors">
                                {w.name}
                            </h3>
                            <p className="text-sm text-[rgb(120,115,110)] flex items-center gap-2">
                                <span className="opacity-70">📍</span>
                                <span className="truncate">{w.address ?? 'Sin dirección registrada'}</span>
                            </p>
                        </div>

                        <div className="mt-4 pt-4 border-t border-[rgb(230,225,220)] grid grid-cols-2 gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 font-bold"
                                onClick={() => setViewModal({ warehouse: w, visible: true })}
                            >
                                Detalles
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                className="h-9 font-bold"
                                onClick={() => startEdit(w)}
                            >
                                Editar
                            </Button>
                            {!w.isDefault && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="col-span-2 h-9 font-bold"
                                    onClick={() => remove(w.id)}
                                >
                                    Eliminar
                                </Button>
                            )}
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
                                        {editingId ? 'Editar Almacén' : 'Nuevo Almacén'}
                                    </CardTitle>
                                    <CardDescription>
                                        Registra una nueva sede o bodega para tu inventario.
                                    </CardDescription>
                                </div>
                                <Button variant="ghost" onClick={resetForm} size="icon" className="rounded-full">✕</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-2">
                                <Label>Nombre de la Sede</Label>
                                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Bodega Central, Sucursal Norte" />
                            </div>
                            <div className="space-y-2">
                                <Label>Dirección Física</Label>
                                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Ej. Calle 123 #45-67, Ciudad" />
                            </div>
                        </CardContent>
                        <div className="p-6 border-t border-[rgb(230,225,220)] flex gap-3">
                            <Button onClick={create} className="flex-1 h-12 text-lg shadow-xl" disabled={saving}>
                                {saving ? '⚙️ Guardando...' : editingId ? 'Guardar Cambios' : 'Confirmar y Crear'}
                            </Button>
                            <Button variant="outline" onClick={resetForm} className="h-12" disabled={saving}>
                                Cancelar
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* View Modal */}
            {viewModal.visible && viewModal.warehouse && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-[rgb(25,35,25)]/40 backdrop-blur-sm" onClick={() => setViewModal({ warehouse: null, visible: false })} />
                    <Card className="w-full max-w-xl relative z-10 animate-scale-in">
                        <CardHeader className="border-b border-[rgb(230,225,220)]">
                            <div className="flex items-center justify-between">
                                <CardTitle style={{ fontFamily: 'var(--font-display)' }}>Detalles del Almacén</CardTitle>
                                <Button variant="ghost" onClick={() => setViewModal({ warehouse: null, visible: false })} size="icon">✕</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="aspect-video w-full rounded-2xl bg-[hsl(var(--background))] flex flex-col items-center justify-center border border-[hsl(var(--border))] shadow-inner">
                                <span className="text-8xl mb-2">🏢</span>
                                <div className="text-[hsl(var(--foreground))] font-black text-2xl uppercase tracking-widest opacity-20">ALMACÉN</div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="text-xs font-bold text-[rgb(120,115,110)] uppercase tracking-widest mb-1">Nombre</div>
                                    <div className="text-2xl font-bold text-[rgb(25,35,25)]">{viewModal.warehouse.name}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-[rgb(120,115,110)] uppercase tracking-widest mb-1">Ubicación</div>
                                    <div className="text-lg text-[rgb(25,25,25)]">{viewModal.warehouse.address ?? 'Sin dirección registrada'}</div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-[rgb(230,225,220)] grid grid-cols-2 gap-3">
                                <Button
                                    onClick={() => {
                                        const w = viewModal.warehouse
                                        if (!w) return
                                        setViewModal({ warehouse: null, visible: false })
                                        startEdit(w)
                                    }}
                                    className="h-11 font-bold"
                                >
                                    Editar Almacén
                                </Button>
                                {!viewModal.warehouse.isDefault && (
                                    <Button
                                        variant="destructive"
                                        onClick={() => remove(viewModal.warehouse!.id)}
                                        className="h-11 font-bold"
                                    >
                                        Eliminar
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
            {/* Confirmation Dialog */}
            <ConfirmDialog
                open={!!itemToDelete}
                onOpenChange={(open) => !open && setItemToDelete(null)}
                onConfirm={confirmDelete}
                title="¿Eliminar almacén?"
                description="Esto eliminará el almacén. Ten cuidado si tienes productos asignados a este almacén."
                confirmText="Sí, eliminar"
                variant="destructive"
            />
        </div>
    )
}

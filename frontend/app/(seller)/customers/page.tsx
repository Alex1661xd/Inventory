'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/backend'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

interface Customer {
    id: string
    name: string
    email?: string
    phone?: string
    docNumber?: string
    address?: string
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [search, setSearch] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [itemToDelete, setItemToDelete] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        docNumber: '',
        address: ''
    })

    useEffect(() => {
        loadCustomers()
    }, [])

    const loadCustomers = async () => {
        setLoading(true)
        try {
            const data = await api.customers.list()
            setCustomers(data)
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    const startCreate = () => {
        setEditingId(null)
        setFormData({ name: '', email: '', phone: '', docNumber: '', address: '' })
        setShowForm(true)
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
        setShowForm(true)
    }

    const handleSubmit = async () => {
        if (!formData.name.trim()) return toast.error('El nombre es obligatorio')
        if (!formData.docNumber.trim()) return toast.error('El documento es obligatorio')
        if (!formData.phone.trim()) return toast.error('El teléfono es obligatorio')

        setSaving(true)
        try {
            if (editingId) {
                await api.customers.update(editingId, formData)
                toast.success('Cliente actualizado')
            } else {
                await api.customers.create(formData)
                toast.success('Cliente creado')
            }
            resetForm()
            await loadCustomers()
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
        try {
            await api.customers.remove(itemToDelete)
            toast.success('Cliente eliminado')
            await loadCustomers()
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

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        c.phone?.includes(search) ||
        c.docNumber?.includes(search)
    )

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
                    <Button variant="outline" onClick={loadCustomers} disabled={loading} className="group">
                        <span className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}>
                            {loading ? '⚙️' : '🔄'}
                        </span>
                        <span>{loading ? 'Actualizando...' : 'Refrescar'}</span>
                    </Button>
                    <Button onClick={startCreate} className="shadow-lg hover:shadow-xl transition-all">
                        <span className="mr-2">👤</span>
                        Registrar Cliente
                    </Button>
                </div>
            </div>

            {/* Filter Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-[rgb(230,225,220)]">
                <div className="w-full md:max-w-md relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">🔍</span>
                    <Input
                        placeholder="Buscar por nombre, documento o teléfono..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 h-12"
                    />
                </div>
                <div className="text-sm text-[rgb(120,115,110)] font-medium">
                    {filteredCustomers.length} clientes registrados
                </div>
            </div>

            {/* Customers Grid */}
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredCustomers.map((c, index) => (
                    <div
                        key={c.id}
                        className="group relative rounded-xl border border-[rgb(230,225,220)] bg-white p-3 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full animate-fade-in"
                        style={{ animationDelay: `${index * 0.05}s` }}
                    >
                        <div className="aspect-square w-16 h-16 md:w-20 md:h-20 rounded-full bg-[hsl(var(--background))] overflow-hidden mb-3 flex items-center justify-center relative mx-auto">
                            <span className="text-2xl md:text-4xl group-hover:scale-110 transition-transform duration-500">🧑‍💼</span>
                        </div>

                        <div className="space-y-1.5 flex-grow text-center">
                            <h3 className="text-sm md:text-lg font-bold text-[hsl(var(--foreground))] leading-tight line-clamp-2 min-h-[2.5em]" title={c.name}>
                                {c.name}
                            </h3>

                            <div className="flex flex-col gap-0.5 items-center justify-center text-xs text-[rgb(120,115,110)]">
                                {c.docNumber && (
                                    <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-[10px] md:text-xs">
                                        {c.docNumber}
                                    </span>
                                )}
                                {c.phone && (
                                    <span className="flex items-center gap-1 text-[10px] md:text-xs truncate max-w-full">
                                        📞 {c.phone}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-[rgb(230,225,220)] grid grid-cols-2 gap-1.5">
                            <Button
                                variant="secondary"
                                size="sm"
                                className="h-7 md:h-8 text-[10px] md:text-xs font-bold px-1"
                                onClick={() => startEdit(c)}
                            >
                                <span className="md:hidden">✏️</span>
                                <span className="hidden md:inline">Editar</span>
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="h-7 md:h-8 text-[10px] md:text-xs font-bold px-1"
                                onClick={() => remove(c.id)}
                            >
                                <span className="md:hidden">🗑️</span>
                                <span className="hidden md:inline">Eliminar</span>
                            </Button>
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
                                        {editingId ? 'Editar Cliente' : 'Nuevo Cliente'}
                                    </CardTitle>
                                    <CardDescription>
                                        Registra la información de contacto del cliente.
                                    </CardDescription>
                                </div>
                                <Button variant="ghost" onClick={resetForm} size="icon" className="rounded-full">✕</Button>
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
                                    <Input
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="Ej. 3001234567"
                                    />
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
                                {saving ? '⚙️ Guardando...' : editingId ? 'Guardar Cambios' : 'Crear Cliente'}
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
        </div>
    )
}

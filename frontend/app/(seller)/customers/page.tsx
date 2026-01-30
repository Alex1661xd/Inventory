'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/backend'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from 'sonner'
import { Pencil, Trash2, Plus, Search } from 'lucide-react'

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
    const [search, setSearch] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editingId) {
                await api.customers.update(editingId, formData)
                toast.success('Cliente actualizado')
            } else {
                await api.customers.create(formData)
                toast.success('Cliente creado')
            }
            resetForm()
            loadCustomers()
        } catch (e: any) {
            toast.error(e.message)
        }
    }

    const handleEdit = (customer: Customer) => {
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

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar este cliente?')) return
        try {
            await api.customers.delete(id)
            toast.success('Cliente eliminado')
            loadCustomers()
        } catch (e: any) {
            toast.error(e.message)
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
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Clientes</h1>
                    <p className="text-muted-foreground">Gestiona tu base de clientes</p>
                </div>
                <Button onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Cliente
                </Button>
            </div>

            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>{editingId ? 'Editar' : 'Nuevo'} Cliente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Nombre Completo *</Label>
                                    <Input
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Documento</Label>
                                    <Input
                                        value={formData.docNumber}
                                        onChange={(e) => setFormData({ ...formData, docNumber: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Teléfono</Label>
                                    <Input
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Dirección</Label>
                                    <Input
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit">Guardar</Button>
                                <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Search className="h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Buscar clientes..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">Cargando...</div>
                    ) : filteredCustomers.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No se encontraron clientes
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-3 font-semibold text-sm">Nombre</th>
                                        <th className="text-left p-3 font-semibold text-sm hidden md:table-cell">Documento</th>
                                        <th className="text-left p-3 font-semibold text-sm hidden lg:table-cell">Email</th>
                                        <th className="text-left p-3 font-semibold text-sm hidden sm:table-cell">Teléfono</th>
                                        <th className="w-28"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCustomers.map(customer => (
                                        <tr key={customer.id} className="border-b hover:bg-gray-50">
                                            <td className="p-3">
                                                <div className="font-medium">{customer.name}</div>
                                                <div className="text-xs text-muted-foreground md:hidden">
                                                    {customer.docNumber || customer.phone}
                                                </div>
                                            </td>
                                            <td className="p-3 text-sm hidden md:table-cell">{customer.docNumber || '-'}</td>
                                            <td className="p-3 text-sm hidden lg:table-cell">{customer.email || '-'}</td>
                                            <td className="p-3 text-sm hidden sm:table-cell">{customer.phone || '-'}</td>
                                            <td className="p-3">
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEdit(customer)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(customer.id)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

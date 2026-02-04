'use client'

import { useState, useEffect } from 'react'
import { api, type Supplier } from '@/lib/backend'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Pencil, Trash2, Plus, Search, Truck } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        contactName: '',
        email: '',
        phone: '',
        address: '',
        taxId: '',
        paymentTerms: ''
    })

    useEffect(() => {
        loadSuppliers()
    }, [])

    const loadSuppliers = async () => {
        setLoading(true)
        try {
            const data = await api.suppliers.list()
            setSuppliers(data)
        } catch (error) {
            toast.error('Error al cargar proveedores')
        } finally {
            setLoading(false)
        }
    }

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.contactName?.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase())
    )

    const handleCreate = () => {
        setEditingSupplier(null)
        setFormData({
            name: '',
            contactName: '',
            email: '',
            phone: '',
            address: '',
            taxId: '',
            paymentTerms: ''
        })
        setIsModalOpen(true)
    }

    const handleEdit = (supplier: Supplier) => {
        setEditingSupplier(supplier)
        setFormData({
            name: supplier.name,
            contactName: supplier.contactName || '',
            email: supplier.email || '',
            phone: supplier.phone || '',
            address: supplier.address || '',
            taxId: supplier.taxId || '',
            paymentTerms: supplier.paymentTerms || ''
        })
        setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.name.trim()) {
            toast.error('El nombre es obligatorio')
            return
        }

        setIsSubmitting(true)
        try {
            if (editingSupplier) {
                await api.suppliers.update(editingSupplier.id, formData)
                toast.success('Proveedor actualizado')
            } else {
                await api.suppliers.create(formData)
                toast.success('Proveedor creado')
            }
            setIsModalOpen(false)
            loadSuppliers()
        } catch (error) {
            toast.error('Error al guardar proveedor')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await api.suppliers.remove(id)
            toast.success('Proveedor eliminado')
            loadSuppliers()
        } catch (error) {
            toast.error('Error al eliminar')
        }
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>
                        Gestión de Proveedores
                    </h1>
                    <p className="text-gray-500 text-sm md:text-base">Administra tu base de datos de proveedores y contactos.</p>
                </div>
                <Button onClick={handleCreate} className="shadow-lg hover:shadow-xl transition-all">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Proveedor
                </Button>
            </div>

            {/* Filtros */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-2">
                <Search className="h-5 w-5 text-gray-400" />
                <Input
                    placeholder="Buscar por nombre, contacto o email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border-none shadow-none focus-visible:ring-0"
                />
            </div>

            {/* Listado */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50">
                            <TableHead>Nombre</TableHead>
                            <TableHead>Contacto</TableHead>
                            <TableHead className="hidden md:table-cell">Datos Fiscales</TableHead>
                            <TableHead className="hidden md:table-cell">Plazo Pago</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                                    Cargando...
                                </TableCell>
                            </TableRow>
                        ) : filteredSuppliers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <Truck className="h-10 w-10 text-gray-300" />
                                        <p>No se encontraron proveedores</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredSuppliers.map((supplier) => (
                                <TableRow key={supplier.id} className="hover:bg-gray-50/50 transition-colors">
                                    <TableCell className="font-medium">
                                        <div>{supplier.name}</div>
                                        <div className="text-xs text-gray-500 md:hidden">{supplier.taxId}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">{supplier.contactName || '-'}</div>
                                        <div className="text-xs text-gray-400">{supplier.email}</div>
                                        <div className="text-xs text-gray-400">{supplier.phone}</div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <div className="text-sm">{supplier.taxId || '-'}</div>
                                        <div className="text-xs text-gray-400 truncate max-w-[150px]">{supplier.address}</div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        {supplier.paymentTerms ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                {supplier.paymentTerms}
                                            </span>
                                        ) : '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(supplier)}>
                                                <Pencil className="h-4 w-4 text-blue-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => setDeleteTargetId(supplier.id)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Modal Crear/Editar */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}</DialogTitle>
                        <DialogDescription>
                            Ingresa los datos de la empresa proveedora y su contacto.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="name">Nombre de la Empresa *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ej. Distribuidora de Maderas S.A."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="taxId">NIT / RUC / ID Fiscal</Label>
                                <Input
                                    id="taxId"
                                    value={formData.taxId}
                                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                                    placeholder="Ej. 900.123.456-1"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="paymentTerms">Plazo de Pago</Label>
                                <Input
                                    id="paymentTerms"
                                    value={formData.paymentTerms}
                                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                                    placeholder="Ej. 30 Días / Contado"
                                />
                            </div>

                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="address">Dirección Física</Label>
                                <Input
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Dirección completa de oficinas o bodega"
                                />
                            </div>

                            <div className="col-span-2 border-t pt-4 mt-2">
                                <h4 className="text-sm font-medium text-gray-500 mb-4">Información de Contacto</h4>
                            </div>

                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="contactName">Nombre del Contacto</Label>
                                <Input
                                    id="contactName"
                                    value={formData.contactName}
                                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                                    placeholder="Ej. Juan Pérez (Vendedor)"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Correo Electrónico</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="contacto@proveedor.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Teléfono / Celular</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+57 300 123 4567"
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Guardando...' : (editingSupplier ? 'Actualizar' : 'Crear Proveedor')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!deleteTargetId}
                onOpenChange={(open) => !open && setDeleteTargetId(null)}
                title="Eliminar Proveedor"
                description="¿Estás seguro de eliminar este proveedor? Esta acción no se puede deshacer."
                onConfirm={() => deleteTargetId && handleDelete(deleteTargetId)}
                variant="destructive"
                confirmText="Eliminar"
            />
        </div >
    )
}

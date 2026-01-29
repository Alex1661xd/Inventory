'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { api, type Category } from '@/lib/backend'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form, setForm] = useState({ name: '', description: '' })
    const [showForm, setShowForm] = useState(false)

    const isEditing = Boolean(editingId)

    const load = async () => {
        setLoading(true)
        try {
            const data = await api.categories.list()
            setCategories(data)
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
        setForm({ name: '', description: '' })
        setShowForm(false)
    }

    const startCreate = () => {
        setEditingId(null)
        setForm({ name: '', description: '' })
        setShowForm(true)
    }

    const startEdit = (category: Category) => {
        setEditingId(category.id)
        setForm({
            name: category.name ?? '',
            description: category.description ?? ''
        })
        setShowForm(true)
    }

    const submit = async () => {
        if (!form.name.trim()) {
            toast.error('El nombre es obligatorio')
            return
        }

        setSaving(true)
        try {
            const payload = {
                name: form.name.trim(),
                description: form.description.trim() || undefined
            }

            if (editingId) {
                await api.categories.update(editingId, payload)
                toast.success('Categoría actualizada')
            } else {
                await api.categories.create(payload)
                toast.success('Categoría creada')
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
            await api.categories.remove(id)
            toast.success('Categoría eliminada')
            if (editingId === id) resetForm()
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
                        Categorías
                    </h2>
                    <p className="text-[hsl(var(--muted))] text-lg">
                        Organiza tus productos en categorías para mejor gestión.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={load} disabled={loading} className="group">
                        <span className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}>
                            {loading ? '⚙️' : '🔄'}
                        </span>
                        <span>{loading ? 'Actualizando...' : 'Refrescar'}</span>
                    </Button>
                    <Button onClick={startCreate} className="shadow-lg hover:shadow-xl transition-all">
                        <span className="mr-2">➕</span>
                        Nueva Categoría
                    </Button>
                </div>
            </div>

            {/* Categories Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {categories.map((category, index) => (
                    <Card
                        key={category.id}
                        className="group hover:shadow-2xl transition-all duration-300 animate-fade-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <CardHeader className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform">
                                📁
                            </div>
                            <CardTitle className="text-xl" style={{ fontFamily: 'var(--font-display)' }}>
                                {category.name}
                            </CardTitle>
                            <CardDescription className="line-clamp-2">
                                {category.description || 'Sin descripción'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => startEdit(category)}
                                    className="flex-1"
                                >
                                    Editar
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => remove(category.id)}
                                    className="flex-1"
                                >
                                    Eliminar
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {categories.length === 0 && !loading && (
                    <div className="col-span-full text-center py-12">
                        <div className="text-6xl mb-4">📁</div>
                        <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-2">
                            No hay categorías
                        </h3>
                        <p className="text-[hsl(var(--muted))] mb-4">
                            Crea tu primera categoría para organizar tus productos
                        </p>
                        <Button onClick={startCreate}>
                            <span className="mr-2">➕</span>
                            Crear Categoría
                        </Button>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={resetForm} />
                    <Card className="w-full max-w-md relative z-10 animate-scale-in">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle style={{ fontFamily: 'var(--font-display)' }}>
                                    {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
                                </CardTitle>
                                <Button variant="ghost" onClick={resetForm} size="icon">✕</Button>
                            </div>
                            <CardDescription>
                                {isEditing ? 'Modifica los datos de la categoría' : 'Crea una nueva categoría para organizar tus productos'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Nombre de la Categoría</Label>
                                <Input
                                    value={form.name}
                                    onChange={(e) => setForm(s => ({ ...s, name: e.target.value }))}
                                    placeholder="Ej. Muebles, Electrónicos, Ropa..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Descripción (Opcional)</Label>
                                <Input
                                    value={form.description}
                                    onChange={(e) => setForm(s => ({ ...s, description: e.target.value }))}
                                    placeholder="Describe qué tipo de productos pertenecen a esta categoría..."
                                />
                            </div>
                            <div className="flex gap-2 pt-4">
                                <Button onClick={submit} className="flex-1" disabled={saving}>
                                    {saving ? '⚙️ Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Categoría'}
                                </Button>
                                <Button variant="outline" onClick={resetForm} disabled={saving}>
                                    Cancelar
                                </Button>
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
                title="¿Eliminar categoría?"
                description="Se eliminará la categoría. Los productos asociados no se eliminarán, pero perderán esta categorización."
                confirmText="Sí, eliminar"
                variant="destructive"
            />
        </div>
    )
}

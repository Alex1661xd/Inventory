'use client'

import { useState, useEffect, ReactNode } from 'react'
import { api } from '@/lib/backend'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Users, Trash2, Ban, ShieldCheck, Box, Store, StickyNote, ShoppingCart, UserX, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

type Tenant = {
    id: string;
    name: string;
    slug: string;
    createdAt: string;
    isBanned: boolean;
    stats: {
        users: number;
        products: number;
        warehouses: number;
        invoices: number;
        purchases: number;
        customers: number;
        suppliers: number;
    };
}

export default function TenantsPage() {
    const [tenants, setTenants] = useState<Tenant[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    const [deletingTenant, setDeletingTenant] = useState<string | null>(null)
    const [confirmPassword, setConfirmPassword] = useState('')
    const [confirmText, setConfirmText] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)

    const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active')

    useEffect(() => {
        loadTenants()
    }, [])

    const loadTenants = async () => {
        setLoading(true)
        try {
            const data = await api.superAdmin.tenants.list()
            setTenants(data)
        } catch {
            toast.error('Error al cargar negocios')
        } finally {
            setLoading(false)
        }
    }

    const handleBan = async (id: string, isBanned: boolean) => {
        try {
            if (isBanned) {
                await api.superAdmin.tenants.unban(id)
                toast.success('Negocio reactivado')
            } else {
                if (!confirm('Estas seguro de banear este negocio?')) return
                await api.superAdmin.tenants.ban(id)
                toast.warning('Negocio baneado')
            }
            loadTenants()
        } catch {
            toast.error('Error al cambiar estado del negocio')
        }
    }

    const handleDeleteClick = (id: string) => {
        setDeletingTenant(id)
        setConfirmPassword('')
        setConfirmText('')
    }

    const handleDeleteConfirm = async () => {
        if (!deletingTenant) return
        if (confirmText !== 'confirmar') {
            toast.error('Debes escribir "confirmar" para proceder')
            return
        }

        setIsDeleting(true)
        try {
            await api.superAdmin.tenants.deleteData(deletingTenant, {
                password: confirmPassword,
                confirmation: confirmText,
            })
            toast.success('Datos del negocio eliminados permanentemente')
            setDeletingTenant(null)
            loadTenants()
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Error al eliminar datos'
            toast.error(message)
        } finally {
            setIsDeleting(false)
        }
    }

    const filteredTenants = tenants.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.slug.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const activeTenants = filteredTenants.filter(t => !t.isBanned)
    const archivedTenants = filteredTenants.filter(t => t.isBanned)
    const list = activeTab === 'active' ? activeTenants : archivedTenants

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">Gestion de Negocios</h1>
                    <p className="text-slate-400 text-sm sm:text-base">Administra negocios registrados.</p>
                </div>

                <div className="w-full lg:w-auto">
                    <Input
                        placeholder="Buscar negocio..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-slate-900 border-slate-800 text-white w-full lg:w-[320px]"
                    />
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 p-1 bg-slate-900/50 border border-slate-800 rounded-xl w-full sm:w-fit">
                <Button
                    variant="ghost"
                    onClick={() => setActiveTab('active')}
                    className={`rounded-lg px-4 sm:px-6 w-full sm:w-auto ${activeTab === 'active' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'text-slate-400 hover:text-white'}`}
                >
                    Activos ({activeTenants.length})
                </Button>
                <Button
                    variant="ghost"
                    onClick={() => setActiveTab('archived')}
                    className={`rounded-lg px-4 sm:px-6 w-full sm:w-auto ${activeTab === 'archived' ? 'bg-red-600/20 text-red-500 hover:bg-red-600/30 border border-red-500/20' : 'text-slate-400 hover:text-white'}`}
                >
                    Baneados / Eliminados ({archivedTenants.length})
                </Button>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-20 text-slate-500 animate-pulse">Cargando negocios...</div>
                ) : list.length === 0 ? (
                    <div className="text-center py-20 text-slate-500 border border-dashed border-slate-800 rounded-3xl">
                        <UserX className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No hay negocios en esta categoria.</p>
                    </div>
                ) : (
                    list.map((tenant) => (
                        <Card
                            key={tenant.id}
                            className={`border-slate-800 transition-all hover:bg-slate-900/50 ${tenant.isBanned ? 'bg-red-950/10 border-red-900/30 opacity-80' : 'bg-slate-950 border-slate-800 shadow-xl'}`}
                        >
                            <CardContent className="p-4 sm:p-6">
                                <div className="space-y-4">
                                    <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                                <h3 className={`text-xl sm:text-2xl font-black tracking-tight break-words ${tenant.isBanned ? 'text-red-400/70' : 'text-white'}`}>
                                                    {tenant.name}
                                                </h3>
                                                {tenant.isBanned && (
                                                    <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20">BANEADO / ELIMINADO</Badge>
                                                )}
                                            </div>
                                            <p className="text-xs sm:text-sm text-slate-500 font-mono mt-1 break-all">ID: {tenant.id}</p>
                                            <p className="text-xs sm:text-sm text-slate-500 font-mono break-all">Slug: {tenant.slug}</p>
                                            <p className="text-xs text-slate-600 mt-2 font-medium">
                                                Registrado: {format(new Date(tenant.createdAt), 'PPP p', { locale: es })}
                                            </p>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto">
                                            <Button
                                                variant={tenant.isBanned ? 'outline' : 'destructive'}
                                                size="sm"
                                                className={tenant.isBanned ? 'border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/10 w-full sm:w-auto' : 'w-full sm:w-auto'}
                                                onClick={() => handleBan(tenant.id, tenant.isBanned)}
                                            >
                                                {tenant.isBanned ? <ShieldCheck className="w-4 h-4 mr-2" /> : <Ban className="w-4 h-4 mr-2" />}
                                                {tenant.isBanned ? 'Reactivar' : 'Banear'}
                                            </Button>

                                            {!tenant.name.includes('[ELIMINADO]') && (
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 w-full sm:w-auto"
                                                    onClick={() => handleDeleteClick(tenant.id)}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Eliminar Todo
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 pt-4 border-t ${tenant.isBanned ? 'border-red-900/20' : 'border-slate-800/50'}`}>
                                        <StatItem icon={<Users className="w-3 h-3 text-blue-400" />} label="Usuarios" value={tenant.stats.users} />
                                        <StatItem icon={<Box className="w-3 h-3 text-emerald-400" />} label="Productos" value={tenant.stats.products} />
                                        <StatItem icon={<Store className="w-3 h-3 text-amber-400" />} label="Almacenes" value={tenant.stats.warehouses} />
                                        <StatItem icon={<ShoppingCart className="w-3 h-3 text-purple-400" />} label="Ventas" value={tenant.stats.invoices} />
                                        <StatItem icon={<StickyNote className="w-3 h-3 text-rose-400" />} label="Compras" value={tenant.stats.purchases} />
                                        <StatItem icon={<Users className="w-3 h-3 text-cyan-400" />} label="Clientes" value={tenant.stats.customers} />
                                        <StatItem icon={<Users className="w-3 h-3 text-indigo-400" />} label="Proveedores" value={tenant.stats.suppliers} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <Dialog open={!!deletingTenant} onOpenChange={(open) => !open && setDeletingTenant(null)}>
                <DialogContent className="bg-slate-950 border-red-900 text-white w-[95vw] max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-500">
                            <AlertTriangle className="w-6 h-6" />
                            Zona de Peligro: Eliminacion Total
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Esta accion eliminara permanentemente toda la informacion del negocio.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Escribe &quot;confirmar&quot; para continuar</Label>
                            <Input
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                className="bg-slate-900 border-slate-800"
                                placeholder="confirmar"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Tu contrasena de Super Admin</Label>
                            <Input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="bg-slate-900 border-slate-800"
                                placeholder="********"
                            />
                        </div>
                    </div>

                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button variant="ghost" onClick={() => setDeletingTenant(null)} className="w-full sm:w-auto">Cancelar</Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteConfirm}
                            disabled={confirmText !== 'confirmar' || !confirmPassword || isDeleting}
                            className="w-full sm:w-auto"
                        >
                            {isDeleting ? 'Eliminando...' : 'Eliminar Permanentemente'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function StatItem({ icon, label, value }: { icon: ReactNode, label: string, value: number }) {
    return (
        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 flex flex-col items-center justify-center text-center gap-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
                {icon} {label}
            </div>
            <span className="text-xl font-black text-white">{value}</span>
        </div>
    )
}

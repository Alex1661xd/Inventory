'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { api, type Warehouse } from '@/lib/backend'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function SellerWarehousePage() {
    const [user, setUser] = useState<any>(null)
    const [warehouses, setWarehouses] = useState<Warehouse[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [selectedWarehouseId, setSelectedWarehouseId] = useState('')

    const loadData = async () => {
        setLoading(true)
        try {
            const [me, ws] = await Promise.all([
                api.auth.me(),
                api.warehouses.list()
            ])
            setUser(me)
            setWarehouses(ws)
            setSelectedWarehouseId(me.warehouseId || '')
        } catch (e: any) {
            toast.error('Error al cargar datos: ' + e.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const handleUpdate = async () => {
        if (!selectedWarehouseId) {
            toast.error('Por favor selecciona una sede')
            return
        }

        setSaving(true)
        try {
            await api.sellers.update(user.id, { warehouseId: selectedWarehouseId })
            toast.success('Sede actualizada correctamente')
            await loadData()
        } catch (e: any) {
            toast.error('Error al actualizar sede: ' + e.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin text-4xl">⚙️</div>
            </div>
        )
    }

    const currentWarehouse = warehouses.find(w => w.id === user?.warehouseId)

    return (
        <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]" style={{ fontFamily: 'var(--font-display)' }}>
                    Mi Sede
                </h1>
                <p className="text-[hsl(var(--muted))] text-sm">
                    Gestiona la ubicación desde la que estás operando actualmente.
                </p>
            </div>

            <Card className="border border-[rgb(230,225,220)] shadow-sm overflow-hidden">
                <CardHeader className="bg-[hsl(var(--background))] border-b border-[rgb(230,225,220)] py-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <span className="text-xl">📍</span>
                        <span>Sede Actual</span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Esta es la ubicación que se asignará a tus ventas y traslados.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-[rgb(25,35,25)] text-white shadow-lg relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50"></div>
                        <div className="text-2xl bg-white/20 backdrop-blur-md w-12 h-12 rounded-full flex items-center justify-center shadow-inner relative z-10 shrink-0">🏢</div>
                        <div className="relative z-10 min-w-0">
                            <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-0.5">Operando en:</div>
                            <div className="text-lg font-bold leading-tight truncate">
                                {currentWarehouse?.name || 'Vendedor sin sede asignada'}
                            </div>
                            <div className="text-xs text-white/60 mt-0.5 truncate">
                                {currentWarehouse?.address || 'Dirección no registrada'}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-[11px] font-bold text-[rgb(120,115,110)] uppercase tracking-wider">Cambiar a otra sede:</Label>
                        <div className="grid gap-3">
                            <select
                                className="flex h-11 w-full rounded-lg border border-[rgb(230,225,220)] bg-white px-3 py-2 text-sm font-medium text-[rgb(25,35,25)] transition-all focus:outline-none focus:border-[rgb(25,35,25)]"
                                value={selectedWarehouseId}
                                onChange={(e) => setSelectedWarehouseId(e.target.value)}
                            >
                                {warehouses.map((w) => (
                                    <option key={w.id} value={w.id}>
                                        {w.name} {w.isDefault ? '(Principal)' : ''}
                                    </option>
                                ))}
                            </select>

                            <Button
                                onClick={handleUpdate}
                                disabled={saving || selectedWarehouseId === user?.warehouseId}
                                className="h-11 text-sm font-bold shadow-md hover:shadow-lg transition-all"
                            >
                                {saving ? (
                                    <span className="flex items-center gap-2">
                                        <span className="animate-spin text-xs">⚙️</span> Actualizando...
                                    </span>
                                ) : (
                                    'Actualizar mi Ubicación'
                                )}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex gap-3">
                <div className="text-xl shrink-0">⚠️</div>
                <div className="text-xs text-amber-900/80 leading-relaxed">
                    <strong>Nota:</strong> Cambiar tu sede afectará directamente al stock de los productos que selecciones en el Punto de Venta (POS)
                </div>
            </div>
        </div>
    )
}

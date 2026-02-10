import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatThousands } from "@/lib/utils"
import { TrendingUp, Package, DollarSign, Activity, Calendar, Search } from "lucide-react"
import { useState, useEffect } from "react"
import { api } from "@/lib/backend"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface ProductStatsModalProps {
    isOpen: boolean
    onClose: () => void
    product: {
        id: string
        name: string
        sku?: string | null
        costPrice?: string | number | null
        salePrice?: string | number | null
        totalStock?: number
    } | null
    stats?: {
        totalSold: number
        totalRevenue: number
        totalProfit: number
        margin: number
    }
}

export function ProductStatsModal({ isOpen, onClose, product, stats: initialStats }: ProductStatsModalProps) {
    const [stats, setStats] = useState(initialStats)
    const [loading, setLoading] = useState(false)
    const [dates, setDates] = useState({
        from: '',
        to: ''
    })

    useEffect(() => {
        if (isOpen) {
            setStats(initialStats)
            setDates({ from: '', to: '' })
        }
    }, [isOpen, initialStats])

    if (!product) return null

    const fetchFilteredStats = async () => {
        setLoading(true)
        try {
            const data = await api.analytics.getProductStats(product.id, dates.from, dates.to)
            setStats(data)
        } catch (e) {
            toast.error("Error al filtrar estadísticas")
        } finally {
            setLoading(false)
        }
    }

    const costPrice = Number(product.costPrice) || 0
    const salePrice = Number(product.salePrice) || 0
    // Calculate theoretical margin if no real data is passed
    const theoreticalMargin = salePrice > 0 ? ((salePrice - costPrice) / salePrice) * 100 : 0
    const potentialProfit = (salePrice - costPrice) * (product.totalStock || 0)

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-4 border-b">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <DialogTitle className="text-2xl font-black flex items-center gap-2 text-slate-900">
                                <Activity className="w-6 h-6 text-blue-600" />
                                Inteligencia de Producto
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 font-medium mt-1">
                                {product.name} <span className="mx-2 text-slate-300">|</span> SKU: <span className="font-mono text-slate-700">{product.sku || 'N/A'}</span>
                            </DialogDescription>
                        </div>

                        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl shadow-sm border border-slate-200">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                <input
                                    type="date"
                                    className="text-xs font-bold bg-transparent outline-none text-slate-700"
                                    value={dates.from}
                                    onChange={(e) => setDates(prev => ({ ...prev, from: e.target.value }))}
                                />
                                <span className="text-slate-300 text-xs font-black">→</span>
                                <input
                                    type="date"
                                    className="text-xs font-bold bg-transparent outline-none text-slate-700"
                                    value={dates.to}
                                    onChange={(e) => setDates(prev => ({ ...prev, to: e.target.value }))}
                                />
                            </div>
                            <Button
                                size="sm"
                                variant="default"
                                className="rounded-xl h-9 px-4 font-bold shadow-md"
                                onClick={fetchFilteredStats}
                                disabled={loading}
                            >
                                {loading ? <Activity className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                                {loading ? '' : 'Filtrar'}
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                <div className={`transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
                        <Card className="border-none bg-slate-50 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest">Unidades Vendidas</CardTitle>
                                <TrendingUp className="h-4 w-4 text-slate-300" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black text-slate-900 tabular-nums">{stats?.totalSold || 0}</div>
                                <p className="text-[10px] text-slate-400 font-bold mt-1">Despachos registrados</p>
                            </CardContent>
                        </Card>
                        <Card className="border-none bg-emerald-50/50 shadow-sm border border-emerald-100/30">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs font-black text-emerald-600/60 uppercase tracking-widest">Ingresos totales</CardTitle>
                                <DollarSign className="h-4 w-4 text-emerald-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black text-emerald-700 tabular-nums">
                                    ${formatThousands(stats?.totalRevenue || 0)}
                                </div>
                                <p className="text-[10px] text-emerald-600/50 font-bold mt-1">Ventas brutas</p>
                            </CardContent>
                        </Card>
                        <Card className="border-none bg-blue-50/50 shadow-sm border border-blue-100/30">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs font-black text-blue-600/60 uppercase tracking-widest">Utilidad Historica</CardTitle>
                                <TrendingUp className="h-4 w-4 text-blue-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black text-blue-700 tabular-nums">
                                    ${formatThousands(stats?.totalProfit || 0)}
                                </div>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <span className="px-1.5 py-0.5 rounded bg-blue-100 text-[10px] font-black text-blue-700">MARGEN: {stats?.margin?.toFixed(1) || 0}%</span>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-none bg-orange-50/50 shadow-sm border border-orange-100/30">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs font-black text-orange-600/60 uppercase tracking-widest">Stock Disponible</CardTitle>
                                <Package className="h-4 w-4 text-orange-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black text-orange-700 tabular-nums">
                                    {product.totalStock || 0}
                                </div>
                                <p className="text-[10px] text-orange-600/50 font-bold mt-1">Existencia en almacenes</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="mt-8 space-y-8">
                        <div>
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-6">
                                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Radiografía de Precios</h3>
                                <div className="h-1 flex-1 mx-6 bg-slate-50 rounded-full"></div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-3">
                                <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Costo Unitario</div>
                                    <div className="text-3xl font-black text-slate-900 tabular-nums">${formatThousands(costPrice)}</div>
                                    <div className="h-1.5 w-12 bg-slate-100 rounded-full mt-4"></div>
                                </div>

                                <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Precio Venta</div>
                                    <div className="text-3xl font-black text-slate-900 tabular-nums">${formatThousands(salePrice)}</div>
                                    <div className="h-1.5 w-12 bg-slate-100 rounded-full mt-4"></div>
                                </div>

                                <div className="p-6 bg-indigo-600 rounded-3xl shadow-xl relative overflow-hidden group">
                                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full rotate-12 blur-2xl group-hover:scale-125 transition-transform"></div>
                                    <div className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] mb-3">Margen Teórico</div>
                                    <div className="text-3xl font-black text-white tabular-nums">{theoreticalMargin.toFixed(1)}%</div>
                                    <div className="text-[10px] text-indigo-200/60 font-medium mt-4">Rendimiento esperado por unidad</div>
                                </div>
                            </div>
                        </div>

                        <div className="relative p-8 rounded-[2.5rem] bg-slate-950 text-white overflow-hidden shadow-2xl border border-slate-800">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-[100px]"></div>
                            <div className="relative flex flex-col md:flex-row items-center justify-between gap-10">
                                <div className="max-w-md text-center md:text-left">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                                        KPI de Liquidación
                                    </div>
                                    <h4 className="text-4xl font-black leading-[0.9] tracking-tighter mb-4">Capital de Utilidad <br />Proyectado</h4>
                                    <p className="text-slate-500 text-sm font-medium leading-relaxed">Si logras vender tu stock actual (${formatThousands((product.totalStock || 0) * salePrice)}) tendrías esta utilidad neta:</p>
                                </div>
                                <div className="flex flex-col items-center md:items-end">
                                    <div className="text-6xl md:text-7xl font-black text-emerald-400 tabular-nums tracking-tighter">
                                        ${formatThousands(potentialProfit)}
                                    </div>
                                    <div className="h-1 w-20 bg-emerald-500/30 rounded-full mt-4"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

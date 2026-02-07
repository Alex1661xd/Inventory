"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { api, AnalyticsDashboard } from "@/lib/backend"
import { formatThousands } from "@/lib/utils"
import { subDays, format } from "date-fns"
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, PieChart, Pie, Legend, AreaChart, Area
} from 'recharts'
import { TrendingUp, Users, Package, Home, DollarSign, Calendar, ArrowUpRight, ArrowDownRight, AlertTriangle, Zap, MinusCircle } from "lucide-react"
import { toast } from "sonner"

export default function ReportsPage() {
    const [data, setData] = useState<AnalyticsDashboard | null>(null)
    const [loading, setLoading] = useState(true)
    const [fromDate, setFromDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'))
    const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'))

    useEffect(() => {
        loadData()
    }, [fromDate, toDate])

    const loadData = async () => {
        setLoading(true)
        try {
            const res = await api.analytics.dashboard(fromDate, toDate)
            setData(res)
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="flex items-center justify-center h-[50vh] text-[hsl(var(--muted))] font-medium">Cargando inteligencia de negocio...</div>

    if (!data) return null

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-[hsl(var(--foreground))]">Reportes y BI</h1>
                    <p className="text-[hsl(var(--muted))] font-medium">Análisis detallado de rendimiento comercial</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 bg-[hsl(var(--surface-elevated))] p-3 rounded-2xl border border-[hsl(var(--border))] shadow-sm">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[hsl(var(--primary))]" />
                        <span className="text-[10px] font-black uppercase text-[hsl(var(--muted))] opacity-70">Rango:</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg px-2 py-1 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.5)]"
                        />
                        <span className="text-xs font-black opacity-30">a</span>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg px-2 py-1 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.5)]"
                        />
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-[hsl(var(--surface-elevated))] border-none shadow-sm overflow-hidden group">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:scale-110 transition-transform">
                                <TrendingUp className="w-5 h-5 text-emerald-600" />
                            </div>
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">+12.5%</span>
                        </div>
                        <div className="text-[10px] font-black text-[hsl(var(--muted))] uppercase tracking-widest opacity-70">Ingresos Totales</div>
                        <div className="text-2xl font-black text-[hsl(var(--foreground))] mt-1">
                            ${formatThousands(data.summary.totalRevenue)}
                        </div>
                        <p className="text-[9px] font-medium text-[hsl(var(--muted))] mt-2 opacity-60">Suma total de facturas pagas</p>
                    </CardContent>
                </Card>

                <Card className="bg-[hsl(var(--surface-elevated))] border-none shadow-sm overflow-hidden group">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-blue-500/10 rounded-lg group-hover:scale-110 transition-transform">
                                <DollarSign className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                        <div className="text-[10px] font-black text-[hsl(var(--muted))] uppercase tracking-widest opacity-70">Utilidad Bruta</div>
                        <div className="text-2xl font-black text-blue-600 mt-1">
                            ${formatThousands(data.summary.totalProfit)}
                        </div>
                        <p className="text-[9px] font-medium text-[hsl(var(--muted))] mt-2 opacity-60">Ventas menos costo de mercancía</p>
                    </CardContent>
                </Card>

                <Card className="bg-[hsl(var(--surface-elevated))] border-none shadow-sm overflow-hidden group">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-amber-500/10 rounded-lg group-hover:scale-110 transition-transform">
                                <Package className="w-5 h-5 text-amber-600" />
                            </div>
                        </div>
                        <div className="text-[10px] font-black text-[hsl(var(--muted))] uppercase tracking-widest opacity-70">Ventas Realizadas</div>
                        <div className="text-2xl font-black text-[hsl(var(--foreground))] mt-1">
                            {formatThousands(data.summary.salesCount)}
                        </div>
                        <p className="text-[9px] font-medium text-[hsl(var(--muted))] mt-2 opacity-60">Cantidad total de transacciones</p>
                    </CardContent>
                </Card>

                <Card className="bg-[hsl(var(--primary))] text-white border-none shadow-md overflow-hidden group">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-white/20 rounded-lg group-hover:scale-110 transition-transform">
                                <DollarSign className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <div className="text-[10px] font-black opacity-80 uppercase tracking-widest text-white/90">Utilidad Neta Real</div>
                        <div className="text-2xl font-black mt-1">
                            ${formatThousands(Math.round(data.summary.netProfit))}
                        </div>
                        <p className="text-[9px] font-medium opacity-70 mt-2">Ganancia libre tras todos los gastos</p>
                    </CardContent>
                </Card>
            </div>

            {/* Expenses Summary if needed, or just more detail */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 bg-red-500/5 border border-red-500/10 rounded-2xl">
                    <div className="p-2 bg-red-500/10 rounded-lg">
                        <ArrowDownRight className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-[hsl(var(--muted))] uppercase">Gastos de Operación</div>
                        <div className="text-sm font-black text-red-600">-${formatThousands(data.summary.totalExpenses)}</div>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-[hsl(var(--muted))] uppercase">Utilidad Bruta</div>
                        <div className="text-sm font-black text-emerald-600">${formatThousands(data.summary.totalProfit)}</div>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-[hsl(var(--muted))] uppercase">Venta Promedio</div>
                        <div className="text-sm font-black text-blue-600">${formatThousands(Math.round(data.summary.averageTicket))}</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Sales Chart */}
                <Card className="lg:col-span-2 bg-[hsl(var(--surface-elevated))] border-none shadow-sm overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-[hsl(var(--primary))]" />
                            Tendencia de Ventas vs Utilidad
                        </CardTitle>
                        <CardDescription className="text-xs font-medium">Comparativa de ingresos y ganancias diarias</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px] p-6 pt-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.salesOverTime} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 700, fill: 'hsl(var(--muted))' }}
                                    tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                    minTickGap={30}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 700, fill: 'hsl(var(--muted))' }}
                                    tickFormatter={(val) => `$${val > 999 ? (val / 1000).toFixed(0) + 'k' : val}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--surface-elevated))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        fontSize: '12px',
                                        fontWeight: '700'
                                    }}
                                    itemStyle={{ padding: '2px 0' }}
                                    formatter={(value: any) => [`$${formatThousands(value)}`, undefined]}
                                    labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                />
                                <Legend
                                    verticalAlign="top"
                                    height={36}
                                    iconType="circle"
                                    wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    name="Ventas Totales"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorTotal)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="profit"
                                    name="Utilidad Bruta"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorProfit)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Top Products */}
                <Card className="bg-[hsl(var(--surface-elevated))] border-none shadow-sm overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
                            <Package className="w-5 h-5 text-amber-500" />
                            Top 5 Productos
                        </CardTitle>
                        <CardDescription className="text-xs font-medium">Por mayor generación de ingresos</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 pt-0 space-y-4">
                        {data.topProducts.map((p, i) => (
                            <div key={i} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-[hsl(var(--background))] flex items-center justify-center text-xs font-black shadow-inner">
                                        #{i + 1}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-[hsl(var(--foreground))] line-clamp-1">{p.name}</span>
                                        <span className="text-[10px] font-medium text-[hsl(var(--muted))]">{p.quantity} unidades vendidas</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-black text-emerald-600">${formatThousands(Math.round(p.revenue))}</div>
                                    <div className="text-[9px] font-bold text-amber-500">Rent: ${formatThousands(Math.round(p.profit))}</div>
                                </div>
                            </div>
                        ))}
                        {data.topProducts.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full py-10 opacity-50">
                                <Package className="w-10 h-10 mb-2" />
                                <p className="text-xs font-bold uppercase tracking-widest">Sin datos de venta</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Sellers */}
                <Card className="bg-[hsl(var(--surface-elevated))] border-none shadow-sm overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-500" />
                            Desempeño de Vendedores
                        </CardTitle>
                        <CardDescription className="text-xs font-medium">Volumen de ventas por cada miembro del equipo</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] p-6 pt-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.topSellers} layout="vertical" margin={{ left: 40, right: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.5} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 700, fill: 'hsl(var(--foreground))' }}
                                    width={80}
                                />
                                <Tooltip
                                    cursor={{ fill: 'hsl(var(--background)/0.5)' }}
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--surface-elevated))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        fontWeight: '700'
                                    }}
                                    formatter={(value: any) => [`$${formatThousands(value)}`, 'Total Ventas']}
                                />
                                <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                                    {data.topSellers.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? 'hsl(var(--primary))' : 'hsl(var(--primary)/0.6)'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Efficiency by Warehouse */}
                <Card className="bg-[hsl(var(--surface-elevated))] border-none shadow-sm overflow-hidden text-center">
                    <CardHeader className="text-left">
                        <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
                            <Home className="w-5 h-5 text-emerald-500" />
                            Distribución de Ventas
                        </CardTitle>
                        <CardDescription className="text-xs font-medium">Comparativa de ingresos por punto de venta</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] p-6 pt-0">
                        {data?.warehouseStats && data.warehouseStats.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.warehouseStats}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="total"
                                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                    >
                                        {data.warehouseStats.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={[
                                                'hsl(var(--primary))',
                                                '#10b981',
                                                '#3b82f6',
                                                '#f59e0b',
                                                '#ef4444'
                                            ][index % 5]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--surface-elevated))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: '700'
                                        }}
                                        formatter={(value: any) => [`$${formatThousands(value)}`, 'Ventas']}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
                                <Home className="w-10 h-10 mb-2" />
                                <p className="text-xs font-black uppercase tracking-tighter">
                                    No hay datos de almacenes registrados
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
                {/* Sales by Category */}
                <Card className="bg-[hsl(var(--surface-elevated))] border-none shadow-sm overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
                            <Package className="w-5 h-5 text-purple-500" />
                            Ventas por Categoría
                        </CardTitle>
                        <CardDescription className="text-xs font-medium">Ranking de las líneas de producto más vendidas</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] p-6 pt-0">
                        {data?.categoryStats && data.categoryStats.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.categoryStats} layout="vertical" margin={{ left: 40, right: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.5} />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: 700, fill: 'hsl(var(--foreground))' }}
                                        width={100}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'hsl(var(--background)/0.5)' }}
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--surface-elevated))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: '700'
                                        }}
                                        formatter={(value: any) => [`$${formatThousands(value)}`, 'Ingresos']}
                                    />
                                    <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                                        {data.categoryStats.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={`hsl(var(--primary) / ${1 - (index * 0.15)})`} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full opacity-50">
                                <p className="text-xs font-black uppercase tracking-tighter">Sin datos de categorías</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Sales by Payment Method */}
                <Card className="bg-[hsl(var(--surface-elevated))] border-none shadow-sm overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-amber-500" />
                            Métodos de Pago
                        </CardTitle>
                        <CardDescription className="text-xs font-medium">Preferencia de pago de tus clientes</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] p-6 pt-0">
                        {data?.paymentMethodStats && data.paymentMethodStats.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.paymentMethodStats}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        dataKey="total"
                                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                    >
                                        {data.paymentMethodStats.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={[
                                                '#4f46e5',
                                                '#10b981',
                                                '#f59e0b',
                                                '#ef4444',
                                                '#8b5cf6'
                                            ][index % 5]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--surface-elevated))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: '700'
                                        }}
                                        formatter={(value: any) => [`$${formatThousands(value)}`, 'Total']}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full opacity-50">
                                <p className="text-xs font-black uppercase tracking-tighter">Sin datos de pagos</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Dead Stock - Productos Hueso */}
            <div className="pb-12">
                <Card className="bg-[hsl(var(--surface-elevated))] border-none shadow-sm overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-[hsl(var(--border)/0.5)] py-4">
                        <div>
                            <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                                Productos "Hueso" (Sin movimiento)
                            </CardTitle>
                            <CardDescription className="text-xs font-medium">Basado en stock sin ventas en el rango seleccionado</CardDescription>
                        </div>
                        <div className="bg-red-500/10 text-red-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
                            Atención Urgente
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-[hsl(var(--border)/0.5)] bg-[hsl(var(--background)/0.3)]">
                                        <th className="px-6 py-3 font-black text-[10px] uppercase text-[hsl(var(--muted))]">Producto</th>
                                        <th className="px-6 py-3 font-black text-[10px] uppercase text-[hsl(var(--muted))] text-center">Stock</th>
                                        <th className="px-6 py-3 font-black text-[10px] uppercase text-[hsl(var(--muted))] text-right">Capital Estancado</th>
                                        <th className="px-6 py-3 font-black text-[10px] uppercase text-[hsl(var(--muted))] text-center">Acción Sugerida</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[hsl(var(--border)/0.3)]">
                                    {data.deadStock.map((p) => (
                                        <tr key={p.id} className="hover:bg-[hsl(var(--background)/0.5)] transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-[hsl(var(--foreground))]">{p.name}</div>
                                                <div className="text-[10px] font-medium text-[hsl(var(--muted))]">SKU: {p.sku || "N/A"}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="font-black text-red-600 bg-red-500/5 px-2 py-1 rounded-lg border border-red-500/10">
                                                    {p.stock} un.
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-[hsl(var(--foreground))]">
                                                ${formatThousands(Math.round(p.value))}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2 text-xs font-black text-[hsl(var(--primary))] group-hover:scale-105 transition-transform">
                                                    <Zap className="w-3 h-3" />
                                                    PROMO / LIQUIDACIÓN
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {data.deadStock.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-[hsl(var(--muted))] font-bold italic opacity-50">
                                                ✨ No tienes productos con stock estancado. ¡Excelente rotación!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

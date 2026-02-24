'use client'

import { useEffect, useState } from 'react'
import {
    LayoutDashboard,
    BarChart3,
    Banknote,
    Receipt,
    ShoppingBag,
    Boxes,
    Building2,
    ClipboardList,
    Truck,
    Users,
    Archive,
    Tags,
    Package,
    TrendingUp,
    DollarSign,
    LogOut,
} from 'lucide-react'

// ─── Paleta exacta de la app ──────────────────────────────────────────────────
const C = {
    primary: 'hsl(215,25%,27%)',
    primaryLight: 'hsl(215,25%,40%)',
    fg: 'hsl(215,25%,12%)',
    muted: 'hsl(215,15%,65%)',
    surface: '#ffffff',
    surfaceEl: 'hsl(210,20%,96%)',
    bg: 'hsl(210,20%,98%)',
    border: 'hsl(215,20%,88%)',
    sidebar: 'hsl(215,25%,12%)',
    white10: 'rgba(255,255,255,0.10)',
    white20: 'rgba(255,255,255,0.20)',
    white40: 'rgba(255,255,255,0.40)',
    white70: 'rgba(255,255,255,0.70)',
}

// ─── Datos ficticios ──────────────────────────────────────────────────────────
const NAV = [
    { label: 'Inicio', icon: LayoutDashboard, section: 'PRINCIPAL', active: false },
    { label: 'Reportes y BI', icon: BarChart3, section: 'PRINCIPAL', active: false },
    { label: 'Arqueos de Caja', icon: Banknote, section: 'FINANZAS', active: false },
    { label: 'Gastos y Utilidad', icon: Receipt, section: 'FINANZAS', active: false },
    { label: 'Productos', icon: ShoppingBag, section: 'OPERACIONES', active: false },
    { label: 'Inventario', icon: Boxes, section: 'OPERACIONES', active: true },
    { label: 'Almacenes', icon: Building2, section: 'OPERACIONES', active: false },
    { label: 'Compras', icon: ClipboardList, section: 'OPERACIONES', active: false },
    { label: 'Traslados', icon: Truck, section: 'OPERACIONES', active: false },
    { label: 'Vendedores', icon: Users, section: 'GESTION', active: false },
    { label: 'Proveedores', icon: Archive, section: 'GESTION', active: false },
    { label: 'Clientes', icon: Users, section: 'GESTION', active: false },
    { label: 'Categorías', icon: Tags, section: 'GESTION', active: false },
]

const NAV_SECTIONS = ['PRINCIPAL', 'FINANZAS', 'OPERACIONES', 'GESTION'] as const

const STATS = [
    { label: 'Ingresos Totales', value: '$48,320,000', badge: '+12.5%', icon: TrendingUp, color: '#10b981', bg: 'rgba(16,185,129,0.08)', sub: 'Suma total de facturas pagas' },
    { label: 'Utilidad Bruta', value: '$18,940,000', badge: null, icon: DollarSign, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', sub: 'Ventas menos costo de mercancía' },
    { label: 'Ventas Realizadas', value: '134', badge: null, icon: Package, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', sub: 'Cantidad total de transacciones' },
    { label: 'Utilidad Neta Real', value: '$14,210,000', badge: null, icon: DollarSign, color: '#ffffff', bg: C.primary, sub: 'Ganancia libre tras todos los gastos', dark: true },
]

const STOCK_ROWS = [
    { name: 'Sofá Milán 3 Puestos', sku: 'SOF-MIL-3P', wh: 'Bodega Principal', qty: 24, status: 'Alto', statusColor: 'emerald' },
    { name: 'Mesa Oslo Extensible', sku: 'MES-OSL-EXT', wh: 'Bodega Principal', qty: 8, status: 'Medio', statusColor: 'amber' },
    { name: 'Silla Lisboa Tapizada', sku: 'SIL-LIS-TAP', wh: 'Tienda Centro', qty: 15, status: 'Alto', statusColor: 'emerald' },
    { name: 'Armario Praga 3P', sku: 'ARM-PRA-3P', wh: 'Bodega Principal', qty: 3, status: 'Medio', statusColor: 'amber' },
    { name: 'Cama Tokio Queen', sku: 'CAM-TOK-Q', wh: 'Tienda Centro', qty: 0, status: 'Sin Stock', statusColor: 'red' },
]

// ─── SVG Area Chart (fake) ────────────────────────────────────────────────────
function FakeAreaChart({ animated }: { animated: boolean }) {
    // Two paths: ventas (primary) and utilidad (green)
    const W = 340; const H = 100
    const pts1 = [0, 58, 28, 52, 56, 62, 84, 38, 112, 44, 140, 28, 168, 35, 196, 20, 224, 30, 252, 18, 280, 24, 308, 14, 336, 8]
    const pts2 = [0, 72, 28, 68, 56, 74, 84, 58, 112, 62, 140, 50, 168, 55, 196, 42, 224, 50, 252, 40, 280, 44, 308, 36, 336, 30]

    const toD = (pts: number[]) => {
        let d = `M ${pts[0]} ${pts[1]}`
        for (let i = 2; i < pts.length; i += 2) d += ` L ${pts[i]} ${pts[i + 1]}`
        return d
    }
    const toFill = (pts: number[]) => toD(pts) + ` L ${pts[pts.length - 2]} ${H} L 0 ${H} Z`

    return (
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '100%', display: 'block' }}>
            <defs>
                <linearGradient id="gPrimary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.primary} stopOpacity="0.15" />
                    <stop offset="100%" stopColor={C.primary} stopOpacity="0" />
                </linearGradient>
                <linearGradient id="gGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
                <clipPath id="reveal">
                    <rect x="0" y="0" width={animated ? W : 0} height={H} style={{ transition: 'width 1.4s cubic-bezier(.4,0,.2,1)' }} />
                </clipPath>
            </defs>
            <g clipPath="url(#reveal)">
                <path d={toFill(pts1)} fill="url(#gPrimary)" />
                <path d={toFill(pts2)} fill="url(#gGreen)" />
                <path d={toD(pts1)} fill="none" stroke={C.primary} strokeWidth="2.5" strokeLinejoin="round" />
                <path d={toD(pts2)} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinejoin="round" />
            </g>
            {/* Y-axis labels */}
            {['$48M', '$36M', '$24M', '$12M', '$0'].map((t, i) => (
                <text key={i} x={-4} y={4 + i * 24} textAnchor="end" fontSize="7" fontWeight="700" fill={C.muted}>{t}</text>
            ))}
            {/* Legend dots */}
            <circle cx={20} cy={H + 14} r={4} fill={C.primary} />
            <text x={28} y={H + 17} fontSize="8" fontWeight="700" fill={C.fg}>Ventas</text>
            <circle cx={80} cy={H + 14} r={4} fill="#10b981" />
            <text x={88} y={H + 17} fontSize="8" fontWeight="700" fill={C.fg}>Utilidad</text>
        </svg>
    )
}

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, { bg: string; text: string; border: string }> = {
    emerald: { bg: 'rgba(16,185,129,0.06)', text: '#059669', border: 'rgba(16,185,129,0.2)' },
    amber: { bg: 'rgba(245,158,11,0.06)', text: '#d97706', border: 'rgba(245,158,11,0.2)' },
    red: { bg: 'rgba(239,68,68,0.06)', text: '#dc2626', border: 'rgba(239,68,68,0.2)' },
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function DashboardMockup() {
    const [animated, setAnimated] = useState(false)
    const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory'>('dashboard')

    useEffect(() => {
        const t = setTimeout(() => setAnimated(true), 200)
        return () => clearTimeout(t)
    }, [])

    return (
        <>
            <style>{`
        @keyframes mfadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes mblink  { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .mock-bar {
          display:flex; align-items:center; gap:3px;
          background:hsl(215,25%,22%); padding:8px 14px; flex-shrink:0;
        }
        .mock-dot { width:9px; height:9px; border-radius:50%; }
        .mock-url {
          flex:1; background:rgba(255,255,255,0.07); border-radius:5px;
          padding:3px 10px; font-size:9px; color:rgba(255,255,255,0.35);
          font-family:'Inter',sans-serif; letter-spacing:0.02em;
        }
        .m-nav-section {
          display:flex; align-items:center; gap:6px; padding:0 12px; margin-bottom:6px; margin-top:4px;
        }
        .m-nav-line { height:1px; flex:1; background:rgba(255,255,255,0.1); }
        .m-nav-title {
          font-size:7px; font-weight:900; color:rgba(255,255,255,0.35);
          letter-spacing:0.18em; text-transform:uppercase; white-space:nowrap;
          font-family:'Inter',sans-serif;
        }
        .m-nav-link {
          display:flex; align-items:center; gap:8px; padding:5px 10px;
          border-radius:8px; font-size:9px; font-weight:600;
          font-family:'Inter',sans-serif; transition:all 0.15s;
          color:rgba(255,255,255,0.65); cursor:pointer;
        }
        .m-nav-link.active { background:rgba(255,255,255,0.18); color:#fff; }
        .mcard {
          border-radius:12px; padding:14px; animation:mfadeUp 0.5s ease both;
        }
        .stat-badge {
          font-size:9px; font-weight:900; padding:2px 6px; border-radius:99px;
          background:rgba(16,185,129,0.12); color:#10b981;
          font-family:'Inter',sans-serif; letter-spacing:0.05em;
        }
        .inv-th {
          padding:6px 10px; text-align:left; font-size:8px; font-weight:900;
          color:hsl(215,15%,65%); text-transform:uppercase; letter-spacing:0.12em;
          font-family:'Inter',sans-serif; background:hsl(210,20%,98%);
          border-bottom:1px solid hsl(215,20%,88%);
        }
        .inv-td { padding:6px 10px; font-family:'Inter',sans-serif; }
        .inv-tr:hover td { background:hsl(210,20%,97%); }
        .tab-btn {
          font-size:9px; font-weight:900; padding:4px 10px; border-radius:6px;
          font-family:'Inter',sans-serif; cursor:pointer; border:none;
          letter-spacing:0.06em; text-transform:uppercase; transition:all 0.15s;
        }
        .tab-btn.active { background:hsl(215,25%,27%); color:#fff; }
        .tab-btn.inactive { background:transparent; color:hsl(215,15%,65%); }
      `}</style>

            <div style={{ fontFamily: "'Inter',sans-serif", background: C.bg, borderRadius: 16, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>

                {/* Browser chrome */}
                <div className="mock-bar">
                    <div className="mock-dot" style={{ background: '#ff5f57' }} />
                    <div className="mock-dot" style={{ background: '#febc2e' }} />
                    <div className="mock-dot" style={{ background: '#28c840' }} />
                    <div className="mock-url">app.inventorypro.com/dashboard/inventario</div>
                </div>

                {/* App layout */}
                <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

                    {/* ── Sidebar (exact replica) ── */}
                    <aside style={{
                        width: 148, flexShrink: 0,
                        background: `linear-gradient(180deg, ${C.sidebar} 0%, ${C.sidebar} 100%)`,
                        display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.06)',
                        overflowY: 'auto', scrollbarWidth: 'none',
                    }}>
                        {/* Logo */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                            <Package size={14} color="#fff" strokeWidth={2.5} />
                            <span style={{ fontSize: 11, fontWeight: 900, color: '#fff', letterSpacing: '-0.3px' }}>InventoryPro</span>
                        </div>

                        {/* Nav */}
                        <div style={{ flex: 1, padding: '8px 4px', overflowY: 'auto', scrollbarWidth: 'none' }}>
                            {NAV_SECTIONS.map(section => {
                                const items = NAV.filter(n => n.section === section)
                                return (
                                    <div key={section} style={{ marginBottom: 8 }}>
                                        <div className="m-nav-section">
                                            <div className="m-nav-line" />
                                            <div className="m-nav-title">{section}</div>
                                            <div className="m-nav-line" />
                                        </div>
                                        {items.map(item => {
                                            const Icon = item.icon
                                            return (
                                                <div key={item.label} className={`m-nav-link${item.active ? ' active' : ''}`}>
                                                    <Icon size={10} strokeWidth={item.active ? 2.5 : 2} />
                                                    {item.label}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )
                            })}
                        </div>

                        {/* Bottom user */}
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '8px 12px', flexShrink: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff' }}>A</div>
                                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.65)', fontWeight: 600, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>admin@empresa.com</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, color: 'rgba(255,255,255,0.4)', fontSize: 8, fontWeight: 700, cursor: 'pointer' }}>
                                <LogOut size={9} /> Cerrar Sesión
                            </div>
                        </div>
                    </aside>

                    {/* ── Main content ── */}
                    <main style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10, scrollbarWidth: 'none', minWidth: 0 }}>

                        {/* Page header + tabs */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ fontSize: 15, fontWeight: 900, color: C.fg, letterSpacing: '-0.4px', lineHeight: 1.1, fontFamily: "'Outfit','Inter',sans-serif" }}>
                                    {activeTab === 'dashboard' ? 'Reportes y BI' : 'Inventario Detallado'}
                                </div>
                                <div style={{ fontSize: 9, color: C.muted, fontWeight: 600, marginTop: 2 }}>
                                    {activeTab === 'dashboard' ? 'Análisis detallado de rendimiento comercial' : 'Consulta las existencias en tiempo real'}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 4, background: C.surfaceEl, padding: 3, borderRadius: 8, border: `1px solid ${C.border}` }}>
                                <button className={`tab-btn ${activeTab === 'dashboard' ? 'active' : 'inactive'}`} onClick={() => setActiveTab('dashboard')}>BI</button>
                                <button className={`tab-btn ${activeTab === 'inventory' ? 'active' : 'inactive'}`} onClick={() => setActiveTab('inventory')}>Inventario</button>
                            </div>
                        </div>

                        {/* ── DASHBOARD TAB ── */}
                        {activeTab === 'dashboard' && (
                            <>
                                {/* Stat cards */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                                    {STATS.map((s, i) => {
                                        const Icon = s.icon
                                        return (
                                            <div key={i} className="mcard" style={{
                                                background: s.dark ? C.primary : C.surfaceEl,
                                                animationDelay: `${i * 0.08}s`,
                                                minWidth: 0,
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                                    <div style={{ padding: 5, background: s.dark ? 'rgba(255,255,255,0.15)' : s.bg, borderRadius: 7, display: 'flex' }}>
                                                        <Icon size={12} color={s.dark ? '#fff' : s.color} strokeWidth={2.5} />
                                                    </div>
                                                    {s.badge && <span className="stat-badge">{s.badge}</span>}
                                                </div>
                                                <div style={{ fontSize: 9, fontWeight: 900, color: s.dark ? 'rgba(255,255,255,0.75)' : C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>{s.label}</div>
                                                <div style={{ fontSize: 13, fontWeight: 900, color: s.dark ? '#fff' : (s.color === '#3b82f6' ? '#3b82f6' : C.fg), lineHeight: 1.1 }}>{s.value}</div>
                                                <div style={{ fontSize: 8, color: s.dark ? 'rgba(255,255,255,0.5)' : C.muted, marginTop: 4, fontWeight: 500 }}>{s.sub}</div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Pill summaries */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
                                    {[
                                        { label: 'Gastos de Operación', value: '-$5,200,000', color: '#dc2626', bg: 'rgba(239,68,68,0.05)', border: 'rgba(239,68,68,0.12)' },
                                        { label: 'Utilidad Bruta', value: '$18,940,000', color: '#10b981', bg: 'rgba(16,185,129,0.05)', border: 'rgba(16,185,129,0.12)' },
                                        { label: 'Venta Promedio', value: '$361,000', color: '#3b82f6', bg: 'rgba(59,130,246,0.05)', border: 'rgba(59,130,246,0.12)' },
                                    ].map((p, i) => (
                                        <div key={i} className="mcard" style={{ background: p.bg, border: `1px solid ${p.border}`, borderRadius: 10, padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 7, animationDelay: `${i * 0.08 + 0.3}s` }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: 8, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{p.label}</div>
                                                <div style={{ fontSize: 11, fontWeight: 900, color: p.color, marginTop: 1 }}>{p.value}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Area chart */}
                                <div className="mcard" style={{ animationDelay: '0.4s', background: C.surfaceEl, borderRadius: 12, padding: '10px 12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                        <TrendingUp size={11} color={C.primary} strokeWidth={2.5} />
                                        <span style={{ fontSize: 10, fontWeight: 900, color: C.fg, letterSpacing: '-0.2px' }}>Tendencia de Ventas vs Utilidad</span>
                                    </div>
                                    <div style={{ height: 120, paddingLeft: 28 }}>
                                        <FakeAreaChart animated={animated} />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ── INVENTORY TAB ── */}
                        {activeTab === 'inventory' && (
                            <>
                                {/* Valuation cards */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                                    {[
                                        { label: 'Inversión (Costo)', value: '$96,800,000', sub: 'Capital invertido en compras', bar: '#f59e0b', barBg: 'rgba(245,158,11,0.12)' },
                                        { label: 'Valor Venta Est.', value: '$168,420,000', sub: 'Ingreso bruto potencial', bar: '#10b981', barBg: 'rgba(16,185,129,0.12)', textColor: '#059669' },
                                        { label: 'Margen Potencial', value: '$71,620,000', sub: 'Utilidad bruta esperada', bar: '#3b82f6', barBg: 'rgba(59,130,246,0.12)', textColor: '#2563eb' },
                                        { label: 'Total Unidades', value: '1,284', sub: 'En 2 Bodegas', dark: true },
                                    ].map((c, i) => (
                                        <div key={i} className="mcard" style={{ background: c.dark ? C.primary : C.surfaceEl, animationDelay: `${i * 0.07}s`, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '10px 8px' }}>
                                            <div style={{ fontSize: 8, fontWeight: 900, color: c.dark ? 'rgba(255,255,255,0.7)' : C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{c.label}</div>
                                            <div style={{ fontSize: 12, fontWeight: 900, color: c.dark ? '#fff' : (c.textColor || C.fg), marginBottom: 6 }}>{c.value}</div>
                                            {!c.dark && <div style={{ width: 50, height: 4, background: c.barBg, borderRadius: 99, overflow: 'hidden', marginBottom: 4 }}><div style={{ height: '100%', background: c.bar, borderRadius: 99, width: '100%' }} /></div>}
                                            <div style={{ fontSize: 7, color: c.dark ? 'rgba(255,255,255,0.45)' : C.muted, fontWeight: 500 }}>{c.sub}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Inventory table */}
                                <div className="mcard" style={{ animationDelay: '0.3s', background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden', padding: 0 }}>
                                    <div style={{ padding: '8px 12px', background: C.surfaceEl, borderBottom: `1px solid ${C.border}` }}>
                                        <div style={{ fontSize: 10, fontWeight: 900, color: C.fg, letterSpacing: '-0.2px', fontFamily: "'Outfit','Inter',sans-serif" }}>Existencias</div>
                                        <div style={{ fontSize: 8, color: C.muted, fontWeight: 600 }}>Mostrando 5 de 78 productos</div>
                                    </div>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr>
                                                    {['Producto', 'SKU', 'Almacén', 'Cantidad', 'Estado', 'Kardex'].map(h => (
                                                        <th key={h} className="inv-th">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {STOCK_ROWS.map((row, i) => {
                                                    const sc = STATUS_STYLES[row.statusColor]
                                                    const qtyStyle = {
                                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                        minWidth: 28, padding: '2px 6px', borderRadius: 6,
                                                        fontSize: 10, fontWeight: 900,
                                                        background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`,
                                                    }
                                                    return (
                                                        <tr key={i} className="inv-tr" style={{
                                                            borderBottom: `1px solid ${C.border}`,
                                                            opacity: animated ? 1 : 0,
                                                            transform: animated ? 'none' : 'translateY(4px)',
                                                            transition: `all 0.4s ease ${0.1 + i * 0.07}s`,
                                                        }}>
                                                            <td className="inv-td">
                                                                <div style={{ fontSize: 10, fontWeight: 700, color: C.fg }}>{row.name}</div>
                                                            </td>
                                                            <td className="inv-td">
                                                                <div style={{ fontSize: 8, fontFamily: 'monospace', color: C.muted }}>{row.sku}</div>
                                                            </td>
                                                            <td className="inv-td">
                                                                <div style={{ fontSize: 9, fontWeight: 600, color: C.fg }}>{row.wh}</div>
                                                            </td>
                                                            <td className="inv-td" style={{ textAlign: 'center' }}>
                                                                <span style={qtyStyle}>{row.qty}</span>
                                                            </td>
                                                            <td className="inv-td">
                                                                <span style={{ fontSize: 8, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
                                                                    {row.status}
                                                                </span>
                                                            </td>
                                                            <td className="inv-td" style={{ textAlign: 'right' }}>
                                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 8, fontWeight: 900, color: '#6366f1', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.18)', padding: '3px 8px', borderRadius: 99, letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer' }}>
                                                                    Ver Kardex
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}
                    </main>
                </div>
            </div>
        </>
    )
}

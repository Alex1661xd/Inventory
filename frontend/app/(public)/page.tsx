'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Package,
  ChevronRight,
  BarChart3,
  QrCode,
  History,
  Warehouse,
  Smartphone,
  ScanLine,
  Wallet,
  MessageSquare,
  Share2,
  CheckCircle2
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[hsl(var(--background))] selection:bg-[hsl(var(--primary)/0.1)] selection:text-[hsl(var(--primary))]">
      {/* Header / Navbar */}
      <header className="fixed top-0 w-full z-50 glass-effect border-b border-[hsl(var(--border)/0.5)]">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5 group cursor-pointer animate-fade-in">
            <div className="w-10 h-10 rounded-xl bg-[hsl(var(--primary))] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Package className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-[hsl(var(--foreground))]" style={{ fontFamily: 'var(--font-display)' }}>
              Inventory<span className="text-[hsl(var(--primary))] opacity-80">Pro</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-10 text-sm font-bold uppercase tracking-widest text-[hsl(var(--muted))] animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <Link href="#features" className="hover:text-[hsl(var(--primary))] transition-colors duration-300">Funcionalidades</Link>
            <Link href="#solutions" className="hover:text-[hsl(var(--primary))] transition-colors duration-300">Soluciones</Link>
            <Link href="/login" className="hover:text-[hsl(var(--primary))] transition-colors duration-300">Mi Cuenta</Link>
          </nav>

          <div className="flex items-center gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Link href="/login">
              <Button variant="ghost" className="hidden sm:inline-flex font-black text-xs uppercase tracking-widest hover:bg-[hsl(var(--primary)/0.05)]">Acceder</Button>
            </Link>
            <Link href="/register">
              <Button className="rounded-full px-8 bg-[hsl(var(--primary))] text-white font-black text-xs uppercase tracking-widest shadow-xl hover:shadow-[hsl(var(--primary)/0.2)] hover:scale-105 active:scale-95 transition-all duration-300">
                Empezar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-20">
        {/* Hero Section */}
        <section className="relative py-24 lg:py-40 px-6 overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-[hsl(var(--primary)/0.03)] rounded-full blur-[120px] -z-10 animate-float"></div>
          <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-[hsl(var(--accent)/0.03)] rounded-full blur-[100px] -z-10" style={{ animation: 'float 5s ease-in-out infinite' }}></div>

          <div className="container mx-auto max-w-6xl">
            <div className="text-center space-y-8 animate-slide-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--primary)/0.05)] border border-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--primary))] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[hsl(var(--primary))]"></span>
                </span>
                Gestión Inteligente de Inventarios
              </div>

              <h1 className="text-6xl md:text-8xl font-black text-[hsl(var(--foreground))] tracking-tighter leading-[0.9] max-w-4xl mx-auto" style={{ fontFamily: 'var(--font-display)' }}>
                Control total <br />
                <span className="text-[hsl(var(--muted))] italic opacity-60">sin esfuerzo.</span>
              </h1>

              <p className="text-xl md:text-2xl text-[hsl(var(--muted))] max-w-2xl mx-auto leading-relaxed font-medium">
                Potencia tu negocio con el sistema de gestión más elegante y eficiente. Inventario, POS y BI en una sola plataforma.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
                <Link href="/register">
                  <Button size="lg" className="h-16 px-12 rounded-2xl bg-[hsl(var(--primary))] text-white text-lg font-black shadow-2xl hover:scale-105 hover:shadow-[hsl(var(--primary)/0.3)] transition-all duration-300 w-full sm:w-auto">
                    Empezar
                  </Button>
                </Link>
              </div>

              <div className="pt-20 lg:pt-32 animate-scale-in" style={{ animationDelay: '0.4s' }}>
                <div className="relative mx-auto max-w-5xl rounded-3xl border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--surface))] shadow-[0_48px_96px_-24px_rgba(0,0,0,0.12)] p-2">
                  <div className="aspect-[16/9] bg-gradient-to-br from-[hsl(var(--background))] to-[hsl(var(--muted-light))] rounded-2xl flex items-center justify-center overflow-hidden">
                    <div className="flex flex-col items-center gap-6 opacity-40">
                      <Package className="w-24 h-24 stroke-[1] animate-float" />
                      <p className="font-black text-sm uppercase tracking-[0.5em] animate-pulse-soft">Dashboard Preview</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 px-6 bg-[hsl(var(--surface-elevated))]">
          <div className="container mx-auto">
            <div className="text-center mb-24 space-y-4 animate-fade-in">
              <h2 className="text-4xl md:text-5xl font-black text-[hsl(var(--foreground))] tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>
                Una suite diseñada <br /> para el crecimiento.
              </h2>
              <p className="text-[hsl(var(--muted))] font-bold text-sm uppercase tracking-[0.2em]">Todo lo que tu negocio necesita en un solo lugar</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <BarChart3 className="w-8 h-8" />,
                  title: "BI & Intelligence",
                  desc: "Analiza tu Profit & Loss en tiempo real con gráficas predictivas y detalladas.",
                  delay: "0.1s"
                },
                {
                  icon: <Warehouse className="w-8 h-8" />,
                  title: "Control de Bodegas",
                  desc: "Kardex detallado y movimientos de stock entre múltiples sedes sincronizados.",
                  delay: "0.2s"
                },
                {
                  icon: <Smartphone className="w-8 h-8" />,
                  title: "POS Mobile-First",
                  desc: "Vende en segundos desde cualquier dispositivo con escaneo de cámara integrado.",
                  delay: "0.3s"
                },
                {
                  icon: <QrCode className="w-8 h-8" />,
                  title: "Código de Barras",
                  desc: "Genera e imprime etiquetas personalizadas para un control total de cada pieza.",
                  delay: "0.4s"
                },
                {
                  icon: <MessageSquare className="w-8 h-8" />,
                  title: "WhatsApp Sync",
                  desc: "Envía recibos digitales y catálogos directamente al WhatsApp de tus clientes.",
                  delay: "0.5s"
                },
                {
                  icon: <Share2 className="w-8 h-8" />,
                  title: "Catálogo Online",
                  desc: "Tu inventario se convierte en una vitrina digital automática para tus compradores.",
                  delay: "0.6s"
                }
              ].map((feature, i) => (
                <Card key={i} className="border-none shadow-none bg-transparent group hover:translate-y-[-8px] transition-all duration-500 animate-slide-in" style={{ animationDelay: feature.delay }}>
                  <CardContent className="p-10 space-y-6">
                    <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-[hsl(var(--primary))] flex items-center justify-center group-hover:bg-[hsl(var(--primary))] group-hover:text-white transition-all duration-500 shadow-sm">
                      {feature.icon}
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-xl font-black text-[hsl(var(--foreground))] tracking-tight">{feature.title}</h3>
                      <p className="text-[hsl(var(--muted))] leading-relaxed font-medium">{feature.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-32 px-6">
          <div className="container mx-auto max-w-5xl">
            <div className="rounded-[4rem] bg-[hsl(var(--primary))] p-12 lg:p-24 text-center text-white relative overflow-hidden shadow-[0_64px_128px_-32px_rgba(0,0,0,0.2)] animate-scale-in">
              <div className="absolute top-0 right-0 w-[50%] h-[100%] bg-white/5 skew-x-[-12deg] -translate-y-1/2"></div>

              <div className="relative z-10 space-y-10">
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.95]" style={{ fontFamily: 'var(--font-display)' }}>
                  ¿Listo para transformar <br /> tu negocio?
                </h2>
                <p className="text-xl text-white/60 max-w-xl mx-auto font-medium">
                  Únete ahora y descubre por qué InventoryPro es la herramienta definitiva para emprendedores modernos.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
                  <Link href="/register">
                    <Button size="lg" className="h-16 px-12 rounded-2xl bg-white text-[hsl(var(--primary))] text-lg font-black hover:scale-105 active:scale-95 transition-all shadow-xl">
                      Empezar
                    </Button>
                  </Link>
                </div>
                <div className="flex flex-center justify-center gap-8 opacity-40 text-[10px] font-black uppercase tracking-[0.3em]">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Sin Tarjeta</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Setup en 2 Minutos</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[hsl(var(--border))] py-20 px-6 bg-[hsl(var(--surface))]">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="space-y-6 max-w-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[hsl(var(--primary))] text-white flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <span className="text-xl font-black tracking-tighter text-[hsl(var(--foreground))]" style={{ fontFamily: 'var(--font-display)' }}>
                  InventoryPro
                </span>
              </div>
              <p className="text-sm text-[hsl(var(--muted))] leading-relaxed font-medium">
                Redefiniendo la gestión de stocks para la nueva era digital. Elegancia, eficiencia y control.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 lg:gap-24">
              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--foreground))]">Plataforma</h4>
                <ul className="space-y-4 text-sm font-bold text-[hsl(var(--muted))]">
                  <li><Link href="/" className="hover:text-[hsl(var(--primary))] transition-colors duration-300">Funcionalidades</Link></li>
                  <li><Link href="/" className="hover:text-[hsl(var(--primary))] transition-colors duration-300">Precios</Link></li>
                  <li><Link href="/" className="hover:text-[hsl(var(--primary))] transition-colors duration-300">Seguridad</Link></li>
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--foreground))]">Compañía</h4>
                <ul className="space-y-4 text-sm font-bold text-[hsl(var(--muted))]">
                  <li><Link href="/" className="hover:text-[hsl(var(--primary))] transition-colors duration-300">Sobre Nosotros</Link></li>
                  <li><Link href="/" className="hover:text-[hsl(var(--primary))] transition-colors duration-300">Blog</Link></li>
                  <li><Link href="/" className="hover:text-[hsl(var(--primary))] transition-colors duration-300">Contacto</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-20 pt-8 border-t border-[hsl(var(--border)/0.5)] flex flex-col sm:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted))]">
              © 2024 InventoryPro. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

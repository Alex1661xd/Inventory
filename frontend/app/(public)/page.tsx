import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--background))] to-[hsl(var(--surface-elevated))] text-[hsl(var(--foreground))]">
      {/* Navigation Header */}
      <header className="fixed top-0 w-full z-50 glass-effect border-b border-[hsl(var(--border))]">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">📦</span>
            <span className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>InventoryPro</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="font-semibold">Iniciar Sesión</Button>
            </Link>
            <Link href="/register">
              <Button className="font-bold shadow-lg bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] hover:opacity-90">Comenzar Gratis</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="pt-40 pb-20 px-6 overflow-hidden">
          <div className="container mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative z-10 animate-slide-in">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] text-xs font-bold uppercase tracking-widest mb-6">
                <span className="w-2 h-2 rounded-full bg-[hsl(var(--primary))] animate-pulse"></span>
                Gestión Inteligente
              </div>
              <h1 className="text-6xl lg:text-7xl font-bold mb-8 leading-[1.1]" style={{ fontFamily: 'var(--font-display)' }}>
                Controla tu inventario, <br />
                <span className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] bg-clip-text text-transparent">Impulsa tu negocio.</span>
              </h1>
              <p className="text-xl text-[hsl(var(--muted))] mb-10 leading-relaxed max-w-xl">
                La plataforma definitiva para gestionar inventario, ventas y catálogo digital. Perfecta para tiendas de ropa, mercados, ferreterías y cualquier negocio retail.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button size="lg" className="h-14 px-10 text-lg font-bold shadow-2xl bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] hover:opacity-90">Empezar Ahora</Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="h-14 px-10 text-lg font-bold">Ver Demo</Button>
                </Link>
              </div>
              <div className="mt-12 flex items-center gap-6 text-[hsl(var(--muted))]">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-[hsl(var(--foreground))]">500+</span>
                  <span className="text-xs uppercase tracking-widest">Negocios</span>
                </div>
                <div className="w-px h-10 bg-[hsl(var(--border))]"></div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-[hsl(var(--foreground))]">15k+</span>
                  <span className="text-xs uppercase tracking-widest">Productos</span>
                </div>
              </div>
            </div>

            <div className="relative animate-scale-in">
              <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] rounded-[3rem] rotate-3 opacity-20 blur-3xl"></div>
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-8 border-white">
                <img
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200"
                  alt="Retail Store"
                  className="w-full h-[600px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--foreground))]/60 via-transparent to-transparent flex items-end p-8">
                  <div className="glass-effect p-6 rounded-2xl w-full">
                    <div className="flex items-center justify-between text-white">
                      <div>
                        <div className="text-sm font-medium opacity-80">Última Venta</div>
                        <div className="text-2xl font-bold">Producto Premium</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium opacity-80">Precio</div>
                        <div className="text-2xl font-bold">$1,250.00</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-32 bg-[hsl(var(--foreground))] text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[hsl(var(--primary))] rounded-full blur-[150px] opacity-10 translate-x-1/2 -translate-y-1/2"></div>

          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-24">
              <h2 className="text-4xl font-bold mb-6" style={{ fontFamily: 'var(--font-display)' }}>Características Diseñadas para el Éxito</h2>
              <p className="text-white/60 text-lg">Herramientas profesionales para negocios modernos</p>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              <div className="group animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-3xl mb-8 group-hover:bg-gradient-to-br group-hover:from-[hsl(var(--primary))] group-hover:to-[hsl(var(--secondary))] transition-all duration-500">📦</div>
                <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>Inventario Inteligente</h3>
                <p className="text-white/60 leading-relaxed">Control total de stock en múltiples almacenes con códigos de barras automatizados y alertas de stock bajo.</p>
              </div>
              <div className="group animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-3xl mb-8 group-hover:bg-gradient-to-br group-hover:from-[hsl(var(--primary))] group-hover:to-[hsl(var(--secondary))] transition-all duration-500">📱</div>
                <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>Catálogo Digital</h3>
                <p className="text-white/60 leading-relaxed">Presenta tus productos al mundo con un catálogo elegante y siempre sincronizado con tus existencias físicas.</p>
              </div>
              <div className="group animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-3xl mb-8 group-hover:bg-gradient-to-br group-hover:from-[hsl(var(--primary))] group-hover:to-[hsl(var(--secondary))] transition-all duration-500">📊</div>
                <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>Análisis Avanzado</h3>
                <p className="text-white/60 leading-relaxed">Descubre qué productos generan más valor y toma decisiones basadas en datos reales de tu negocio.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6">
          <div className="container mx-auto max-w-4xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] rounded-[3rem] p-12 text-center text-white shadow-2xl relative overflow-hidden animate-float">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full"></div>
              <div className="absolute bottom-10 right-10 w-48 h-48 border-8 border-white rounded-full opacity-30"></div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-8 relative z-10" style={{ fontFamily: 'var(--font-display)' }}>
              ¿Listo para transformar tu negocio?
            </h2>
            <p className="text-xl mb-12 opacity-90 relative z-10 max-w-xl mx-auto font-medium">
              Únete hoy a los cientos de empresarios que ya están optimizando su gestión de inventario.
            </p>
            <Link href="/register">
              <Button variant="secondary" size="lg" className="h-16 px-12 text-xl font-bold shadow-2xl rounded-2xl relative z-10 bg-white text-[hsl(var(--primary))] hover:bg-white/90">Crear Mi Cuenta Gratis</Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-20 border-t border-[hsl(var(--border))] bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📦</span>
              <span className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>InventoryPro</span>
            </div>
            <div className="flex gap-8 text-[hsl(var(--muted))] font-medium">
              <a href="#" className="hover:text-[hsl(var(--primary))] transition-colors">Privacidad</a>
              <a href="#" className="hover:text-[hsl(var(--primary))] transition-colors">Términos</a>
              <a href="#" className="hover:text-[hsl(var(--primary))] transition-colors">Contacto</a>
            </div>
            <p className="text-[hsl(var(--muted))]">© 2024 InventoryPro. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

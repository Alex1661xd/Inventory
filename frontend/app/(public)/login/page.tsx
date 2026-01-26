'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Link from 'next/link'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (error) {
            toast.error('Error al iniciar sesión: ' + error.message)
            setLoading(false)
            return
        }

        toast.success('Bienvenido de nuevo')
        router.refresh()
        router.push('/dashboard')
    }

    return (
        <div className="flex min-h-screen">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[hsl(var(--foreground))] via-[hsl(var(--primary-dark))] to-[hsl(var(--secondary))]">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl animate-float"></div>
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-[hsl(var(--accent))] rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
                </div>

                <div className="relative z-10 flex flex-col justify-center px-16 text-white">
                    <div className="animate-slide-in">
                        <div className="mb-8">
                            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6">
                                <span className="text-4xl">📦</span>
                            </div>
                            <h1 className="text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                                Bienvenido de Vuelta
                            </h1>
                            <p className="text-xl text-white/90 leading-relaxed">
                                Accede a tu panel de control y continúa gestionando tu negocio con eficiencia.
                            </p>
                        </div>

                        <div className="space-y-3 mt-12">
                            <div className="flex items-center gap-3 text-white/80">
                                <div className="w-2 h-2 rounded-full bg-[hsl(var(--accent))]"></div>
                                <span>Gestión de inventario en tiempo real</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/80">
                                <div className="w-2 h-2 rounded-full bg-[hsl(var(--accent))]"></div>
                                <span>Reportes de ventas detallados</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/80">
                                <div className="w-2 h-2 rounded-full bg-[hsl(var(--accent))]"></div>
                                <span>Catálogo digital actualizado</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-[hsl(var(--background))]">
                <div className="w-full max-w-md animate-scale-in">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                            Iniciar Sesión
                        </h2>
                        <p className="text-[hsl(var(--muted))]">Accede a tu panel administrativo</p>
                    </div>

                    <Card>
                        <CardContent className="pt-6">
                            <form onSubmit={handleLogin} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="contacto@mitienda.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">Contraseña</Label>
                                        <Link
                                            href="#"
                                            className="text-xs text-[rgb(120,115,110)] hover:text-[rgb(25,35,25)] transition-colors"
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </Link>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="animate-spin">⚙️</span>
                                            Iniciando sesión...
                                        </span>
                                    ) : (
                                        'Entrar'
                                    )}
                                </Button>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-sm text-[hsl(var(--muted))]">
                                    ¿No tienes cuenta?{' '}
                                    <Link href="/register" className="font-semibold text-[hsl(var(--primary))] hover:text-[hsl(var(--primary-dark))] underline-offset-4 hover:underline transition-colors">
                                        Registra tu negocio
                                    </Link>
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="mt-8 text-center">
                        <p className="text-xs text-[hsl(var(--muted))]">
                            Sistema seguro con encriptación de extremo a extremo
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

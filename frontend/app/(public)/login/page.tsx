'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Eye, EyeOff, Lock, Mail, Package, ArrowRight } from 'lucide-react'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            // Redirección inteligente basada en rol
            const { data: userData, error: userError } = await supabase
                .from('User')
                .select('role')
                .eq('id', data.user.id)
                .single()

            if (userError) throw userError

            toast.success('¡Bienvenido de nuevo!')

            if (userData.role === 'SELLER') {
                router.push('/pos')
            } else if (userData.role === 'ADMIN' || userData.role === 'SUPER_ADMIN') {
                router.push('/dashboard')
            } else {
                router.push('/dashboard')
            }
        } catch (error: any) {
            toast.error(error.message || 'Error al iniciar sesión')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen bg-[hsl(var(--background))]">
            {/* Left Side - Branding (Desktop Only) */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[hsl(var(--primary))]">
                {/* Elegant Decorative Elements */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 animate-pulse-soft"></div>
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[hsl(var(--secondary))] rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
                </div>

                <div className="relative z-10 flex flex-col justify-center px-20 text-white">
                    <div className="animate-slide-in">
                        <Link href="/" className="flex items-center gap-3 mb-16 group cursor-pointer w-fit">
                            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Package className="w-7 h-7 text-white" />
                            </div>
                            <span className="text-3xl font-black tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>
                                Inventory<span className="opacity-60 font-medium">Pro</span>
                            </span>
                        </Link>

                        <div className="space-y-6">
                            <h1 className="text-6xl font-black tracking-tighter leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                                Gestiona con <br />
                                <span className="text-[hsl(var(--secondary))] italic">precisión.</span>
                            </h1>
                            <p className="text-xl text-white/60 leading-relaxed max-w-md font-medium">
                                Accede a tu plataforma de control de inventarios y lleva la eficiencia de tu negocio al siguiente nivel.
                            </p>
                        </div>

                        <div className="mt-20 pt-10 border-t border-white/10 flex items-center gap-8 opacity-40">
                            <div className="text-center">
                                <p className="text-2xl font-black tracking-tighter">100%</p>
                                <p className="text-[10px] uppercase font-bold tracking-widest">Seguro</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-black tracking-tighter">24/7</p>
                                <p className="text-[10px] uppercase font-bold tracking-widest">Soporte</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
                <div className="w-full max-w-md animate-scale-in">
                    <div className="text-center mb-10">
                        <h2 className="text-4xl font-black text-[hsl(var(--foreground))] mb-3 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                            Bienvenido
                        </h2>
                        <p className="text-[hsl(var(--muted))] font-medium">Ingresa tus credenciales para continuar</p>
                    </div>

                    <Card className="border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] overflow-hidden bg-[hsl(var(--surface))]">
                        <CardContent className="p-8 md:p-10">
                            <form onSubmit={handleLogin} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="font-bold text-xs uppercase tracking-widest text-[hsl(var(--muted))]">Email</Label>
                                    <div className="relative">
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="nombre@empresa.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="h-12 md:h-14 rounded-xl border-2 border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] transition-all pl-12 bg-transparent"
                                        />
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted))]" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password" title="Contraseña" className="font-bold text-xs uppercase tracking-widest text-[hsl(var(--muted))]">Contraseña</Label>
                                        <Link
                                            href="/forgot-password"
                                            className="text-xs font-bold text-[hsl(var(--primary))] hover:text-[hsl(var(--primary-dark))] transition-colors"
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="h-12 md:h-14 rounded-xl border-2 border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] transition-all pl-12 pr-12 bg-transparent"
                                        />
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted))]" />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                <Button type="submit" className="w-full h-14 md:h-16 text-lg font-black rounded-2xl bg-[hsl(var(--primary))] text-white shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all" disabled={loading}>
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="animate-spin text-xl">⚙️</span>
                                            Accediendo...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            Iniciar Sesión <ArrowRight className="w-5 h-5" />
                                        </span>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="mt-10 text-center">
                        <p className="text-[hsl(var(--muted))] font-medium">
                            ¿Aún no tienes una cuenta?{' '}
                            <Link
                                href="/register"
                                className="font-black text-[hsl(var(--primary))] hover:text-[hsl(var(--primary-dark))] transition-colors underline underline-offset-4"
                            >
                                Regístrate gratis
                            </Link>
                        </p>
                    </div>

                    <div className="mt-16 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--muted))] opacity-40">
                        <Link href="/" className="hover:text-[hsl(var(--foreground))] transition-colors">Inicio</Link>
                        <span>•</span>
                        <Link href="#" className="hover:text-[hsl(var(--foreground))] transition-colors">Términos</Link>
                        <span>•</span>
                        <Link href="#" className="hover:text-[hsl(var(--foreground))] transition-colors">Privacidad</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

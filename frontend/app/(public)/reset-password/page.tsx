'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Eye, EyeOff, Lock, KeyRound, ShieldCheck } from 'lucide-react'

export default function ResetPasswordPage() {
    const router = useRouter()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            toast.error('Las contraseñas no coinciden')
            return
        }

        if (password.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres')
            return
        }

        setLoading(true)

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) throw error

            toast.success('¡Contraseña actualizada correctamente!')
            router.push('/dashboard')
        } catch (error: any) {
            toast.error(error.message || 'Error al actualizar la contraseña')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen bg-[hsl(var(--background))]">
            {/* Left Side - Branding (Desktop Only) */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[hsl(var(--foreground))] via-[hsl(var(--primary-dark))] to-[hsl(var(--secondary))]">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[hsl(var(--primary))] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 animate-pulse-soft"></div>
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[hsl(var(--accent))] rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 animate-float"></div>
                </div>

                <div className="relative z-10 flex flex-col justify-center px-20 text-white">
                    <div className="animate-slide-in">
                        <div className="mb-12">
                            <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-8 shadow-2xl">
                                <KeyRound className="w-10 h-10 text-white" />
                            </div>
                            <h1 className="text-6xl font-black mb-6 tracking-tighter leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                                Asegura tu <br />
                                <span className="text-[hsl(var(--primary-light))] italic">nuevo acceso.</span>
                            </h1>
                            <p className="text-xl text-white/60 leading-relaxed max-w-md font-medium">
                                Crea una credencial fuerte y única. Tu seguridad es la base de un crecimiento sólido para tu negocio.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
                <div className="w-full max-w-md animate-scale-in">
                    <div className="text-center mb-10">
                        <h2 className="text-4xl font-black text-[hsl(var(--foreground))] mb-3 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                            Nueva Contraseña
                        </h2>
                        <p className="text-[hsl(var(--muted))] font-medium">Estás a un paso de recuperar el control</p>
                    </div>

                    <Card className="border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] overflow-hidden bg-white/70 backdrop-blur-xl">
                        <CardContent className="p-8 md:p-10">
                            <form onSubmit={handleUpdate} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="password" title="Contraseña" className="font-bold text-xs uppercase tracking-widest text-[hsl(var(--muted))]">Nueva Contraseña</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="h-12 md:h-14 rounded-xl border-2 border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] transition-all pl-12 pr-12 bg-white"
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

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" title="Confirmar Contraseña" className="font-bold text-xs uppercase tracking-widest text-[hsl(var(--muted))]">Confirmar Contraseña</Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            className="h-12 md:h-14 rounded-xl border-2 border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] transition-all pl-12 bg-white"
                                        />
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted))]" />
                                    </div>
                                </div>

                                <Button type="submit" className="w-full h-14 md:h-16 text-lg font-black rounded-2xl bg-gradient-to-r from-[hsl(var(--foreground))] to-[hsl(var(--muted))] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all" disabled={loading}>
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="animate-spin text-xl">⚙️</span>
                                            Actualizando...
                                        </span>
                                    ) : (
                                        'Actualizar y Entrar'
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="mt-10 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--muted))] opacity-40">
                        <ShieldCheck className="w-3 h-3" />
                        Seguridad de Nivel Empresarial
                    </div>
                </div>
            </div>
        </div>
    )
}


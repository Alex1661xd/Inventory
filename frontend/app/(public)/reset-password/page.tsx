'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Eye, EyeOff, Lock } from 'lucide-react'

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
        <div className="flex min-h-screen">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[hsl(var(--foreground))] via-[hsl(var(--primary-dark))] to-[hsl(var(--secondary))]">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl animate-float"></div>
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-[hsl(var(--accent))] rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
                </div>

                <div className="relative z-10 flex flex-col justify-center px-16 text-white">
                    <div className="animate-slide-in">
                        <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6">
                            <span className="text-4xl">🆕</span>
                        </div>
                        <h1 className="text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                            Nueva Contraseña
                        </h1>
                        <p className="text-xl text-white/90 leading-relaxed">
                            Crea una contraseña segura para proteger tu negocio y tu información.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-[hsl(var(--background))]">
                <div className="w-full max-w-md animate-scale-in">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                            Restablecer Contraseña
                        </h2>
                        <p className="text-[hsl(var(--muted))]">
                            Ingresa tu nueva contraseña a continuación.
                        </p>
                    </div>

                    <Card>
                        <CardContent className="pt-6">
                            <form onSubmit={handleUpdate} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Nueva Contraseña</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="pl-10 pr-10"
                                        />
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted))]" />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            className="pl-10"
                                        />
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted))]" />
                                    </div>
                                </div>

                                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="animate-spin">⚙️</span>
                                            Actualizando...
                                        </span>
                                    ) : (
                                        'Actualizar Contraseña'
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

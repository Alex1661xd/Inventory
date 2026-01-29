'use client'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Link from 'next/link'
import { ArrowLeft, Mail } from 'lucide-react'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const supabase = createClient()

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
            })

            if (error) throw error

            setSubmitted(true)
            toast.success('Correo de recuperación enviado')
        } catch (error: any) {
            toast.error(error.message || 'Error al enviar el correo')
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
                            <span className="text-4xl">🔐</span>
                        </div>
                        <h1 className="text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                            Recuperación Segura
                        </h1>
                        <p className="text-xl text-white/90 leading-relaxed">
                            No te preocupes, te ayudaremos a recuperar el acceso a tu cuenta en unos simples pasos.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-[hsl(var(--background))]">
                <div className="w-full max-w-md animate-scale-in">
                    <Link
                        href="/login"
                        className="inline-flex items-center text-sm text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] mb-8 transition-colors group"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Volver al inicio de sesión
                    </Link>

                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                            ¿Olvidaste tu contraseña?
                        </h2>
                        <p className="text-[hsl(var(--muted))]">
                            Ingresa tu email y te enviaremos instrucciones.
                        </p>
                    </div>

                    <Card>
                        <CardContent className="pt-6">
                            {!submitted ? (
                                <form onSubmit={handleReset} className="space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Registrado</Label>
                                        <div className="relative">
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="tu@email.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className="pl-10"
                                            />
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted))]" />
                                        </div>
                                    </div>

                                    <Button type="submit" className="w-full" size="lg" disabled={loading}>
                                        {loading ? (
                                            <span className="flex items-center gap-2">
                                                <span className="animate-spin">⚙️</span>
                                                Enviando...
                                            </span>
                                        ) : (
                                            'Enviar Enlace de Recuperación'
                                        )}
                                    </Button>
                                </form>
                            ) : (
                                <div className="text-center py-4 space-y-4 animate-fade-in">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-3xl">
                                        ✅
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg text-[hsl(var(--foreground))]">¡Correo Enviado!</h3>
                                        <p className="text-sm text-[hsl(var(--muted))] mt-2">
                                            Revisa tu bandeja de entrada (y spam) en <strong>{email}</strong>. Sigue el enlace para crear una nueva contraseña.
                                        </p>
                                    </div>
                                    <Button variant="outline" className="w-full mt-4" onClick={() => setSubmitted(false)}>
                                        Intentar con otro correo
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

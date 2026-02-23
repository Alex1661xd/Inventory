'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Mail, ChevronLeft, Package, CheckCircle2, ArrowRight } from 'lucide-react'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            })

            if (error) throw error

            setSubmitted(true)
            toast.success('¡Correo enviado! Revisa tu bandeja de entrada.')
        } catch (error: any) {
            toast.error(error.message || 'Error al enviar el correo de recuperación')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen bg-[hsl(var(--background))]">
            {/* Left Side - Branding (Desktop Only) */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[hsl(var(--primary))]">
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
                                Recupera tu <br />
                                <span className="text-[hsl(var(--secondary))] italic">espacio.</span>
                            </h1>
                            <p className="text-xl text-white/60 leading-relaxed max-w-md font-medium">
                                No te preocupes, sucede. Te ayudaremos a volver a tu centro de control en cuestión de segundos.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
                <div className="w-full max-w-md animate-scale-in">
                    {!submitted ? (
                        <>
                            <div className="text-center mb-10">
                                <h2 className="text-4xl font-black text-[hsl(var(--foreground))] mb-3 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                                    ¿Olvidaste tu acceso?
                                </h2>
                                <p className="text-[hsl(var(--muted))] font-medium">Ingresa tu email para restablecer tu contraseña</p>
                            </div>

                            <Card className="border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] overflow-hidden bg-[hsl(var(--surface))]">
                                <CardContent className="p-8 md:p-10">
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="font-bold text-xs uppercase tracking-widest text-[hsl(var(--muted))]">Email de Registro</Label>
                                            <div className="relative">
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="tucorreo@empresa.com"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                    className="h-12 md:h-14 rounded-xl border-2 border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] transition-all pl-12 bg-transparent"
                                                />
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted))]" />
                                            </div>
                                        </div>

                                        <Button type="submit" className="w-full h-14 md:h-16 text-lg font-black rounded-2xl bg-[hsl(var(--primary))] text-white shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all" disabled={loading}>
                                            {loading ? (
                                                <span className="flex items-center gap-2">
                                                    <span className="animate-spin text-xl">️</span>
                                                    Enviando...
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    Enviar Instrucciones <ArrowRight className="w-5 h-5" />
                                                </span>
                                            )}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>

                            <div className="mt-8 text-center">
                                <Link
                                    href="/login"
                                    className="inline-flex items-center gap-2 font-black text-xs uppercase tracking-widest text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" /> Volver al Inicio de Sesión
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div className="text-center animate-scale-in">
                            <div className="w-24 h-24 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-8 shadow-inner">
                                <CheckCircle2 className="w-12 h-12" />
                            </div>
                            <h2 className="text-4xl font-black text-[hsl(var(--foreground))] mb-4 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                                ¡Email Enviado!
                            </h2>
                            <p className="text-[hsl(var(--muted))] font-medium mb-10 leading-relaxed">
                                Hemos enviado un enlace de recuperación a <span className="text-[hsl(var(--foreground))] font-bold">{email}</span>. <br />
                                Por favor, revisa tu bandeja de entrada y spam.
                            </p>
                            <Link href="/login">
                                <Button className="w-full h-14 md:h-16 text-lg font-black rounded-2xl bg-[hsl(var(--primary))] text-white shadow-xl">
                                    Volver al Login
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

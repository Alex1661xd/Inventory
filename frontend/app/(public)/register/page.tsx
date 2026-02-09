'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Package, User, Building2, Mail, Lock, CheckCircle2, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { api } from '@/lib/backend'

const registerSchema = z.object({
    name: z.string().min(2, 'El nombre es muy corto'),
    businessName: z.string().min(2, 'El nombre del negocio es muy corto'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: z.string().min(6, 'La confirmación es requerida'),
    registrationCode: z.string().min(5, 'Código de invitación inválido'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
})

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
    })

    const onSubmit = async (data: RegisterFormValues) => {
        setLoading(true)
        try {
            await api.auth.registerBusiness({
                userName: data.name,
                businessName: data.businessName,
                email: data.email,
                password: data.password,
                registrationCode: data.registrationCode
            })
            toast.success('¡Registro exitoso! Iniciando sesión...')
            router.push('/login')
        } catch (error: any) {
            toast.error(error.message || 'Error al registrar el negocio')
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

                        <div className="space-y-8">
                            <h1 className="text-6xl font-black tracking-tighter leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                                Empieza tu <br />
                                <span className="text-[hsl(var(--secondary))] italic">legado digital.</span>
                            </h1>
                            <p className="text-xl text-white/60 leading-relaxed max-w-md font-medium">
                                Únete a miles de negocios que confían en InventoryPro para escalar su operación con elegancia y control absoluto.
                            </p>

                            <div className="space-y-4 pt-8">
                                {[
                                    "Prueba gratuita de 7 días",
                                    "Sin necesidad de tarjeta de crédito",
                                    "Configuración instantánea"
                                ].map((text, i) => (
                                    <div key={i} className="flex items-center gap-4 text-white/80 font-bold text-sm uppercase tracking-widest">
                                        <CheckCircle2 className="w-5 h-5 text-[hsl(var(--secondary))]" />
                                        <span>{text}</span>
                                    </div>
                                ))}
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
                            Crea tu Cuenta
                        </h2>
                        <p className="text-[hsl(var(--muted))] font-medium">Empieza a gestionar tu negocio hoy mismo</p>
                    </div>

                    <Card className="border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] overflow-hidden bg-[hsl(var(--surface))]">
                        <CardContent className="p-8 md:p-10">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="font-bold text-[10px] uppercase tracking-widest text-[hsl(var(--muted))]">Nombre</Label>
                                        <div className="relative">
                                            <Input
                                                {...register('name')}
                                                placeholder="Tu nombre"
                                                className={`h-12 rounded-xl border-2 pl-10 bg-transparent ${errors.name ? 'border-red-500' : 'border-[hsl(var(--border))]'}`}
                                            />
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted))]" />
                                        </div>
                                        {errors.name && <span className="text-[10px] text-red-500 font-bold">{errors.name.message}</span>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-bold text-[10px] uppercase tracking-widest text-[hsl(var(--muted))]">Negocio</Label>
                                        <div className="relative">
                                            <Input
                                                {...register('businessName')}
                                                placeholder="Nombre negocio"
                                                className={`h-12 rounded-xl border-2 pl-10 bg-transparent ${errors.businessName ? 'border-red-500' : 'border-[hsl(var(--border))]'}`}
                                            />
                                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted))]" />
                                        </div>
                                        {errors.businessName && <span className="text-[10px] text-red-500 font-bold">{errors.businessName.message}</span>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="font-bold text-[10px] uppercase tracking-widest text-[hsl(var(--muted))]">Email Profesional</Label>
                                    <div className="relative">
                                        <Input
                                            {...register('email')}
                                            type="email"
                                            placeholder="nombre@empresa.com"
                                            className={`h-12 rounded-xl border-2 pl-10 bg-transparent ${errors.email ? 'border-red-500' : 'border-[hsl(var(--border))]'}`}
                                        />
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted))]" />
                                    </div>
                                    {errors.email && <span className="text-[10px] text-red-500 font-bold">{errors.email.message}</span>}
                                </div>

                                <div className="space-y-2">
                                    <Label className="font-bold text-[10px] uppercase tracking-widest text-[hsl(var(--muted))]">Código de Invitación</Label>
                                    <div className="relative">
                                        <Input
                                            {...register('registrationCode')}
                                            placeholder="INV-XXXX-XXXX"
                                            className={`h-12 rounded-xl border-2 pl-10 font-mono tracking-wider bg-transparent ${errors.registrationCode ? 'border-red-500' : 'border-[hsl(var(--border))]'}`}
                                        />
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted))]" />
                                    </div>
                                    {errors.registrationCode && <span className="text-xs text-red-500 font-bold">{errors.registrationCode.message}</span>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="font-bold text-[10px] uppercase tracking-widest text-[hsl(var(--muted))]">Contraseña</Label>
                                        <div className="relative">
                                            <Input
                                                {...register('password')}
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                className={`h-12 rounded-xl border-2 pl-10 pr-10 bg-transparent ${errors.password ? 'border-red-500' : 'border-[hsl(var(--border))]'}`}
                                            />
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted))]" />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                        {errors.password && <span className="text-[10px] text-red-500 font-bold">{errors.password.message}</span>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="font-bold text-[10px] uppercase tracking-widest text-[hsl(var(--muted))]">Confirmar</Label>
                                        <div className="relative">
                                            <Input
                                                {...register('confirmPassword')}
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                className={`h-12 rounded-xl border-2 pl-10 pr-10 bg-transparent ${errors.confirmPassword ? 'border-red-500' : 'border-[hsl(var(--border))]'}`}
                                            />
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted))]" />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] transition-colors"
                                            >
                                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                        {errors.confirmPassword && <span className="text-[10px] text-red-500 font-bold">{errors.confirmPassword.message}</span>}
                                    </div>
                                </div>

                                <Button type="submit" className="w-full h-14 md:h-16 text-lg font-black rounded-2xl bg-[hsl(var(--primary))] text-white shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all pt-1" disabled={loading}>
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="animate-spin text-xl">⚙️</span>
                                            Creando Cuenta...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            Empezar Gratis <ArrowRight className="w-5 h-5" />
                                        </span>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="mt-8 text-center">
                        <p className="text-[hsl(var(--muted))] font-medium">
                            ¿Ya tienes una cuenta?{' '}
                            <Link
                                href="/login"
                                className="font-black text-[hsl(var(--primary))] hover:text-[hsl(var(--primary-dark))] transition-colors underline underline-offset-4"
                            >
                                Inicia sesión
                            </Link>
                        </p>
                    </div>

                    <p className="mt-12 text-[10px] text-center text-[hsl(var(--muted))] leading-relaxed px-10">
                        Al registrarte, aceptas nuestros <Link href="#" className="underline">Términos de Servicio</Link> y <Link href="#" className="underline">Política de Privacidad</Link>.
                    </p>
                </div>
            </div>
        </div>
    )
}

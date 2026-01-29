'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Link from 'next/link'
import { api } from '@/lib/backend'
import { Eye, EyeOff } from 'lucide-react'

const registerSchema = z.object({
    userName: z.string().min(2, 'Nombre muy corto'),
    businessName: z.string().min(3, 'Nombre de negocio muy corto'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres'),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema)
    })

    const onSubmit = async (data: RegisterFormValues) => {
        setLoading(true)
        try {
            await api.auth.registerBusiness(data)

            toast.success('¡Registro exitoso! Revisa tu email para confirmar (si aplica) o inicia sesión.')
            router.push('/login')

        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen">
            {/* Left Side - Branding & Illustration */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[hsl(var(--foreground))] via-[hsl(var(--primary-dark))] to-[hsl(var(--secondary))]">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl animate-float"></div>
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-[hsl(var(--accent))] rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
                </div>

                <div className="relative z-10 flex flex-col justify-center px-16 text-white">
                    <div className="animate-slide-in">
                        <h1 className="text-5xl font-bold mb-6" style={{ fontFamily: 'var(--font-display)' }}>
                            Gestiona tu Negocio con Inteligencia
                        </h1>
                        <p className="text-xl text-white/90 mb-8 leading-relaxed">
                            Sistema completo para administrar inventario, ventas y catálogo digital.
                            Todo en un solo lugar, diseñado para el éxito de tu negocio.
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                    <span className="text-2xl">📦</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Control de Inventario</h3>
                                    <p className="text-white/70 text-sm">Gestión en tiempo real de múltiples bodegas</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                    <span className="text-2xl">💰</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Análisis de Ventas</h3>
                                    <p className="text-white/70 text-sm">Reportes detallados y métricas de rendimiento</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                    <span className="text-2xl">🌐</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Catálogo Digital</h3>
                                    <p className="text-white/70 text-sm">Presencia online automática y actualizada</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Registration Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-[hsl(var(--background))]">
                <div className="w-full max-w-md animate-scale-in">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                            Crear Cuenta
                        </h2>
                        <p className="text-[hsl(var(--muted))]">Comienza tu transformación digital</p>
                    </div>

                    <Card>
                        <CardContent className="pt-6">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="userName">Tu Nombre</Label>
                                    <Input
                                        id="userName"
                                        placeholder="Juan Pérez"
                                        {...register('userName')}
                                        className={errors.userName ? 'border-red-500' : ''}
                                    />
                                    {errors.userName && <p className="text-red-600 text-xs font-medium mt-1">{errors.userName.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="businessName">Nombre del Negocio</Label>
                                    <Input
                                        id="businessName"
                                        placeholder="Mi Tienda"
                                        {...register('businessName')}
                                        className={errors.businessName ? 'border-red-500' : ''}
                                    />
                                    {errors.businessName && <p className="text-red-600 text-xs font-medium mt-1">{errors.businessName.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Corporativo</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="contacto@mitienda.com"
                                        {...register('email')}
                                        className={errors.email ? 'border-red-500' : ''}
                                    />
                                    {errors.email && <p className="text-red-600 text-xs font-medium mt-1">{errors.email.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Contraseña</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            {...register('password')}
                                            className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(120,115,110)] hover:text-[rgb(25,35,25)] transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-red-600 text-xs font-medium mt-1">{errors.password.message}</p>}
                                </div>

                                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="animate-spin">⚙️</span>
                                            Creando cuenta...
                                        </span>
                                    ) : (
                                        'Crear Cuenta'
                                    )}
                                </Button>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-sm text-[hsl(var(--muted))]">
                                    ¿Ya tienes cuenta?{' '}
                                    <Link href="/login" className="font-semibold text-[hsl(var(--primary))] hover:text-[hsl(var(--primary-dark))] underline-offset-4 hover:underline transition-colors">
                                        Inicia sesión
                                    </Link>
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <p className="text-center text-xs text-[hsl(var(--muted))] mt-6">
                        Al registrarte, aceptas nuestros términos de servicio y política de privacidad
                    </p>
                </div>
            </div>
        </div>
    )
}

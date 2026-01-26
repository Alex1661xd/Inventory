# Estructura del Proyecto Backend (NestJS + Supabase + Prisma)

Este documento detalla la arquitectura actual del backend, enfocándose en la autenticación, la gestión de la base de datos y la organización de módulos.

## 📂 Árbol de Directorios Principal

```
backend/src/
├── app.module.ts            # Módulo raíz de la aplicación
├── main.ts                  # Punto de entrada
│
├── auth/                    # Módulo de Autenticación
│   ├── decorators/
│   │   └── get-tenant-id.decorator.ts  # Decorador para extraer tenantId
│   ├── dto/
│   │   └── register-business.dto.ts    # DTO para registro de negocio
│   ├── guards/
│   │   └── get-tenant.guard.ts         # Guard que protege y carga el tenant
│   ├── strategies/
│   │   └── supabase.strategy.ts        # Estrategia JWT (Supabase + Prisma)
│   ├── auth.controller.ts   # Endpoints de Auth
│   ├── auth.module.ts       # Configuración del módulo de Auth
│   └── auth.service.ts      # Lógica de negocio (Registro transaccional)
│
├── prisma/                  # Módulo de Base de Datos
│   ├── prisma.module.ts     # Módulo global de Prisma
│   └── prisma.service.ts    # Servicio extendido de PrismaClient
│
└── supabase/                # Módulo Cliente de Supabase
    ├── supabase.module.ts   # Módulo global de Supabase
    └── supabase.service.ts  # Inicialización del cliente (Service Role)
```

## 🔐 Autenticación y Seguridad

La autenticación combina **Supabase Auth** (para identidad) con nuestra base de datos **Prisma** (para datos del negocio/tenant).

### 1. SupabaseStrategy (`src/auth/strategies/supabase.strategy.ts`)
Esta es la pieza central de la seguridad.
- **Valida el Token**: Recibe el Bearer Token y llama a `supabase.auth.getUser()`.
- **Carga el Contexto**: Si el token es válido, busca al usuario en la base de datos local (PostgreSQL vía Prisma).
- **Inyecta el Usuario**: Devuelve el objeto `User` completo (incluyendo su relación `tenant`), que queda disponible en `request.user`.

### 2. GetTenantGuard (`src/auth/guards/get-tenant.guard.ts`)
- Extiende `AuthGuard('jwt')`.
- Al proteger una ruta con este Guard, garantizamos que:
  1. El usuario tiene un token válido.
  2. El usuario existe en nuestra base de datos.
  3. El objeto `request.user` tiene la información del Tenant cargada.

### 3. @GetTenantId() (`src/auth/decorators/get-tenant-id.decorator.ts`)
- Un decorador personalizado para facilitar el acceso al ID del tenant en los controladores.
- Uso: `findAll(@GetTenantId() tenantId: string)`

## 🔄 Flujo de Registro (Transaction)

El servicio `AuthService` (`registerBusiness`) maneja la creación de cuentas completas mediante una **Transacción Atómica**:

1. **Supabase Auth**: Crea el usuario en el sistema de identidad de Supabase.
2. **Prisma Transaction**:
   - Crea el **Tenant** (Empresa).
   - Crea el **User** local vinculado al Tenant y con el ID de Supabase.
   - Crea un **Warehouse** ("Bodega Principal") inicial.

Si algo falla en el paso 2, la transacción se revierte (aunque el usuario de Supabase podría quedar creado, se maneja el error).

## 🛠️ Tecnologías Clave

- **NestJS**: Framework principal.
- **Prisma ORM**: Acceso a datos.
- **Supabase Auth**: Proveedor de identidad.
- **Passport**: Middleware de autenticación.
- **PostgreSQL**: Base de datos relacional.

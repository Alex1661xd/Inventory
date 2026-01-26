# Estructura Completa del Frontend (Next.js 15 + Supabase SSR)

Este documento detalla la organización de archivos, componentes y la lógica de autenticación del frontend.

## 📂 Árbol de Directorios

```text
frontend/
├── app/
│   ├── (admin)/                # Zona Protegida (Dashboard)
│   │   ├── dashboard/
│   │   │   └── page.tsx        # Panel principal administrativo
│   │   └── layout.tsx          # Verificación de sesión (Server-side)
│   ├── (public)/               # Zona Abierta (Visitantes)
│   │   ├── login/
│   │   │   └── page.tsx        # Formulario de inicio de sesión
│   │   ├── register/
│   │   │   └── page.tsx        # Registro de negocio (vía NestJS)
│   │   └── page.tsx            # Landing Page / Catálogo público
│   ├── favicon.ico
│   ├── globals.css             # Estilos globales y Tailwind
│   └── layout.tsx              # Layout raíz (Toaster, Fuentes, etc.)
├── components/
│   └── ui/                     # Componentes de diseño (Shadcn-style)
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       └── label.tsx
├── lib/
│   └── utils.ts                # Utilidad cn() para clases de Tailwind
├── public/                     # Archivos estáticos
├── utils/
│   └── supabase/               # Configuración de @supabase/ssr
│       ├── client.ts           # Cliente para Browser (createBrowserClient)
│       └── server.ts           # Cliente para Server (createServerClient + Cookies)
├── .env.local                  # Variables de entorno
├── next.config.ts              # Configuración de Next.js
├── package.json                # Dependencias (Next 15, SSR, Tailwind 4)
└── tsconfig.json               # Configuración de TypeScript
```

## 🔐 Detalles de Implementación

### 1. Autenticación Moderna (@supabase/ssr)
Hemos migrado de `auth-helpers` a la librería oficial `@supabase/ssr` para garantizar compatibilidad con Next.js 15 y el App Router:
- **Client Components**: Se usa `createBrowserClient` desde `utils/supabase/client.ts`.
- **Server Components/Layouts**: Se usa `createServerClient` desde `utils/supabase/server.ts`, el cual gestiona automáticamente las cookies de sesión.

### 2. Protección de Rutas
La carpeta `(admin)` está protegida por su `layout.tsx`. Este layout verifica la sesión en el servidor:
```typescript
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) redirect('/login');
```

### 3. Registro de Negocio (Backend Integration)
El registro no se hace directamente con Supabase en el cliente, sino que se envía a nuestro backend NestJS (`POST /auth/register-business`) para asegurar que el usuario, el Tenant (empresa) y la bodega inicial se creen en una sola transacción atómica.

### 4. Interfaz de Usuario
- **Tailwind CSS**: Usado para todo el diseño dinámico.
- **Sonner**: Implementado para mostrar notificaciones interactivas ("Registro exitoso", "Error de login", etc.).
- **Diseño Responsivo**: Todos los componentes de `ui/` están preparados para dispositivos móviles y escritorio.

# Gestor de Inventario SaaS

Proyecto SaaS de gestion de inventario para cualquier tipo de negocio (no limitado a muebleria).  
Centraliza catalogo, stock, ventas, compras, almacenes, usuarios y trazabilidad operativa en una sola plataforma.

## Que hace este proyecto
- Gestiona productos, categorias, clientes, proveedores y sedes.
- Controla inventario por almacen con movimientos y kardex.
- Soporta operaciones de venta (POS), compras y traslados internos.
- Incluye vistas por rol (admin, vendedor y publico/catalogo).
- Permite consulta y lectura de codigos de barras.
- Ofrece reportes operativos para seguimiento del negocio.
- Mantiene auditoria de acciones clave del sistema.

## Herramientas y tecnologias
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, Radix UI, Lucide Icons, Sonner.
- **Backend**: NestJS, TypeScript, Prisma ORM.
- **Datos e integraciones**: PostgreSQL (via Prisma), Supabase (autenticacion/servicios), Redis (cache), Google APIs (modulos de respaldo/automatizacion).
- **Utilidades**: ZXing (scanner), JsBarcode (generacion de codigos), date-fns, react-hook-form, zod.

## Arquitectura general
- `frontend/`: interfaz web y experiencia por rol.
- `backend/`: API, logica de negocio y acceso a datos.
- Monorepo con separacion clara entre capa de presentacion y capa de servicios.

## Funcionalidades principales
- Dashboard con metricas y accesos rapidos.
- Gestion de productos (imagenes, precios, codigos, variantes y combos).
- Inventario multi-almacen con ajustes, valuacion y kardex.
- Ventas (POS), historial de ventas y control de caja.
- Compras, proveedores y entrada de mercancia.
- Traslados entre sedes.
- Gestion de clientes y vendedores.
- Catalogo publico para visualizacion comercial.
- Registro de auditoria para eventos relevantes.


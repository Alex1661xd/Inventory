# Documentación del Módulo de Vendedores (Seller Module)

Este documento detalla la implementación, arquitectura y funcionalidades del módulo de vendedores para el sistema SaaS de Mueblería.

## 1. Visión General

El módulo de vendedores permite a los empleados (con rol `SELLER`) realizar operaciones de venta diarias, gestionar clientes y consultar el catálogo de productos. Está diseñado para ser **mobile-first**, permitiendo su uso eficiente desde dispositivos móviles o tablets en el punto de venta, así como en computadoras de escritorio.

## 2. Arquitectura y Estructura

### Backend (NestJS + Prisma)

El backend soporta el módulo a través de varios controladores y servicios, todo bajo una arquitectura multi-tenant (cada empresa tiene sus datos aislados por `tenantId`).

*   **Modelos de Base de Datos (Prisma)**:
    *   `User`: Soporta el rol `SELLER`.
    *   `Invoice`: Registra las ventas. Incluye estados `PAID` (Pagada), `PENDING` (Pausada/Pendiente), y `CANCELLED` (Eliminada/Cancelada).
    *   `InvoiceItem`: Detalle de productos en una factura (snapshot de precio y cantidad).
    *   `Customer`: Clientes registrados por la empresa.
    *   `Product`: Catálogo de productos (con validación de stock).

*   **Endpoints Principales**:
    *   `GET /users`: Listar usuarios (filtrado por rol en frontend).
    *   `POST /users`: Crear nuevos vendedores.
    *   `POST /invoices`: Crear una venta (Pagada o Pendiente).
    *   `GET /invoices`: Historial de ventas.
    *   `GET /invoices/:id`: Detalle de una venta (usado para reanudar).
    *   `POST /invoices/:id/cancel`: Cancelar una venta (marca el estado como `CANCELLED`).
    *   `GET /customers`: Gestión de clientes.

### Frontend (Next.js + Tailwind)

El frontend para vendedores vive bajo el *route group* `(seller)` (no visible en la URL final). Utiliza un layout diferenciado del administrador para simplificar la interfaz.

*   **Rutas**:
    *   `/pos`: Punto de Venta (Interfaz principal).
    *   `/sales`: Historial de Ventas y Ventas Pendientes.
    *   `/customers`: Gestión de Clientes.
    *   `/products`: Consulta de productos y stock total (modo solo lectura).

## 3. Funcionalidades Detalladas

### 3.1 Gestión de Vendedores (Vista Admin)
Ubicación: `/dashboard/sellers`
*   **Listado**: Visualización de tarjetas con los vendedores activos.
*   **Creación/Edición**: Formulario para registrar nombre, email y contraseña.
*   **Eliminación**: Revocación de acceso inmediata.

En el módulo Admin, esta pantalla convive con el manejo de catálogo e inventario:
*   `/dashboard/products`: Gestión completa de productos (crear/editar/eliminar).
*   `/dashboard/inventory`: Gestión y ajuste de stock por almacén.

### 3.2 Punto de Venta (POS)
Ubicación: `/pos`
Diseñado para ser responsivo, comportándose diferente en movil y escritorio.

*   **Flujo Móvil (Stepper)**:
    1.  **Selección de Cliente**: Buscador o creación rápida de cliente.
    2.  **Selección de Productos**: Buscador, escaneo de códigos de barra, ajuste de cantidades.
    3.  **Pago y Confirmación**: Resumen y selección de método de pago.
*   **Flujo Escritorio**:
    *   Vista de dos columnas: Catálogo a la izquierda, Carrito a la derecha.
*   **Persistencia de Ventas (Pausar/Reanudar)**:
    *   **Pausar**: Permite guardar una venta en curso en la base de datos (Estado `PENDING`). Esto libera el POS para atender a otro cliente.
    *   **Persistencia Real**: Las ventas pausadas se guardan en el servidor, permitiendo pausar en un dispositivo (ej. celular) y reanudar en otro (ej. PC de caja).

Nota: el POS requiere seleccionar un `warehouseId` (almacén) para validar stock y descontarlo al confirmar ventas `PAID`.

### 3.3 Historial de Ventas
Ubicación: `/sales`
*   **Pestañas**:
    *   **Finalizadas**: Lista de ventas completadas (`PAID`). Muestra fecha, cliente y total.
    *   **Pendientes**: Lista de ventas pausadas (`PENDING`). Muestra cliente, items y monto total.
*   **Acciones en Pendientes**:
    *   **Reanudar**: Carga la venta en el POS para completarla.
    *   **Cancelar**: Marca la venta como `CANCELLED`.

### 3.4 Gestión de Clientes
Ubicación: `/customers`
*   **CRUD Completo**: Crear, Leer, Actualizar y Eliminar clientes.
*   **Campos**: Nombre, Documento/NIT, Email, Teléfono, Dirección.
*   **Integración**: Los clientes creados aquí aparecen inmediatamente en el buscador del POS.

### 3.5 Consulta de Productos (Modo Vendedor)
Ubicación: `/products`
Esta vista reutiliza el mismo componente de catálogo que el Administrador, pero en modo `readOnly`, por lo que el vendedor puede:
*   **Consultar**: Nombre, SKU/código, precio, estado público/privado y stock total.
*   **Filtrar**: Por búsqueda, categoría, rango de precio y estado de stock.
Y el Administrador adicionalmente puede crear/editar/eliminar productos desde `/dashboard/products`.

## 4. Tecnologías Clave Usadas
*   **Estado Local**: React `useState` y `useEffect` para manejo ágil del carrito.
*   **Persistencia de Datos**: API Rest contra PostgreSQL (Supabase).
*   **UI Components**: `shadcn/ui` (Cards, Dialogs, Buttons, Inputs, Steppers customizados).
*   **Iconografía**: `lucide-react`.

## 5. Guía de Uso Rápido
1.  **Entrar como Vendedor**: Usar credenciales creadas por el admin.
2.  **Iniciar Venta**: Ir a POS.
3.  **Agregar Productos**: Escanear o buscar.
4.  **Pausar (Opcional)**: Si el cliente va a buscar algo más, dar click en "Pausar Venta".
5.  **Cobrar**: Seleccionar cliente, método de pago y confirmar.
6.  **Ver Ventas**: Ir a Historial para ver el resumen del día.

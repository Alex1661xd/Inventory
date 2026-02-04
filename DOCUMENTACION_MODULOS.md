# Documentación de Módulos: Proveedores y Flujo de Caja

Este documento detalla la implementación y el funcionamiento de los nuevos módulos integrados en el sistema **Mueblería SaaS**.

---

## 1. Módulo de Proveedores (Purchasing Phase 1)

### Propósito
Permitir la gestión centralizada de los proveedores que suministran mercancía a los almacenes del sistema.

### Funcionalidades
*   **Gestión Centralizada**: El administrador puede crear, ver, editar y eliminar proveedores.
*   **Información de Contacto**: Almacena nombre de empresa, nombre de contacto, correo, teléfono, dirección y número de documento (RUC/NIT).
*   **Integración**: Base necesaria para el próximo módulo de "Órdenes de Compra".

### Cómo funciona
1.  **Acceso**: Desde el panel de administrador, en la barra lateral, seleccionar **Proveedores**.
2.  **Registro**: Al crear un proveedor, se valida que los datos básicos estén presentes.
3.  **Visualización**: Una tabla moderna muestra la lista de proveedores con opciones rápidas de edición y borrado.

### Detalles Técnicos
*   **Modelo de Datos**: `Supplier` en Prisma, vinculado por `tenantId` para multi-tenancy.
*   **Frontend**: Implementado en `frontend/app/(admin)/dashboard/suppliers/page.tsx` usando componentes de Shadcn/UI.

---

## 2. Módulo de Flujo de Caja (Cash Flow)

### Propósito
Controlar el dinero en efectivo que entra y sale de los puntos de venta (POS) mediante turnos de trabajo (Shifts), garantizando que el dinero reportado por el vendedor coincida con el registrado por el sistema.

### Funcionamiento del Ciclo de Caja

#### A. Apertura de Caja (Mandatoria)
1.  Cuando un vendedor ingresa al **POS**, el sistema verifica si existe un turno abierto.
2.  Si no hay turno, aparece automáticamente un modal de **Apertura de Caja**.
3.  El vendedor debe ingresar el **Monto Inicial** (base) con el que inicia el turno.
4.  **No se permite realizar ventas hasta que la caja sea abierta.**

#### B. Operación y Ventas
1.  Cada venta realizada con el método de pago **CASH** (Efectivo) se suma automáticamente al balance interno del turno actual.
2.  Las ventas con tarjeta o transferencia no afectan el balance de efectivo (aunque quedan registradas).

#### C. Cierre de Caja (Arqueo)
1.  Al finalizar el día o el turno, el vendedor presiona el botón de **Caja** (ícono 💰).
2.  Se abre el modal de **Cierre de Caja**, donde el vendedor debe contar físicamente el dinero y colocar el **Monto Real**.
3.  El sistema realiza la comparación:
    *   **Monto Esperado** = Monto Inicial + Ventas en Efectivo.
    *   **Diferencia** = Monto Real - Monto Esperado.
4.  Al confirmar el cierre, el turno se marca como `CLOSED` y la sesión del vendedor se cierra por seguridad.

#### D. Supervisión de Administrador
1.  En el dashboard del administrador, en **Arqueos de Caja**, se puede auditar cada turno.
2.  El sistema marca en **rojo** si hubo faltantes y en **azul** si hubo sobrantes.

### Detalles Técnicos
*   **Modelos**: 
    *   `CashShift`: Almacena tiempos, montos iniciales/finales y estado (`OPEN`/`CLOSED`).
    *   `CashTransaction`: (Extensible) Para registrar depósitos o retiros manuales.
*   **Automatización**: Se integró un "Middleware" visual en `frontend/app/(seller)/pos/page.tsx` que detecta el estado de la caja en tiempo real.

---

## 3. Guía de Instalación / Mantenimiento
Si necesitas realizar cambios en la base de datos o lógica:
*   **Schema**: `backend/prisma/schema.prisma`.
*   **Servicio Backend**: `backend/src/modules/cash-flow/`.
*   **Componentes UI**: `frontend/components/pos/cash-control.tsx`.

---
*Documentación generada el 03 de febrero de 2026 por Antigravity AI.*

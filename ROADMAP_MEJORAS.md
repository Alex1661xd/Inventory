# Roadmap para Sistema de Gestión de Inventario Completo (SaaS)

Basado en el análisis de la estructura actual del sistema, se han identificado las siguientes áreas clave que faltan o podrían mejorarse para convertir la aplicación en una solución de gestión de recursos empresariales (ERP) completa y robusta.

## 1. Módulo de Compras y Proveedores (Critico)
Actualmente, el inventario parece alimentarse manualmente o por ajustes. Falta un ciclo formal de reabastecimiento.

*   **Gestión de Proveedores**: Base de datos de proveedores con información de contacto, plazos de pago y calificación.
*   **Órdenes de Compra (Purchase Orders)**:
    *   Generación de pedidos a proveedores.
    *   Recepción de mercancía (convertir Orden de Compra -> Entrada de Inventario).
    *   Control de costos de adquisición (promedio ponderado).
*   **Cuentas por Pagar**: Registro de facturas de proveedores y fechas de vencimiento de pagos.

## 2. Módulo Financiero y Flujo de Caja (Critico para POS)
Es vital saber no solo cuánto se vendió, sino dónde está el dinero y cuánto se gana realmente.

*   **Apertura y Cierre de Caja (Corte de Turno)**:
    *   Control de efectivo inicial y final por vendedor/caja.
    *   Arqueo de caja: Comparación de efectivo real vs. sistema.
    *   Registro de salidas de dinero (retiros, pagos menores).
*   **Registro de Gastos Operativos**:
    *   Categorías de gastos (ej. Renta, Servicios, Nómina, Mantenimiento).
    *   Registro de gastos recurrentes y únicos.
*   **Estado de Resultados (P&L)**: Reporte simple de Ventas - (Costo de Ventas + Gastos) = Utilidad Neta.

## 3. Reportes Avanzados e Inteligencia de Negocio
El dashboard actual ofrece una vista general, pero un administrador necesita profundizar.

*   **Kardex de Inventario**: Historial detallado de cada movimiento (entrada/salida) de un producto específico (Auditoría de stock).
*   **Valoración de Inventario**: ¿Cuánto dinero tengo invertido en bodega hoy? (Costo total del stock administrativo).
*   **Productos Más/Menos Vendidos**: Análisis de Pareto (80/20) para optimizar compras.
*   **Reportes de Márgenes**: Beneficio por producto, por categoría y por vendedor.
*   **Reporte de Stock Bajo/Crítico**: Alertas automáticas o lista para generar órdenes de compra.


## 5. Auditoría y Seguridad
*   **Logs de Actividad**: Registro de "quién hizo qué y cuándo" (especialmente para ediciones de stock, eliminaciones y descuentos).
*   **Roles y Permisos Granulares**: Definir exactamente qué puede hacer cada vendedor (ej. ¿puede hacer descuentos? ¿puede ver costos?).

## 6. Mejoras en Inventario (Multialmacén)
Dado que ya existen los almacenes (`warehouses`) y transferencias (`transfers`):

*   **Ajustes de Inventario (Mermas/Pérdidas)**: Módulo específico para registrar roturas, robos o vencimientos, diferenciándolos de las ventas.
*   **Inventario Físico (Toma de Inventario)**: Herramienta para "congelar" el sistema y realizar el conteo físico, generando automáticamente los ajustes de diferencias.

---

### Resumen de Prioridades Recomendadas

1.  **1º Prioridad**: Flujo de Caja (Cortes de caja). Es fundamental para evitar robos y descontrol de efectivo en el día a día.
2.  **2º Prioridad**: Gastos y Reporte de Utilidad. Para saber si el negocio es rentable.
3.  **3º Prioridad**: Compras y Proveedores. Para organizar el reabastecimiento.

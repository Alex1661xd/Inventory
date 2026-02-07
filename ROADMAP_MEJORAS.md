# Roadmap para Sistema de Gestión de Inventario Completo (SaaS)

Basado en el análisis de la estructura actual del sistema, se han identificado las siguientes áreas clave que faltan o podrían mejorarse para convertir la aplicación en una solución de gestión de recursos empresariales (ERP) completa y robusta.

---

## ✅ 1. Módulo de Compras y Proveedores (**IMPLEMENTADO**)
Este módulo ya ha sido integrado para formalizar el ciclo de reabastecimiento.

*   **Gestión de Proveedores** (✅): Base de datos completa con contacto, dirección, identificación tributaria y términos de pago.
*   **Órdenes de Compra / Recepción**: Se integró la capacidad de registrar proveedores vinculados al tenant.
*   **Estado**: El backend ya soporta la relación `Supplier` y el frontend cuenta con el módulo de gestión.

## ✅ 2. Módulo Financiero y Flujo de Caja (**IMPLEMENTADO**)
Se ha robustecido el POS para garantizar que el dinero físico coincida con el sistema.

*   **Apertura y Cierre de Caja (Corte de Turno)** (✅): 
    *   **Implementación**: Se crearon los diálogos `CashOpenDialog` y `CashCloseDialog`.
    *   **Lógica**: Al abrir se define una base inicial. Al cerrar, el sistema muestra un resumen detallado (Ventas + Entradas - Salidas) y solicita el arqueo real.
    *   **Seguridad**: El sistema obliga a cerrar sesión al finalizar el turno para garantizar un inicio limpio el día siguiente.
*   **Registro de Movimientos Manuales** (✅):
    *   **Implementación**: Botón "Movimiento" en el POS para registrar **Depósitos, Retiros y Gastos**.
    *   **Visibilidad**: Los movimientos se desglosan en el cierre de caja y en el historial de administración.
*   **Auditoría**: Nueva tabla de "Control de Flujo" para administradores con cálculo de diferencias y promedio de ventas neto.

## ✅ 3. Gastos Operativos y Estado de Resultados (**IMPLEMENTADO**)
Se implementó el módulo de gastos para que el dueño del negocio conozca su utilidad real.

*   **Gastos Operativos** (✅):
    *   **Backend**: Nuevo modelo `Expense` con categorías (Arriendo, Servicios, Nómina, Suministros, Mantenimiento, Transporte, Marketing, Impuestos, Seguros, Otros).
    *   **Endpoints CRUD**: Crear, listar con filtros (fechas, categoría), actualizar y eliminar gastos.
    *   **Relaciones**: Asociación opcional a proveedores y registro de quién creó el gasto.
*   **Estado de Resultados (P&L)** (✅):
    *   **Cálculo Automático**: Ventas - Costo de Mercancía - Gastos Operativos = Utilidad Neta.
    *   **Dashboard Visual**: Tarjetas con gradientes para Ventas, Costo de Ventas, Gastos y Utilidad Neta.
    *   **Reporte Detallado**: Desglose línea a línea del estado de resultados con márgenes.
*   **Frontend**: Nueva página `/dashboard/expenses` con:
    *   Filtros por fecha y categoría.
    *   Tabla de gastos con acciones de eliminar.
    *   Formulario modal para registrar nuevos gastos.

## ✅ 4. Reportes Avanzados e Inteligencia de Negocio (**EN PROGRESO**)
El dashboard ha sido potenciado con trazabilidad profunda.

*   **Kardex de Inventario** (✅): 
    *   **Implementación**: Historial completo por producto y por almacén.
    *   **Funcionalidad**: Registro automático de Ventas, Traslados, Compras y Stock Inicial.
    *   **Control**: Registro de Usuario responsable en cada movimiento manual.
    *   **Interfaz**: Modal de alta precisión con paginación y alternancia entre vista local (almacén) y global.
*   **Ajustes de Inventario (Mermas/Daños)** (✅): 
    *   **Motivos**: Capacidad de clasificar salidas por Daño, Devolución o Ajuste técnico.
    *   **Inteligencia**: El formulario de actualización filtra motivos según si es entrada o salida.
*   **Valoración de Inventario** (✅): Reporte financiero en tiempo real del capital invertido (Costo vs Valor Venta) con desglose por bodega.
*   **Alerta de Stock Bajo** (⏳): Sistema de notificaciones cuando un producto baja de cierto umbral.
*   **Productos Más/Menos Vendidos** (⏳): Análisis de Pareto (80/20) para optimizar compras.

## 🔒 5. Auditoría y Seguridad
*   **Logs de Actividad**: Registro de "quién hizo qué" (ediciones de stock o eliminación de facturas).
*   **Roles Granulares**: Limitar qué vendedores pueden ver costos de compra o aplicar descuentos manuales.

## 🏗️ 6. Mejoras en Inventario (Multialmacén)
*   **Ajustes de Inventario** (✅): Implementado con trazabilidad en Kardex.
*   **Toma de Inventario Físico** (⏳): Herramienta para comparar conteos manuales vs. sistema en bloque.
*   **Módulo de Traslados** (✅): Implementado con registro doble en Kardex (Salida origen / Entrada destino).

---

### Resumen de Avance

| Módulo | Estado | Descripción |
|--------|--------|-------------|
| Flujo de Caja | ✅ 100% | Apertura, cierre, movimientos manuales y arqueo |
| Proveedores | ✅ 100% | Backend y Frontend funcionales |
| **Kardex** | ✅ 100% | Trazabilidad completa, motivos de daño y vista global/local |
| Ventas | ✅ 100% | Con capacidad de pausar, resumir y anular |
| **Gastos y P&L** | ✅ 100% | Registro de gastos operativos y estado de resultados |

---

### 🔧 Instrucciones para Activar el Módulo de Gastos

1. **Ejecutar migración de base de datos**:
   ```bash
   cd backend
   npx prisma migrate dev --name add_expense_model
   # O si falla la conexión directa:
   npx prisma db push
   npx prisma generate
   ```

2. **Reiniciar el backend** para que cargue los nuevos endpoints.

3. **Acceder al módulo**: En el panel de administración, buscar **"💰 Gastos y Utilidad"** en el menú lateral.

---

**🎯 Próxima prioridad sugerida**: Implementar las **Alertas de Stock Bajo** (notificaciones de reabastecimiento) y el **Ranking de Productos** (Pareto) para optimizar el flujo de caja.

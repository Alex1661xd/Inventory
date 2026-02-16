# Revision tecnica: Redis y optimizacion general

Fecha: 16 de febrero de 2026
Proyecto: `muebleria-saas`
Alcance: backend NestJS + Prisma + Redis cache, y frontend Next.js (flujo de consumo de APIs).
Metodologia: revision estatica de codigo y arquitectura. No se ejecutaron pruebas de carga ni profiling runtime en este analisis.

## 1. Resumen ejecutivo

Estado general:
- El producto ya tiene una base buena de cache multi-tenant (claves por tenant, TTLs por dominio e invalidacion post-escritura en varios modulos).
- Hay oportunidades claras para mejorar consistencia y escalabilidad sin comprometer la integridad de negocio.

Riesgos principales encontrados:
- Invalidador por patron usando `KEYS` en Redis (costo O(N), bloqueante).
- Invalidador de cache dentro de transacciones en algunos flujos (riesgo de re-cachado stale antes de commit).
- Calculo de zona horaria en analytics con logica manual que puede producir fechas incorrectas.
- Consultas pesadas sin paginacion real en ciertos endpoints (gastos/BI), con impacto creciente a medida que aumenten datos.

## 2. Hallazgos criticos

### C1. Invalidador por patron usa `KEYS` en rutas de escritura

Evidencia:
- `backend/src/cache/cache.service.ts:58`
- `backend/src/cache/cache.service.ts:60`
- `backend/node_modules/cache-manager-redis-yet/dist/index.js:113`

Impacto:
- `KEYS` bloquea Redis mientras recorre todo el keyspace.
- En picos de escritura puede degradar latencia global de cache y provocar timeouts.

Recomendacion:
- Reemplazar invalidacion por `KEYS` con versionado de namespace por tenant/recurso.
- Ejemplo operativo: clave de datos incluye version (`tenant:{id}:products:v{n}:...`) y al invalidar solo se incrementa `v{n}`.
- Si se requiere barrido, usar `SCAN` + `UNLINK` en lotes y fuera de ruta critica.

### C2. Invalidador dentro de transaccion en flujos sensibles

Evidencia:
- `backend/src/inventory/inventory.service.ts:31`
- `backend/src/inventory/inventory.service.ts:162`
- `backend/src/inventory/inventory.service.ts:163`
- `backend/src/purchases/purchases.service.ts:300`
- `backend/src/purchases/purchases.service.ts:338`
- `backend/src/purchases/purchases.service.ts:339`

Impacto:
- Puede ocurrir este race: invalidacion -> otro request re-calienta cache con estado antiguo -> commit de transaccion -> cache queda stale hasta TTL.

Recomendacion:
- Mover toda invalidacion a post-commit (fuera de `$transaction`), consistente con lo que ya hacen en `updateStock` y `create purchase`.
- Estandarizar un patron de "Domain Event -> Cache Invalidator" para evitar inconsistencias.

### C3. Calculo de timezone en analytics es incorrecto para varios casos

Evidencia:
- `backend/src/analytics/analytics.service.ts:49`
- `backend/src/analytics/analytics.service.ts:50`
- `backend/src/analytics/analytics.service.ts:54`
- `backend/src/analytics/analytics.service.ts:55`
- `backend/src/analytics/analytics.service.ts:140`
- `backend/src/analytics/analytics.service.ts:163`

Impacto:
- Se usa `absOffset` y luego ajustes fijos de `-5`, lo que rompe periodos para zonas positivas, DST y offsets no enteros (ej. `GMT+5:30`).
- Puede distorsionar ventas por dia y corte de periodos en reportes financieros.

Recomendacion:
- Eliminar aritmetica manual de horas.
- Migrar a conversion zoned robusta (IANA timezone real) para rangos de fecha y agrupacion diaria.

## 3. Hallazgos altos

### A1. Busqueda de proveedores usa campo inexistente

Evidencia:
- `backend/src/suppliers/suppliers.service.ts:41`
- `backend/prisma/schema.prisma:382`
- `backend/prisma/schema.prisma:389`

Impacto:
- `docNumber` no existe en `Supplier`; al buscar puede disparar error de Prisma.
- En frontend la busqueda esta activa (`frontend/app/(admin)/dashboard/suppliers/page.tsx:59`), por lo que impacta uso real.

Recomendacion:
- Reemplazar por `taxId` y/o `contactName`.
- Agregar prueba de busqueda de proveedores con termino libre.

### A2. `expenses.findAll` pagina en memoria despues de traer todo

Evidencia:
- `backend/src/expenses/expenses.service.ts:88`
- `backend/src/expenses/expenses.service.ts:138`
- `backend/src/expenses/expenses.service.ts:143`

Impacto:
- Escala mal: costo lineal en memoria/CPU por request.
- El cache de este endpoint tambien termina almacenando resultados construidos con merge completo.

Recomendacion:
- Pasar paginacion al SQL.
- Opciones: vista materializada/consulta unificada para `Expense` + `CashTransaction` o endpoints separados con agregacion en cliente de forma controlada.

### A3. Cobertura de invalidacion incompleta para datos derivados

Evidencia:
- `backend/src/customers/customers.service.ts:16`
- `backend/src/invoices/invoices.service.ts:239`
- `backend/src/invoices/invoices.service.ts:279`
- `backend/src/users/users.service.ts:78`
- `backend/src/warehouses/warehouses.service.ts:53`
- `backend/src/analytics/analytics.service.ts:74`
- `backend/src/analytics/analytics.service.ts:209`
- `backend/src/inventory/inventory.service.ts:294`
- `backend/src/inventory/inventory.service.ts:295`
- `backend/src/analytics/analytics.service.ts:107`

Impacto:
- Cambios de cliente/usuario/almacen/inventario pueden dejar caches de facturas o BI desactualizados hasta el TTL.

Recomendacion:
- Definir matriz de dependencias de cache por dominio.
- Ejemplo minimo:
- Cambio en `Customer` invalida `invoices:list/*` y `invoices:detail/*`.
- Cambio en `User/Warehouse` invalida `analytics:*` y `invoices:*`.
- Cambio de inventario invalida tambien `analytics:*` (al menos por `deadStock`).

### A4. Estrategia de autenticacion agrega latencia en cada request protegido

Evidencia:
- `backend/src/auth/strategies/supabase.strategy.ts:21`
- `backend/src/auth/strategies/supabase.strategy.ts:28`
- `backend/src/auth/strategies/supabase.strategy.ts:46`

Impacto:
- Cada request protegido hace llamada remota a Supabase + queries locales.
- Eleva p95/p99 y el costo operativo bajo concurrencia.

Recomendacion:
- Verificacion local del JWT (JWKS) + cache corto de `userId -> tenant/role/isBanned`.
- Mantener introspeccion remota solo como fallback o para revocacion puntual.

## 4. Hallazgos medios

### M1. Faltan indices en rutas de consulta criticas

Evidencia:
- `backend/prisma/schema.prisma:329` (modelo `Invoice` sin indices definidos)
- `backend/src/invoices/invoices.service.ts:210`
- `backend/src/invoices/invoices.service.ts:217`
- `backend/src/invoices/invoices.service.ts:247`
- `backend/src/analytics/analytics.service.ts:59`

Impacto:
- Con crecimiento de datos, aumentan full scans y latencia en reportes/listados.

Recomendacion:
- Agregar indices compuestos orientados a filtros reales.
- Minimo recomendado:
- `Invoice(tenantId, status, createdAt)`
- `Invoice(tenantId, sellerId, createdAt)`
- `Invoice(tenantId, invoiceNumber)` como unico por tenant
- `StockBatch(productId, warehouseId, remainingQuantity, entryDate)`
- `CashShift(tenantId, sellerId, status)`

### M2. Overfetching en frontend y endpoints no agregados

Evidencia:
- `frontend/components/products/products-manager.tsx:103`
- `frontend/components/products/products-manager.tsx:130`
- `frontend/app/(admin)/dashboard/inventory/page.tsx:87`
- `frontend/app/(admin)/dashboard/inventory/page.tsx:169`
- `frontend/components/transfers-manager.tsx:45`
- `frontend/app/(seller)/pos/page.tsx:1253`
- `frontend/app/(admin)/dashboard/page.tsx:57`
- `frontend/app/(admin)/dashboard/page.tsx:60`

Impacto:
- Se descargan listas grandes repetidamente, con mas latencia y uso de red/CPU.
- Dashboard calcula "totales" usando solo 100 registros en productos/facturas, lo que sesga metricas.

Recomendacion:
- Crear endpoints agregados para dashboard (`/dashboard/summary`).
- Cargar catalogos estables (warehouses/categories) una sola vez por vista/sesion.
- Reducir payloads de listados (evitar `include` completos cuando no son necesarios).

### M3. Selector de clientes solo trae primera pagina

Evidencia:
- `frontend/components/customer-selector.tsx:65`
- `backend/src/customers/customers.service.ts:60`

Impacto:
- En tenants con >20 clientes, selector queda incompleto.
- Afecta experiencia en POS y puede inducir duplicados.

Recomendacion:
- Implementar busqueda remota paginada en el selector (server-side query as-you-type).

### M4. Manejo de limite/paginacion sin cota uniforme

Evidencia:
- `backend/src/products/products.controller.ts:41`
- `backend/src/invoices/invoices.controller.ts:33`
- `backend/src/customers/customers.controller.ts:28`
- `backend/src/expenses/expenses.controller.ts:39`

Impacto:
- Un `limit` alto puede disparar consultas y payloads excesivos.

Recomendacion:
- Estandarizar DTO de paginacion con `min/max` y defaults globales.

### M5. Logging sin control por entorno en rutas calientes

Evidencia:
- `backend/src/main.ts:43`
- `backend/src/main.ts:44`
- `backend/src/products/products.service.ts:266`

Impacto:
- I/O de logs por request puede aumentar latencia y costo, especialmente en produccion.

Recomendacion:
- Pasar a logger estructurado con niveles y muestreo.
- Deshabilitar request logging verboso en produccion.

### M6. Health check no valida realmente Redis

Evidencia:
- `backend/src/app.controller.ts:24`
- `backend/src/cache/cache.module.ts:38`
- `backend/src/cache/cache.module.ts:42`

Impacto:
- Puede reportarse "ok" con Redis caido y fallback en memoria.

Recomendacion:
- Exponer estado real del store activo y latencia de ping a Redis.

### M7. Riesgo de compatibilidad en stack de cache

Evidencia:
- `backend/package.json` (`cache-manager@^7.2.8` + `cache-manager-redis-yet@^5.1.5`)
- `backend/node_modules/cache-manager-redis-yet/package.json` (depende de `cache-manager:^5.7.6`)

Impacto:
- Riesgo de comportamiento inconsistente/upgrade complejo a futuro.

Recomendacion:
- Planificar migracion a store alineado con `cache-manager >= 6` (ecosistema Keyv).

## 5. Lo que esta bien implementado hoy

- Claves cacheadas por tenant (`backend/src/cache/cache.service.ts:76`), buen aislamiento multi-tenant.
- TTLs diferenciados por dominio (productos, analytics, auditoria, etc.).
- Lecturas de cache en modo fail-open (`get` captura error y no rompe flujo): `backend/src/cache/cache.service.ts:16`.
- Varias invalidaciones ya estan fuera de transaccion (ejemplo `updateStock`): `backend/src/inventory/inventory.service.ts:291`.

## 6. Plan de trabajo sugerido por etapas

### Etapa 1 (impacto inmediato, bajo riesgo)

- Corregir bug de busqueda de proveedores (`docNumber -> taxId/contactName`).
- Mover invalidaciones dentro de transaccion a post-commit (`transferStock`, `addPayment`).
- Limitar `page/limit` en todos los controladores.
- Ajustar health check para validar Redis real.

### Etapa 2 (escalabilidad de cache)

- Reemplazar invalidacion por `KEYS` con versionado de namespace.
- Definir matriz de invalidacion de dependencias cruzadas (customers/users/warehouses/inventory -> invoices/analytics).
- Hacer que fallos de invalidacion nunca rompan operaciones de negocio (`invalidate` con manejo seguro).

### Etapa 3 (rendimiento de datos)

- Refactor de `expenses.findAll` a paginacion en DB.
- Indices compuestos en Prisma segun patrones reales.
- Endpoint agregado de dashboard para evitar sobrecarga de frontend.

### Etapa 4 (observabilidad y calidad)

- Metricas: hit ratio Redis, p95 por endpoint, tiempo de invalidacion, tamano promedio de payload.
- Pruebas automatizadas de:
- invalidacion de cache por dominio
- consistencia post-transaccion
- timezone en analytics
- regresion de proveedores con busqueda

## 7. Riesgo de integridad y criterio de despliegue

Para no comprometer integridad:
- Ninguna optimizacion debe cambiar reglas de negocio de stock/FIFO/facturacion.
- Primero se corrigen invalidaciones y consistencia; luego se optimiza performance.
- Cada cambio de cache debe ir con pruebas de no-stale en escenarios de concurrencia basicos.

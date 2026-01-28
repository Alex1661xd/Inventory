# 🚀 Sistema de Caché con Redis - Mueblería SaaS

## 📋 Resumen

Se ha implementado un sistema de caché distribuido usando **Redis** para optimizar las consultas más frecuentes del sistema y mejorar significativamente el rendimiento de la aplicación.

## 🎯 Objetivos Cumplidos

### Consultas Optimizadas:
1. **Productos** (`/products`)
   - Lista completa de productos con stock total
   - Detalle de producto individual
   - Búsqueda por código de barras (crítico para vendedores)

2. **Categorías** (`/categories`)
   - Lista de categorías (raramente cambian)

3. **Almacenes** (`/warehouses`)
   - Lista de almacenes (raramente cambian)

## ⚡ Beneficios

### Performance:
- **Reducción de carga en PostgreSQL**: Las consultas frecuentes se sirven desde Redis (en memoria)
- **Tiempos de respuesta más rápidos**: Redis puede servir datos en microsegundos vs milisegundos de PostgreSQL
- **Mejor experiencia para vendedores**: El escaneo de códigos de barras es instantáneo

### Escalabilidad:
- **Multi-tenant**: El caché está completamente aislado por tenant
- **Invalidación inteligente**: El caché se invalida automáticamente cuando los datos cambian
- **TTL personalizado**: Cada tipo de dato tiene un tiempo de vida apropiado

## 🔧 Configuración

### 1. Instalar Redis

#### En Windows:
1. **Descarga Redis para Windows**: [Redis-x64](https://github.com/microsoftarchive/redis/releases)
2. Extrae el archivo ZIP
3. Ejecuta `redis-server.exe`

O usando **Chocolatey**:
```powershell
choco install redis-64
redis-server
```

#### En macOS:
```bash
brew install redis
brew services start redis
```

#### En Linux:
```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

#### Usando Docker (Recomendado):
```bash
docker run -d -p 6379:6379 --name redis-muebleria redis:alpine
```

### 2. Configurar Variables de Entorno

Las variables ya están configuradas en el archivo `.env`:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
# REDIS_PASSWORD=  # Descomenta si tu Redis requiere contraseña
```

### 3. Iniciar la Aplicación

```bash
cd backend
npm run start:dev
```

## 📊 Tiempos de Vida del Caché (TTL)

Cada tipo de consulta tiene un TTL óptimo:

| Recurso | TTL | Razón |
|---------|-----|-------|
| **Productos (Lista)** | 5 minutos | Se actualizan con frecuencia |
| **Producto (Detalle)** | 10 minutos | Relativamente estable |
| **Producto (Barcode)** | 3 minutos | Búsqueda muy frecuente por vendedores |
| **Categorías** | 15 minutos | Raramente cambian |
| **Almacenes** | 15 minutos | Raramente cambian |

## 🔐 Aislamiento Multi-Tenant

Cada clave de caché incluye el `tenantId` para garantizar seguridad:

```typescript
// Ejemplo de clave: tenant:abc123:products:list
const cacheKey = this.cacheService.generateKey(tenantId, 'products', 'list');
```

Esto garantiza que:
- **Mueblería A** NO puede ver el caché de **Mueblería B**
- La invalidación de caché es específica por tenant
- Cumple con los requisitos SaaS

## 🔄 Invalidación Automática

El caché se invalida automáticamente cuando:

1. **Se crea un producto** → Invalida lista de productos
2. **Se actualiza un producto** → Invalida lista y detalle del producto
3. **Se elimina un producto** → Invalida lista y detalle del producto
4. **Se crea/actualiza/elimina categoría** → Invalida lista de categorías
5. **Se crea/actualiza/elimina almacén** → Invalida lista de almacenes

## 📈 Monitoreo

### Ver estadísticas de Redis:
```bash
redis-cli INFO stats
```

### Ver claves en caché:
```bash
redis-cli KEYS "tenant:*"
```

### Limpiar todo el caché (desarrollo):
```bash
redis-cli FLUSHALL
```

## 🏗️ Arquitectura

```
┌─────────────┐
│   Frontend  │
└──────┬──────┘
       │
       ↓
┌─────────────┐      ┌──────────┐
│   NestJS    │ ───→ │  Redis   │ ← Caché (ms)
│   Backend   │      └──────────┘
└──────┬──────┘
       │
       ↓
┌─────────────┐
│ PostgreSQL  │ ← Solo si no hay caché
└─────────────┘
```

## 📝 Ejemplo de Uso

### Antes (Sin Caché):
```typescript
async findAll(tenantId: string) {
  return this.prisma.product.findMany({
    where: { tenantId }
  });
  // ~50-200ms cada consulta
}
```

### Después (Con Caché):
```typescript
async findAll(tenantId: string) {
  const cached = await this.cacheService.get(cacheKey);
  if (cached) return cached; // ~1-5ms desde Redis
  
  const products = await this.prisma.product.findMany({
    where: { tenantId }
  }); // ~50-200ms solo la primera vez
  
  await this.cacheService.set(cacheKey, products, 300);
  return products;
}
```

## 🔮 Próximas Mejoras

1. **Caché de inventario en tiempo real** cuando se actualice stock
2. **Caché de reportes y estadísticas** para el dashboard
3. **Rate limiting** usando Redis para proteger APIs
4. **Sesiones distribuidas** si se escala a múltiples servidores

## 🐛 Troubleshooting

### Error: "Connection refused" en Redis
```bash
# Verifica que Redis esté corriendo
redis-cli ping
# Deberías ver: PONG

# Si no responde, inicia Redis:
redis-server
```

### Caché no se invalida
```bash
# Verifica las claves en Redis
redis-cli KEYS "*"

# Limpia manualmente el caché de un tenant
redis-cli DEL "tenant:TENANT_ID:products:list"
```

## 📚 Referencias

- [Redis Documentation](https://redis.io/documentation)
- [cache-manager](https://github.com/node-cache-manager/node-cache-manager)
- [NestJS Caching](https://docs.nestjs.com/techniques/caching)

---

**¡La aplicación ahora está optimizada para manejar miles de consultas simultáneas! 🚀**

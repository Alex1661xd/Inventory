import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
        console.log('🔧 CacheService initialized');
    }

    /**
     * Obtiene un valor del caché
     */
    async get<T>(key: string): Promise<T | undefined> {
        try {
            console.log(`🔍 [CACHE GET] ${key}`);
            const value = await this.cacheManager.get<T>(key);
            console.log(value ? `✅ [CACHE HIT] ${key}` : `❌ [CACHE MISS] ${key}`);
            return value;
        } catch (error) {
            console.error(`🚨 [CACHE GET ERROR] ${key}:`, error.message);
            return undefined;
        }
    }

    /**
     * Guarda un valor en el caché con TTL personalizado
     */
    async set(key: string, value: any, ttl?: number): Promise<void> {
        try {
            // cache-manager-redis-yet usa milisegundos para TTL v5+
            // Si no se pasa TTL, usa el default del store
            const ttlInMs = ttl ? ttl * 1000 : undefined;
            console.log(`💾 [CACHE SET] ${key} (TTL: ${ttl}s -> ${ttlInMs}ms)`);
            // Nota: En versiones recientes de cache-manager, el tercer argumento es TTL en ms
            await this.cacheManager.set(key, value, ttlInMs);
            console.log(`✅ [CACHE SET SUCCESS] ${key}`);
        } catch (error) {
            console.error(`🚨 [CACHE SET ERROR] ${key}:`, error.message);
        }
    }

    /**
     * Invalida una clave específica
     */
    async invalidate(key: string): Promise<void> {
        await this.cacheManager.del(key);
    }

    /**
     * Invalida todas las claves que coincidan con un patrón
     * Nota: Simplificado - invalida solo claves específicas ya que cache-manager
     * no expone un método keys() directo en la versión actual
     */
    async invalidatePattern(pattern: string): Promise<void> {
        try {
            console.log(`🧹 [CACHE INVALIDATE PATTERN] ${pattern}`);
            const store = (this.cacheManager as any).store;

            // Intentar obtener todas las claves si el store lo soporta
            if (typeof store.keys === 'function') {
                const allKeys = await store.keys(pattern);
                if (allKeys && allKeys.length > 0) {
                    console.log(`🗑️ Borrando ${allKeys.length} claves para el patrón: ${pattern}`);
                    await Promise.all(allKeys.map(key => this.cacheManager.del(key)));
                    console.log(`✅ [INVALIDATE PATTERN SUCCESS] ${pattern}`);
                }
            } else {
                console.warn(`⚠️ OJO: El store de caché no soporta búsqueda de claves (necesario para patrones). Se ignoró el patrón: ${pattern}`);
            }
        } catch (error) {
            console.error(`🚨 [CACHE INVALIDATE PATTERN ERROR] ${pattern}:`, error.message);
        }
    }

    /**
     * Genera una clave de caché con tenant para aislamiento
     */
    generateKey(tenantId: string, resource: string, ...params: string[]): string {
        return `tenant:${tenantId}:${resource}:${params.join(':')}`;
    }
}

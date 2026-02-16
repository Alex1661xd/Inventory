import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

const isDev = process.env.NODE_ENV !== 'production';

@Injectable()
export class CacheService {
    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
        if (isDev) console.log('🔧 CacheService initialized');
    }

    /**
     * Obtiene un valor del caché
     */
    async get<T>(key: string): Promise<T | undefined> {
        try {
            const value = await this.cacheManager.get<T>(key);
            // Solo loguear en desarrollo
            if (isDev) {
                console.log(value ? `✅ [CACHE HIT] ${key}` : `❌ [CACHE MISS] ${key}`);
            }
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
            const ttlInMs = ttl ? ttl * 1000 : undefined;
            await this.cacheManager.set(key, value, ttlInMs);
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
     */
    async invalidatePattern(pattern: string): Promise<void> {
        try {
            const store = (this.cacheManager as any).store;
            let keys: string[] = [];

            if (typeof store.keys === 'function') {
                keys = await store.keys(pattern);
            } else if (store.client && typeof store.client.keys === 'function') {
                keys = await store.client.keys(pattern);
            }

            if (keys && keys.length > 0) {
                await Promise.all(keys.map(key => this.cacheManager.del(key)));
                if (isDev) console.log(`🧹 [CACHE INVALIDATE] ${pattern} (${keys.length} keys)`);
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

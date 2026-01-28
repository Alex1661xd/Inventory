import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) { }

    /**
     * Obtiene un valor del caché
     */
    async get<T>(key: string): Promise<T | undefined> {
        return await this.cacheManager.get<T>(key);
    }

    /**
     * Guarda un valor en el caché con TTL personalizado
     */
    async set(key: string, value: any, ttl?: number): Promise<void> {
        await this.cacheManager.set(key, value, ttl);
    }

    /**
     * Invalida una clave específica
     */
    async invalidate(key: string): Promise<void> {
        await this.cacheManager.del(key);
    }

    /**
     * Invalida todas las claves que coincidan con un patrón
     * Útil para invalidar todos los productos de un tenant
     */
    async invalidatePattern(pattern: string): Promise<void> {
        const keys = await this.cacheManager.store.keys(pattern);
        await Promise.all(keys.map((key: string) => this.cacheManager.del(key)));
    }

    /**
     * Limpia todo el caché
     */
    async reset(): Promise<void> {
        await this.cacheManager.reset();
    }

    /**
     * Genera una clave de caché con tenant para aislamiento
     */
    generateKey(tenantId: string, resource: string, ...params: string[]): string {
        return `tenant:${tenantId}:${resource}:${params.join(':')}`;
    }
}

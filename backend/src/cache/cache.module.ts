import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { CacheService } from './cache.service';

@Global()
@Module({
    imports: [
        NestCacheModule.registerAsync({
            useFactory: async () => {
                const redisHost = process.env.REDIS_HOST || 'localhost';
                const redisPort = parseInt(process.env.REDIS_PORT || '6379');
                const redisPassword = process.env.REDIS_PASSWORD;

                console.log('🔄 Configurando Redis (cache-manager-redis-yet)...');
                console.log(`   Host: ${redisHost}`);
                console.log(`   Port: ${redisPort}`);
                console.log(`   Password: ${redisPassword ? '***' : '(no configurada)'}`);

                try {
                    const store = await redisStore({
                        socket: {
                            host: redisHost,
                            port: redisPort,
                        },
                        password: redisPassword,
                        ttl: 300 * 1000, // 5 minutos por defecto (en milisegundos)
                    });

                    console.log('✅ Redis store creado exitosamente');

                    return {
                        store: store as any,
                        // Configuración global del módulo (TTL por defecto para decoradores, etc.)
                        ttl: 300 * 1000,
                        max: 1000,
                    };
                } catch (error) {
                    console.error('❌ Error al crear Redis store:', error.message);
                    console.error('⚠️  Cayendo en caché en memoria');
                    // Fallback a caché en memoria
                    return {
                        ttl: 300 * 1000,
                        max: 100,
                    };
                }
            },
        }),
    ],
    providers: [CacheService],
    exports: [NestCacheModule, CacheService],
})
export class CacheModule { }

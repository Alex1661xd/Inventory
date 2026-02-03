import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { CacheService } from './cache/cache.service';
import { Public } from './auth/decorators/public.decorator';

@Controller()
@Public()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly cacheService: CacheService,
  ) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      redis: process.env.REDIS_HOST || 'not configured',
    };
  }

  /**
   * Endpoint de prueba para verificar que Redis está funcionando
   * Llama a este endpoint 2 veces:
   * 1ra vez: "cached: false" (consulta la DB)
   * 2da vez: "cached: true" (devuelve desde Redis)
   */
  @Get('cache-test')
  async testCache() {
    const testKey = 'test-cache-key';

    // Intentar obtener del caché
    const cached = await this.cacheService.get<any>(testKey);

    if (cached) {
      return {
        message: '✅ Redis funcionando correctamente',
        cached: true,
        data: cached,
        timestamp: new Date().toISOString(),
      };
    }

    // Si no está en caché, guardarlo
    const testData = {
      message: 'Esta es una prueba de caché',
      generatedAt: new Date().toISOString(),
      randomNumber: Math.random(),
    };

    await this.cacheService.set(testKey, testData, 60); // TTL de 60 segundos

    return {
      message: '📝 Datos guardados en caché (llama este endpoint de nuevo para verificar)',
      cached: false,
      data: testData,
      timestamp: new Date().toISOString(),
    };
  }
}

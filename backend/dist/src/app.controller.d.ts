import { AppService } from './app.service';
import { CacheService } from './cache/cache.service';
export declare class AppController {
    private readonly appService;
    private readonly cacheService;
    constructor(appService: AppService, cacheService: CacheService);
    getHello(): string;
    getHealth(): {
        status: string;
        timestamp: string;
        redis: string;
    };
    testCache(): Promise<{
        message: string;
        cached: boolean;
        data: any;
        timestamp: string;
    }>;
}

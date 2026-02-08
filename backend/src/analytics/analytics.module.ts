import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CacheModule } from '../cache/cache.module';

@Module({
    imports: [PrismaModule, CacheModule],
    controllers: [AnalyticsController],
    providers: [AnalyticsService],
})
export class AnalyticsModule { }

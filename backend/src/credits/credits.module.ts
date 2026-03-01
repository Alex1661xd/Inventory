import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CacheModule } from '../cache/cache.module';
import { CreditsService } from './credits.service';
import { CreditsController } from './credits.controller';

@Module({
    imports: [PrismaModule, CacheModule],
    controllers: [CreditsController],
    providers: [CreditsService],
})
export class CreditsModule { }

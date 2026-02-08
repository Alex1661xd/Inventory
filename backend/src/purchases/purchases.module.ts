import { Module } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { PurchasesController } from './purchases.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CacheModule } from '../cache/cache.module';

@Module({
    imports: [PrismaModule, CacheModule],
    controllers: [PurchasesController],
    providers: [PurchasesService],
    exports: [PurchasesService]
})
export class PurchasesModule { }

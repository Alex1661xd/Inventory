import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CacheModule } from '../cache/cache.module';

@Module({
    imports: [PrismaModule, CacheModule],
    controllers: [InvoicesController],
    providers: [InvoicesService],
})
export class InvoicesModule { }

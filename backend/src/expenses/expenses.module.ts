import { Module } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CacheModule } from '../cache/cache.module';

@Module({
    imports: [PrismaModule, CacheModule],
    controllers: [ExpensesController],
    providers: [ExpensesService],
    exports: [ExpensesService],
})
export class ExpensesModule { }

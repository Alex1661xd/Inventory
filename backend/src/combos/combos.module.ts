import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CombosController } from './combos.controller';
import { CombosService } from './combos.service';

@Module({
    imports: [PrismaModule],
    controllers: [CombosController],
    providers: [CombosService],
    exports: [CombosService],
})
export class CombosModule { }

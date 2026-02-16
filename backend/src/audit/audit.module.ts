import { Global, Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Global() // Global para que cualquier módulo pueda inyectar AuditService
@Module({
    imports: [PrismaModule],
    providers: [AuditService],
    controllers: [AuditController],
    exports: [AuditService],
})
export class AuditModule { }

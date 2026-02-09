import { Module } from '@nestjs/common';
import { SuperAdminController } from './super-admin.controller';
import { SuperAdminService } from './super-admin.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
    imports: [PrismaModule, SupabaseModule],
    controllers: [SuperAdminController],
    providers: [SuperAdminService],
    exports: [SuperAdminService],
})
export class SuperAdminModule { }

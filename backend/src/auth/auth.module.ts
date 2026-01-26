import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SupabaseStrategy } from './strategies/supabase.strategy';
import { PrismaModule } from '../prisma/prisma.module';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [PassportModule, PrismaModule, SupabaseModule],
  controllers: [AuthController],
  providers: [AuthService, SupabaseStrategy],
})
export class AuthModule { }

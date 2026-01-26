
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';
import { SupabaseService } from '../../supabase/supabase.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        private readonly supabaseService: SupabaseService,
        private readonly prisma: PrismaService,
    ) {
        super();
    }

    async validate(token: string) {
        const {
            data: { user: supabaseUser },
            error,
        } = await this.supabaseService.getClient().auth.getUser(token);

        if (error || !supabaseUser) {
            throw new UnauthorizedException('Invalid Supabase token');
        }

        // Buscar usuario en nuestra BD local para tener el tenantId
        const user = await this.prisma.user.findUnique({
            where: { id: supabaseUser.id },
            include: { tenant: true },
        });

        if (!user) {
            throw new UnauthorizedException('User not found in local database');
        }

        // Retornamos el usuario local que tiene tenantId
        return user;
    }
}

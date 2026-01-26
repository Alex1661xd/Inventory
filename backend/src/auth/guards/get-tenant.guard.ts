
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GetTenantGuard extends AuthGuard('jwt') {
    // Este Guard utiliza la SupabaseStrategy ('jwt').
    // La estrategia valida el token y busca al usuario en Prisma,
    // adjuntando el objeto usuario (con tenantId) a la request.
}

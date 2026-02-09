import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class SuperAdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException('No autenticado');
        }

        if (user.role !== 'SUPER_ADMIN') {
            throw new ForbiddenException('Solo el Super Admin puede acceder a este recurso');
        }

        return true;
    }
}

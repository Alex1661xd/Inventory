import { BadRequestException, Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterBusinessDto } from './dto/register-business.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly supabaseService: SupabaseService,
        private readonly prisma: PrismaService,
    ) { }

    async registerBusiness(dto: RegisterBusinessDto) {

        // 0. Validar Codigo de Registro (SuperAdmin)
        if (!dto.registrationCode) {
            throw new BadRequestException('Se requiere un código de invitación para registrarse.');
        }

        const validCode = await this.prisma.registrationCode.findUnique({
            where: { code: dto.registrationCode }
        });

        if (!validCode) {
            throw new BadRequestException('Código de invitación inválido.');
        }

        if (validCode.isUsed) {
            throw new BadRequestException('Este código de invitación ya fue utilizado.');
        }

        if (validCode.expiresAt && validCode.expiresAt < new Date()) {
            throw new BadRequestException('El código de invitación ha expirado.');
        }

        // 1. Crear usuario en Supabase Auth usando el API de ADMIN
        // Esto permite marcar el email como confirmado automáticamente y evita el límite de envíos (Rate Limit)
        const { data: authData, error: authError } = await this.supabaseService
            .getClient()
            .auth.admin.createUser({
                email: dto.email,
                password: dto.password,
                email_confirm: true, // Salta la confirmación por email
                user_metadata: {
                    name: dto.userName,
                }
            });

        if (authError || !authData.user) {
            throw new BadRequestException(authError?.message || 'Error creating user in Supabase');
        }

        const userId = authData.user.id;

        try {
            // 2. Transacción en Prisma
            const result = await this.prisma.$transaction(async (tx) => {
                // a. Generar slug simple
                const slug = dto.businessName
                    .toLowerCase()
                    .trim()
                    .replace(/ /g, '-')
                    .replace(/[^\w-]/g, '') + '-' + Date.now().toString().slice(-4); // Agregamos sufijo simple temporal

                // b. Crear Tenant
                const tenant = await tx.tenant.create({
                    data: {
                        name: dto.businessName,
                        slug: slug,
                        registrationCodeId: validCode.id, // VINCULAMOS AL CODIGO
                    },
                });

                // c. Marcar codigo como USADO
                await tx.registrationCode.update({
                    where: { id: validCode.id },
                    data: {
                        isUsed: true,
                        usedAt: new Date(),
                    }
                });

                // d. Crear User local vinculado
                const user = await tx.user.create({
                    data: {
                        id: userId, // Mismo ID que Supabase
                        email: dto.email,
                        name: dto.userName,
                        password: 'MANAGED_BY_SUPABASE',
                        role: 'ADMIN',
                        tenantId: tenant.id,
                    },
                });

                // d. Crear Warehouse inicial
                await tx.warehouse.create({
                    data: {
                        name: 'Bodega Principal',
                        tenantId: tenant.id,
                        isDefault: true,
                    },
                });

                return { user, tenant };
            });

            return result;

        } catch (error: any) {
            // Si falla la BD, borramos el usuario de Supabase para no dejar "huerfanos"
            try {
                await this.supabaseService.getClient().auth.admin.deleteUser(userId);
                console.log(`🧹 [Auth] Rollback: Usuario Supabase ${userId} eliminado tras fallo en BD`);
            } catch (rollbackErr: any) {
                console.error(`⚠️ [Auth] Error en rollback de Supabase: ${rollbackErr.message}`);
            }
            console.error('Registration Transaction Failed:', error);
            throw new BadRequestException('Error registering business: ' + error.message);
        }
    }
}

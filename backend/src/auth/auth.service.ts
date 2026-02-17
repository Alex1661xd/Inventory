import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { SupabaseService } from '../supabase/supabase.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterBusinessDto } from './dto/register-business.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly supabaseService: SupabaseService,
        private readonly prisma: PrismaService,
    ) { }

    private formatPrismaError(error: unknown): string {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                const rawTarget = (error.meta as { target?: string[] | string } | undefined)?.target;
                const target = Array.isArray(rawTarget) ? rawTarget.join(', ') : (rawTarget ?? 'campo unico');
                return `Conflicto de unicidad en: ${target}`;
            }
            return `Prisma(${error.code}): ${error.message}`;
        }

        if (error instanceof Error) {
            return error.message;
        }

        return 'Error desconocido';
    }

    async registerBusiness(dto: RegisterBusinessDto) {
        const registrationCode = dto.registrationCode?.trim().toUpperCase();

        // 0. Validate registration code
        if (!registrationCode) {
            throw new BadRequestException('Se requiere un codigo de invitacion para registrarse.');
        }

        const validCode = await this.prisma.registrationCode.findUnique({
            where: { code: registrationCode }
        });

        if (!validCode) {
            throw new BadRequestException('Codigo de invitacion invalido.');
        }

        if (validCode.isUsed) {
            throw new BadRequestException('Este codigo de invitacion ya fue utilizado.');
        }

        if (validCode.expiresAt && validCode.expiresAt < new Date()) {
            throw new BadRequestException('El codigo de invitacion ha expirado.');
        }

        // 1. Create user in Supabase Auth
        const { data: authData, error: authError } = await this.supabaseService
            .getClient()
            .auth.admin.createUser({
                email: dto.email,
                password: dto.password,
                email_confirm: true,
                user_metadata: {
                    name: dto.userName,
                }
            });

        if (authError || !authData.user) {
            throw new BadRequestException(
                `AUTH_CREATE: ${authError?.message || 'No se pudo crear usuario en Supabase Auth'}`
            );
        }

        const userId = authData.user.id;

        try {
            // 2. DB transaction
            const result = await this.prisma.$transaction(async (tx) => {
                const slug = dto.businessName
                    .toLowerCase()
                    .trim()
                    .replace(/ /g, '-')
                    .replace(/[^\w-]/g, '') + '-' + Date.now().toString().slice(-4);

                const tenant = await tx.tenant.create({
                    data: {
                        name: dto.businessName,
                        slug,
                        registrationCodeId: validCode.id,
                    },
                });

                await tx.registrationCode.update({
                    where: { id: validCode.id },
                    data: {
                        isUsed: true,
                        usedAt: new Date(),
                    }
                });

                const user = await tx.user.create({
                    data: {
                        id: userId,
                        email: dto.email,
                        name: dto.userName,
                        password: 'MANAGED_BY_SUPABASE',
                        role: 'ADMIN',
                        tenantId: tenant.id,
                    },
                });

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

        } catch (error: unknown) {
            const dbErrorDetail = this.formatPrismaError(error);

            // 3. Rollback auth user if DB transaction fails
            try {
                await this.supabaseService.getClient().auth.admin.deleteUser(userId);
                console.log(`[Auth] Rollback successful: Supabase user ${userId} removed after DB failure`);
            } catch (rollbackErr: any) {
                console.error(`[Auth] Rollback failed for user ${userId}: ${rollbackErr?.message}`);
                throw new BadRequestException(
                    `DB_TX: ${dbErrorDetail} | AUTH_ROLLBACK: ${rollbackErr?.message ?? 'No se pudo eliminar usuario huerfano en Auth'}`
                );
            }

            console.error('Registration transaction failed:', error);
            throw new BadRequestException(`DB_TX: ${dbErrorDetail}`);
        }
    }
}

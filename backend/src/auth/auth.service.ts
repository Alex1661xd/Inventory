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
        // 1. Crear usuario en Supabase Auth
        const { data: authData, error: authError } = await this.supabaseService
            .getClient()
            .auth.signUp({
                email: dto.email,
                password: dto.password,
                options: {
                    data: {
                        name: dto.userName,
                    }
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
                    },
                });

                // c. Crear User local vinculado
                const user = await tx.user.create({
                    data: {
                        id: userId, // Mismo ID que Supabase
                        email: dto.email,
                        name: dto.userName,
                        password: 'MANAGED_BY_SUPABASE',
                        role: 'SUPER_ADMIN',
                        tenantId: tenant.id,
                    },
                });

                // d. Crear Warehouse inicial
                await tx.warehouse.create({
                    data: {
                        name: 'Bodega Principal',
                        tenantId: tenant.id,
                    },
                });

                return { user, tenant };
            });

            return result;

        } catch (error: any) {
            // Si falla la BD, deberíamos borrar el usuario de Supabase para no dejar "huerfanos"
            // await this.supabaseService.getClient().auth.admin.deleteUser(userId);
            console.error('Registration Transaction Failed:', error);
            throw new BadRequestException('Error registering business: ' + error.message);
        }
    }
}

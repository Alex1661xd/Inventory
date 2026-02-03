import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly supabase: SupabaseService,
    ) { }

    async create(tenantId: string, dto: CreateUserDto) {
        // 1. Create in Supabase Auth
        const { data: authData, error: authError } = await this.supabase.getClient().auth.admin.createUser({
            email: dto.email,
            password: dto.password,
            email_confirm: true, // Auto confirm
            user_metadata: {
                name: dto.name,
                role: dto.role,
                tenantId: tenantId,
            }
        });

        if (authError) {
            throw new BadRequestException(`Supabase Error: ${authError.message}`);
        }

        if (!authData.user) {
            throw new BadRequestException('Could not create user in Supabase');
        }

        // 2. Create in Prisma
        try {
            return await this.prisma.user.create({
                data: {
                    id: authData.user.id, // Sync IDs
                    email: dto.email,
                    name: dto.name,
                    password: 'MANAGED_BY_SUPABASE',
                    role: dto.role,
                    tenantId,
                },
            });
        } catch (error: any) {
            // Rollback Supabase user if Prisma fails
            await this.supabase.getClient().auth.admin.deleteUser(authData.user.id);
            throw new BadRequestException(`Database Error: ${error.message}`);
        }
    }

    async findAll(tenantId: string) {
        return this.prisma.user.findMany({
            where: { tenantId },
            orderBy: { name: 'asc' },
        });
    }

    async findOne(tenantId: string, id: string) {
        const user = await this.prisma.user.findFirst({
            where: { id, tenantId },
        });

        if (!user) throw new NotFoundException('User not found');

        return user;
    }

    async update(tenantId: string, id: string, dto: UpdateUserDto) {
        const exists = await this.prisma.user.findFirst({
            where: { id, tenantId },
            select: { id: true },
        });

        if (!exists) throw new NotFoundException('User not found');

        // Check if password update is needed
        if (dto.password) {
            const { error } = await this.supabase.getClient().auth.admin.updateUserById(id, {
                password: dto.password
            });
            if (error) throw new BadRequestException(`Supabase Error: ${error.message}`);
        }

        // Update other fields in Supabase metadata if needed
        if (dto.name || dto.role) {
            await this.supabase.getClient().auth.admin.updateUserById(id, {
                user_metadata: {
                    ...(dto.name && { name: dto.name }),
                    ...(dto.role && { role: dto.role }),
                }
            });
        }

        // Update in Prisma
        // Remove password from dto because we don't store it in Prisma
        const { password, ...prismaData } = dto;

        return this.prisma.user.update({
            where: { id },
            data: prismaData,
        });
    }

    async remove(tenantId: string, id: string) {
        const exists = await this.prisma.user.findFirst({
            where: { id, tenantId },
            select: { id: true },
        });

        if (!exists) throw new NotFoundException('User not found');

        // Delete in Supabase (Prisma user might be deleted via Cascade if we had that, but here we do manual)
        // Actually, deleting in Supabase first is safer.

        const { error } = await this.supabase.getClient().auth.admin.deleteUser(id);

        if (error) {
            // Note: If user is not found in Supabase (already deleted), we might still want to delete from Prisma
            console.warn('Supabase delete error:', error.message);
        }

        return this.prisma.user.delete({
            where: { id },
        });
    }
}

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const supabase_service_1 = require("../supabase/supabase.service");
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    supabaseService;
    prisma;
    constructor(supabaseService, prisma) {
        this.supabaseService = supabaseService;
        this.prisma = prisma;
    }
    formatPrismaError(error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                const rawTarget = error.meta?.target;
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
    async registerBusiness(dto) {
        const registrationCode = dto.registrationCode?.trim().toUpperCase();
        if (!registrationCode) {
            throw new common_1.BadRequestException('Se requiere un codigo de invitacion para registrarse.');
        }
        const validCode = await this.prisma.registrationCode.findUnique({
            where: { code: registrationCode }
        });
        if (!validCode) {
            throw new common_1.BadRequestException('Codigo de invitacion invalido.');
        }
        if (validCode.isUsed) {
            throw new common_1.BadRequestException('Este codigo de invitacion ya fue utilizado.');
        }
        if (validCode.expiresAt && validCode.expiresAt < new Date()) {
            throw new common_1.BadRequestException('El codigo de invitacion ha expirado.');
        }
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
            throw new common_1.BadRequestException(`AUTH_CREATE: ${authError?.message || 'No se pudo crear usuario en Supabase Auth'}`);
        }
        const userId = authData.user.id;
        try {
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
        }
        catch (error) {
            const dbErrorDetail = this.formatPrismaError(error);
            try {
                await this.supabaseService.getClient().auth.admin.deleteUser(userId);
                console.log(`[Auth] Rollback successful: Supabase user ${userId} removed after DB failure`);
            }
            catch (rollbackErr) {
                console.error(`[Auth] Rollback failed for user ${userId}: ${rollbackErr?.message}`);
                throw new common_1.BadRequestException(`DB_TX: ${dbErrorDetail} | AUTH_ROLLBACK: ${rollbackErr?.message ?? 'No se pudo eliminar usuario huerfano en Auth'}`);
            }
            console.error('Registration transaction failed:', error);
            throw new common_1.BadRequestException(`DB_TX: ${dbErrorDetail}`);
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService,
        prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map
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
const supabase_service_1 = require("../supabase/supabase.service");
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    supabaseService;
    prisma;
    constructor(supabaseService, prisma) {
        this.supabaseService = supabaseService;
        this.prisma = prisma;
    }
    async registerBusiness(dto) {
        if (!dto.registrationCode) {
            throw new common_1.BadRequestException('Se requiere un código de invitación para registrarse.');
        }
        const validCode = await this.prisma.registrationCode.findUnique({
            where: { code: dto.registrationCode }
        });
        if (!validCode) {
            throw new common_1.BadRequestException('Código de invitación inválido.');
        }
        if (validCode.isUsed) {
            throw new common_1.BadRequestException('Este código de invitación ya fue utilizado.');
        }
        if (validCode.expiresAt && validCode.expiresAt < new Date()) {
            throw new common_1.BadRequestException('El código de invitación ha expirado.');
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
            throw new common_1.BadRequestException(authError?.message || 'Error creating user in Supabase');
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
                        slug: slug,
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
            console.error('Registration Transaction Failed:', error);
            throw new common_1.BadRequestException('Error registering business: ' + error.message);
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
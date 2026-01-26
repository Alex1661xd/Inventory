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
exports.SupabaseStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_http_bearer_1 = require("passport-http-bearer");
const supabase_service_1 = require("../../supabase/supabase.service");
const prisma_service_1 = require("../../prisma/prisma.service");
let SupabaseStrategy = class SupabaseStrategy extends (0, passport_1.PassportStrategy)(passport_http_bearer_1.Strategy, 'jwt') {
    supabaseService;
    prisma;
    constructor(supabaseService, prisma) {
        super();
        this.supabaseService = supabaseService;
        this.prisma = prisma;
    }
    async validate(token) {
        const { data: { user: supabaseUser }, error, } = await this.supabaseService.getClient().auth.getUser(token);
        if (error || !supabaseUser) {
            throw new common_1.UnauthorizedException('Invalid Supabase token');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: supabaseUser.id },
            include: { tenant: true },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found in local database');
        }
        return user;
    }
};
exports.SupabaseStrategy = SupabaseStrategy;
exports.SupabaseStrategy = SupabaseStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService,
        prisma_service_1.PrismaService])
], SupabaseStrategy);
//# sourceMappingURL=supabase.strategy.js.map
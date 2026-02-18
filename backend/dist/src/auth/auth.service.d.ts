import { SupabaseService } from '../supabase/supabase.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterBusinessDto } from './dto/register-business.dto';
export declare class AuthService {
    private readonly supabaseService;
    private readonly prisma;
    constructor(supabaseService: SupabaseService, prisma: PrismaService);
    private formatPrismaError;
    registerBusiness(dto: RegisterBusinessDto): Promise<{
        user: {
            email: string;
            password: string;
            id: string;
            name: string;
            role: import("@prisma/client").$Enums.Role;
            tenantId: string;
            warehouseId: string | null;
        };
        tenant: {
            id: string;
            createdAt: Date;
            name: string;
            slug: string;
            updatedAt: Date;
            isBanned: boolean;
            bannedAt: Date | null;
            catalogDescription: string | null;
            catalogBgColor: string;
            catalogAccentColor: string;
            catalogEnabled: boolean;
            catalogWhatsApp: string | null;
            timezone: string;
            registrationCodeId: string | null;
        };
    }>;
}

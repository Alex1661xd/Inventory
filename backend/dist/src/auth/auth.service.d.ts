import { SupabaseService } from '../supabase/supabase.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterBusinessDto } from './dto/register-business.dto';
export declare class AuthService {
    private readonly supabaseService;
    private readonly prisma;
    constructor(supabaseService: SupabaseService, prisma: PrismaService);
    registerBusiness(dto: RegisterBusinessDto): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            password: string;
            role: import("@prisma/client").$Enums.Role;
            tenantId: string;
            warehouseId: string | null;
        };
        tenant: {
            id: string;
            name: string;
            slug: string;
            createdAt: Date;
            updatedAt: Date;
            isBanned: boolean;
            bannedAt: Date | null;
            catalogDescription: string | null;
            catalogBgColor: string;
            catalogAccentColor: string;
            catalogEnabled: boolean;
            catalogWhatsApp: string | null;
            registrationCodeId: string | null;
        };
    }>;
}

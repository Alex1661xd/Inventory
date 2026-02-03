import { SupabaseService } from '../supabase/supabase.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterBusinessDto } from './dto/register-business.dto';
export declare class AuthService {
    private readonly supabaseService;
    private readonly prisma;
    constructor(supabaseService: SupabaseService, prisma: PrismaService);
    registerBusiness(dto: RegisterBusinessDto): Promise<{
        user: {
            email: string;
            password: string;
            name: string;
            id: string;
            role: import("@prisma/client").$Enums.Role;
            tenantId: string;
            warehouseId: string | null;
        };
        tenant: {
            name: string;
            id: string;
            slug: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
}

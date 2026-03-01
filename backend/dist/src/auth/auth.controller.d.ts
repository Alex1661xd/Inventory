import { AuthService } from './auth.service';
import { RegisterBusinessDto } from './dto/register-business.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    me(req: any): {
        id: any;
        email: any;
        name: any;
        role: any;
        tenantId: any;
        warehouseId: any;
    };
    register(dto: RegisterBusinessDto): Promise<{
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

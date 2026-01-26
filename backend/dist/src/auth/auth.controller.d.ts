import { AuthService } from './auth.service';
import { RegisterBusinessDto } from './dto/register-business.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterBusinessDto): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            password: string;
            role: import("@prisma/client").$Enums.Role;
            tenantId: string;
        };
        tenant: {
            id: string;
            name: string;
            slug: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
}

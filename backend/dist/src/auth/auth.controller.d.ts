import { AuthService } from './auth.service';
import { RegisterBusinessDto } from './dto/register-business.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterBusinessDto): Promise<{
        user: {
            email: string;
            password: string;
            name: string;
            id: string;
            role: import("@prisma/client").$Enums.Role;
            tenantId: string;
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

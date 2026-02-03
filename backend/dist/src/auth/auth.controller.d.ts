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
    };
    register(dto: RegisterBusinessDto): Promise<{
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

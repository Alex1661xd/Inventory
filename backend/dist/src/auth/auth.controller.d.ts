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
            id: string;
            email: string;
            password: string;
            name: string;
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
        };
    }>;
}

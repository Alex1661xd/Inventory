import { Strategy } from 'passport-http-bearer';
import { SupabaseService } from '../../supabase/supabase.service';
import { PrismaService } from '../../prisma/prisma.service';
declare const SupabaseStrategy_base: new (...args: [options: import("passport-http-bearer").IStrategyOptions] | []) => Strategy<import("passport-http-bearer").VerifyFunctions> & {
    validate(...args: any[]): unknown;
};
export declare class SupabaseStrategy extends SupabaseStrategy_base {
    private readonly supabaseService;
    private readonly prisma;
    constructor(supabaseService: SupabaseService, prisma: PrismaService);
    validate(token: string): Promise<{
        tenant: {
            id: string;
            name: string;
            slug: string;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        name: string;
        email: string;
        password: string;
        role: import("@prisma/client").$Enums.Role;
        tenantId: string;
    }>;
}
export {};

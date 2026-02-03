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
        email: string;
        name: string;
        id: string;
        role: import("@prisma/client").$Enums.Role;
        tenantId: string;
        warehouseId: string | null;
    }>;
}
export {};

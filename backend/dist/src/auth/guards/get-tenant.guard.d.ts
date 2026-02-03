import { Reflector } from '@nestjs/core';
declare const GetTenantGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class GetTenantGuard extends GetTenantGuard_base {
    private readonly reflector;
    constructor(reflector: Reflector);
    canActivate(context: any): boolean | Promise<boolean> | import("rxjs").Observable<boolean>;
}
export {};

import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterBusinessDto } from './dto/register-business.dto';
import { GetTenantGuard } from './guards/get-tenant.guard';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Get('me')
    @UseGuards(GetTenantGuard)
    me(@Request() req: any) {
        const user = req.user as any;

        return {
            id: user?.id,
            email: user?.email,
            name: user?.name,
            role: user?.role,
            tenantId: user?.tenantId,
        };
    }

    @Post('register-business')
    @Public()
    register(@Body() dto: RegisterBusinessDto) {
        return this.authService.registerBusiness(dto);
    }
}

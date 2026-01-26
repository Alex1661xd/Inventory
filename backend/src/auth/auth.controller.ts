import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterBusinessDto } from './dto/register-business.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register-business')
    register(@Body() dto: RegisterBusinessDto) {
        return this.authService.registerBusiness(dto);
    }
}

import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetTenantGuard } from '../auth/guards/get-tenant.guard';
import { GetTenantId } from '../auth/decorators/get-tenant-id.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
@UseGuards(GetTenantGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @Roles('ADMIN', 'SUPER_ADMIN')
    create(@GetTenantId() tenantId: string, @Body() createUserDto: CreateUserDto) {
        return this.usersService.create(tenantId, createUserDto);
    }

    @Get()
    @Roles('ADMIN', 'SUPER_ADMIN')
    findAll(@GetTenantId() tenantId: string) {
        return this.usersService.findAll(tenantId);
    }

    @Get(':id')
    findOne(@GetTenantId() tenantId: string, @Param('id') id: string) {
        return this.usersService.findOne(tenantId, id);
    }

    @Patch(':id')
    @Roles('ADMIN', 'SUPER_ADMIN', 'SELLER')
    update(
        @GetTenantId() tenantId: string,
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
        @Request() req: any
    ) {
        const currentUser = req.user;

        // Security: Non-admin can only update themselves
        if (currentUser.role === 'SELLER' && currentUser.id !== id) {
            throw new UnauthorizedException('Solo puedes actualizar tu propio perfil.');
        }

        // Security: Prevent role escalation
        if (currentUser.role === 'SELLER' && updateUserDto.role) {
            delete updateUserDto.role;
        }

        return this.usersService.update(tenantId, id, updateUserDto);
    }

    @Delete(':id')
    @Roles('ADMIN', 'SUPER_ADMIN')
    remove(@GetTenantId() tenantId: string, @Param('id') id: string) {
        return this.usersService.remove(tenantId, id);
    }
}

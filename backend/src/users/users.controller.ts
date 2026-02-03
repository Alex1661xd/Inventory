import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetTenantGuard } from '../auth/guards/get-tenant.guard';
import { GetTenantId } from '../auth/decorators/get-tenant-id.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
@UseGuards(GetTenantGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    create(@GetTenantId() tenantId: string, @Body() createUserDto: CreateUserDto) {
        return this.usersService.create(tenantId, createUserDto);
    }

    @Get()
    findAll(@GetTenantId() tenantId: string) {
        return this.usersService.findAll(tenantId);
    }

    @Get(':id')
    findOne(@GetTenantId() tenantId: string, @Param('id') id: string) {
        return this.usersService.findOne(tenantId, id);
    }

    @Patch(':id')
    update(@GetTenantId() tenantId: string, @Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(tenantId, id, updateUserDto);
    }

    @Delete(':id')
    remove(@GetTenantId() tenantId: string, @Param('id') id: string) {
        return this.usersService.remove(tenantId, id);
    }
}

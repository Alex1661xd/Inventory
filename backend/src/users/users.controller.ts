import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    create(@Request() req, @Body() createUserDto: CreateUserDto) {
        return this.usersService.create(req.user.tenantId, createUserDto);
    }

    @Get()
    findAll(@Request() req) {
        return this.usersService.findAll(req.user.tenantId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        // TODO: Add check to ensure user belongs to tenant
        return this.usersService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
}

import { Controller, Get, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard, RolesGuard, Roles } from '@app/auth';
import { Role } from '@app/data';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Request() req) {
    return this.usersService.findAll(req.user);
  }

  @Put(':id/role')
  @Roles(Role.ADMIN) // Only Admin/Owner can update roles
  updateRole(@Param('id') id: string, @Body() body: { role: Role }, @Request() req) {
    return this.usersService.updateRole(+id, body.role, req.user);
  }
}



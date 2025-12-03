import { Controller, Post, Body, Get, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '@app/data';
import { Role } from '@app/data';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // Simple register for setup
  @Post('register')
  async register(@Body() body: { username: string; password: string; role: Role; orgName: string }) {
    return this.authService.register(body.username, body.password, body.role, body.orgName);
  }
}


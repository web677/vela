import { Controller, Post, Get, Body, UseGuards, Headers } from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';
import { AdminAuthGuard } from './admin-auth.guard';

import { IsNotEmpty, IsString } from 'class-validator';

class LoginDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.adminAuthService.login(loginDto.username, loginDto.password);
  }

  @Get('profile')
  @UseGuards(AdminAuthGuard)
  getProfile() {
    return this.adminAuthService.getProfile();
  }
}

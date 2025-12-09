import { Controller, Post, Get, Body, UseGuards, Headers } from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';
import { AdminAuthGuard } from './admin-auth.guard';

class LoginDto {
  username: string;
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

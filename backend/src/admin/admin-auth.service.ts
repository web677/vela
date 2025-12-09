import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminAuthService {
  private readonly adminUsername: string;
  private readonly adminPasswordHash: string;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.adminUsername = this.configService.get('ADMIN_USERNAME') || 'admin';
    // 默认密码 admin123 的 bcrypt hash
    this.adminPasswordHash = this.configService.get('ADMIN_PASSWORD_HASH') || 
      '$2b$10$rG8oZ9rZ9vZ9X9Y9Z9Z9ZOJqKpKpKpKpKpKpKpKpKpKpKpKpKpKpK';
  }

  async login(username: string, password: string) {
    // 验证用户名
    if (username !== this.adminUsername) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 如果没有配置 hash，直接比较明文（开发环境）
    const isDefaultPassword = password === 'admin123' && 
      !this.configService.get('ADMIN_PASSWORD_HASH');
    
    // 验证密码
    let isPasswordValid = isDefaultPassword;
    if (!isDefaultPassword) {
      try {
        isPasswordValid = await bcrypt.compare(password, this.adminPasswordHash);
      } catch {
        isPasswordValid = false;
      }
    }

    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 生成 token
    const payload = { 
      sub: 'admin', 
      username: this.adminUsername,
      role: 'admin'
    };
    
    const token = this.jwtService.sign(payload);

    return {
      token,
      admin: {
        username: this.adminUsername,
        role: 'admin'
      }
    };
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      if (payload.role !== 'admin') {
        throw new UnauthorizedException('无效的管理员令牌');
      }
      return payload;
    } catch {
      throw new UnauthorizedException('令牌已过期或无效');
    }
  }

  getProfile() {
    return {
      username: this.adminUsername,
      role: 'admin'
    };
  }
}

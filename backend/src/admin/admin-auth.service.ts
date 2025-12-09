import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminAuthService {
  private readonly logger = new Logger(AdminAuthService.name);
  private readonly adminUsername: string;
  private readonly adminPasswordPlain: string;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.adminUsername = this.configService.get('ADMIN_USERNAME') || 'admin';
    // 移除默认密码，强制要求配置
    this.adminPasswordPlain = this.configService.get('ADMIN_PASSWORD');
    
    this.logger.log(`Initialized AdminAuthService with username: ${this.adminUsername}`);
    if (this.adminPasswordPlain) {
      this.logger.log('Loaded ADMIN_PASSWORD from config');
    } else {
      this.logger.warn('ADMIN_PASSWORD not set in configuration. Login will be disabled.');
    }
  }

  async login(username: string, password: string) {
    this.logger.log(`Login attempt for user: ${username}`);
    
    // 验证用户名
    if (username !== this.adminUsername) {
      this.logger.warn(`Invalid username provided: ${username}, expected: ${this.adminUsername}`);
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 检查是否配置了密码
    if (!this.adminPasswordPlain) {
      this.logger.error('ADMIN_PASSWORD not configured on server');
      throw new UnauthorizedException('服务器配置错误：未设置管理员密码');
    }

    // 直接验证明文密码
    const isPasswordValid = password === this.adminPasswordPlain;
    this.logger.debug(`Password validation result: ${isPasswordValid}`);

    if (!isPasswordValid) {
      this.logger.warn('Invalid password');
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

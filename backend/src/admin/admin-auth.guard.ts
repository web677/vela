import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('缺少认证令牌');
    }

    const token = authHeader.substring(7);

    try {
      const secret = this.configService.get('ADMIN_JWT_SECRET') || this.configService.get('JWT_SECRET');
      const payload = this.jwtService.verify(token, { secret });
      
      if (payload.role !== 'admin') {
        throw new UnauthorizedException('无效的管理员令牌');
      }
      
      request.admin = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('令牌已过期或无效');
    }
  }
}

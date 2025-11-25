import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../database/supabase.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private supabaseService: SupabaseService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, full_name, phone } = registerDto;

    // 使用 Supabase Auth 注册用户
    const { data: authData, error: authError } = await this.supabaseService
      .getClient()
      .auth.signUp({
        email,
        password,
      });

    if (authError) {
      if (authError.message.includes('already registered')) {
        throw new ConflictException('Email already exists');
      }
      throw new UnauthorizedException(authError.message);
    }

    if (!authData.user) {
      throw new UnauthorizedException('Registration failed');
    }

    // 创建用户扩展信息
    const { error: profileError } = await this.supabaseService
      .getAdminClient()
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email,
        full_name,
        phone,
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
    }

    // 生成 JWT
    const payload = { sub: authData.user.id, email: authData.user.email };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        full_name,
        phone,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // 使用 Supabase Auth 登录
    const { data: authData, error: authError } = await this.supabaseService
      .getClient()
      .auth.signInWithPassword({
        email,
        password,
      });

    if (authError || !authData.user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 获取用户扩展信息
    const { data: profile } = await this.supabaseService
      .getAdminClient()
      .from('user_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    // 生成 JWT
    const payload = { sub: authData.user.id, email: authData.user.email };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        full_name: profile?.full_name,
        phone: profile?.phone,
      },
    };
  }

  async getProfile(userId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw new UnauthorizedException('User not found');
    }

    return data;
  }
}

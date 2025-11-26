import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../database/supabase.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PhoneLoginDto } from './dto/phone-login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { VerificationService } from '../verification/verification.service';
import type { AuthError } from '@supabase/supabase-js';

@Injectable()
export class AuthService {
  constructor(
    private supabaseService: SupabaseService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private verificationService: VerificationService,
  ) {}

  private mapLoginAuthError(error: AuthError): string {
    const msg = (error?.message || '').toLowerCase();
    if (
      msg.includes('email not confirmed') ||
      msg.includes('email_not_confirmed') ||
      msg.includes('not confirmed')
    ) {
      return '邮箱未验证，请先前往邮箱完成验证';
    }

    if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
      return '邮箱或密码错误';
    }

    return '登录失败，请稍后重试';
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, full_name, phone } = registerDto;

    try {
      const { data: authData, error: authError } = await this.supabaseService
        .getClient()
        .auth.signUp({
          email,
          password,
        });

      if (authError) {
        console.error('Registration auth error:', authError);
        if (authError.message.includes('already registered')) {
          throw new ConflictException('该邮箱已被注册');
        }
        throw new UnauthorizedException(authError.message);
      }

      if (!authData.user) {
        throw new UnauthorizedException('注册失败，请重试');
      }

      const { data: existingProfile } = await this.supabaseService
        .getAdminClient()
        .from('user_profiles')
        .select('id')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (!existingProfile) {
        const { error: profileError } = await this.supabaseService
          .getAdminClient()
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            email,
            full_name: full_name || null,
            phone: phone || null,
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          if (profileError.code !== '23505') {
            throw new UnauthorizedException('创建用户资料失败');
          }
        }
      }

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
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof UnauthorizedException || error instanceof ConflictException) {
        throw error;
      }
      throw new UnauthorizedException('注册失败');
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    console.log('=== Login Attempt ===');
    console.log('Email:', email);
    console.log('Password length:', password?.length);

    try {
      const { data: authData, error: authError } = await this.supabaseService
        .getClient()
        .auth.signInWithPassword({
          email,
          password,
        });

      if (authError) {
        console.error('Login auth error:', authError);
        throw new UnauthorizedException(this.mapLoginAuthError(authError as AuthError));
      }

      if (!authData.user) {
        console.error('No user in auth response');
        throw new UnauthorizedException('登录失败');
      }

      console.log('Auth successful, user ID:', authData.user.id);

      const { data: profile, error: profileError } = await this.supabaseService
        .getAdminClient()
        .from('user_profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
      }

      const payload = { sub: authData.user.id, email: authData.user.email };
      const access_token = this.jwtService.sign(payload);

      console.log('Login successful!');

      return {
        access_token,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          full_name: profile?.full_name,
          phone: profile?.phone,
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('登录失败');
    }
  }

  async getProfile(userId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw new UnauthorizedException('用户不存在');
    }

    return data;
  }

  async sendPhoneOtp(phone: string): Promise<{ success: boolean; message?: string }> {
    try {
      const { error } = await this.supabaseService
        .getClient()
        .auth.signInWithOtp({ phone });

      if (error) {
        console.error('Send OTP error:', error);
        return {
          success: false,
          message: error.message || '发送失败',
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Send OTP exception:', error);
      return {
        success: false,
        message: '发送验证码失败',
      };
    }
  }

  async phoneLoginOrRegister(phoneLoginDto: PhoneLoginDto): Promise<AuthResponseDto> {
    const { phone, token } = phoneLoginDto;

    console.log('=== Phone Login/Register Attempt ===');
    console.log('Phone:', phone);
    console.log('Token:', token);

    try {
      // 1. 验证短信验证码（从Redis）
      const isValid = await this.verificationService.verifySmsCode(phone, token);

      if (!isValid) {
        throw new UnauthorizedException('验证码错误或已过期');
      }

      console.log('SMS verification successful');

      // 2. 查找或创建用户
      const { data: existingProfile } = await this.supabaseService
        .getAdminClient()
        .from('user_profiles')
        .select('*')
        .eq('phone', phone)
        .maybeSingle();

      let userId: string;
      let userProfile: any;

      if (existingProfile) {
        // 已有用户
        userId = existingProfile.id;
        userProfile = existingProfile;
        console.log('Existing user found:', userId);
      } else {
        // 新用户，创建
        userId = this.generateUUID();

        const { error: profileError } = await this.supabaseService
          .getAdminClient()
          .from('user_profiles')
          .insert({
            id: userId,
            phone,
            // email 现在是可选的，不需要填充虚拟邮箱
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          throw new UnauthorizedException('创建用户失败');
        }

        // 重新获取
        const { data: newProfile } = await this.supabaseService
          .getAdminClient()
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single();

        userProfile = newProfile;
        console.log('New user created:', userId);
      }

      // 3. 生成JWT
      const payload = { sub: userId, phone };
      const access_token = this.jwtService.sign(payload);

      console.log('Phone login/register successful!');

      return {
        access_token,
        user: {
          id: userId,
          email: userProfile?.email || null,
          full_name: userProfile?.full_name || null,
          phone: phone,
        },
      };
    } catch (error) {
      console.error('Phone login/register error:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('手机号登录失败');
    }
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0,
          v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
  }
}

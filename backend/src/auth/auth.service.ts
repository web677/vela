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
        .getAdminClient()
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
        .getAdminClient()
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

      // 获取或创建用户profile
      let { data: profile, error: profileError } = await this.supabaseService
        .getAdminClient()
        .from('user_profiles')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (profileError || !profile) {
        console.log('Profile not found, creating one...');
        
        // 如果profile不存在，创建一个
        const { error: insertError } = await this.supabaseService
          .getAdminClient()
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            email: authData.user.email,
          });

        if (insertError && insertError.code !== '23505') { // 忽略重复键错误
          console.error('Profile creation error:', insertError);
        }

        // 重新获取
        const { data: newProfile } = await this.supabaseService
          .getAdminClient()
          .from('user_profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();
        
        profile = newProfile;
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
        .getAdminClient()
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
    const { phone, token, gender } = phoneLoginDto;

    console.log('=== Phone Login/Register Attempt ===');
    console.log('Phone:', phone);
    console.log('Token:', token);
    console.log('Gender:', gender);

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
        console.log('Existing profile found:', userId);
        
        // 如果提供了新的性别偏好，更新用户资料
        if (gender && gender !== existingProfile.gender) {
          await this.supabaseService
            .getAdminClient()
            .from('user_profiles')
            .update({ gender })
            .eq('id', userId);
          userProfile.gender = gender;
        }
      } else {
        // 新用户，需要在 Supabase Auth 中创建用户以获取有效的 ID
        console.log('Creating new user in Supabase Auth...');
        
        // 1. 尝试在 Supabase Auth 中创建用户
        // 注意：我们需要使用 admin client 来创建用户，因为我们没有密码
        const { data: authUser, error: createError } = await this.supabaseService
          .getAdminClient()
          .auth.admin.createUser({
            phone: phone,
            phone_confirm: true, // 自动确认为已验证
            email_confirm: true,
            user_metadata: { phone_login: true }
          });

        if (createError) {
          console.error('Supabase Auth creation error:', createError);
          // 如果用户已存在（可能之前创建过但没有 profile），尝试获取
          if (createError.message.includes('already has been registered')) {
             // 尝试通过 listUsers 获取 ID (Supabase admin API 没有直接 getByPhone)
             // 或者尝试通过 generateUUID 作为 fallback (但这会再次导致 FK 错误)
             // 正确做法是应该能获取到。
             // 这里我们假设如果已注册，可能是之前的脏数据，或者我们需要通过 listUsers 查找
             // 简单起见，如果已存在，我们可能无法直接获取 ID 除非我们遍历。
             // 但通常 createUser 会失败。
             // 让我们尝试 listUsers
             const { data: users } = await this.supabaseService.getAdminClient().auth.admin.listUsers();
             const foundUser = users.users.find(u => u.phone === phone);
             if (foundUser) {
               userId = foundUser.id;
               console.log('Found existing Supabase Auth user:', userId);
             } else {
               throw new UnauthorizedException('用户状态异常，请联系客服');
             }
          } else {
             throw new UnauthorizedException('创建账户失败');
          }
        } else {
          userId = authUser.user.id;
          console.log('Created new Supabase Auth user:', userId);
        }

        // 2. 创建 user_profile
        const { error: profileError } = await this.supabaseService
          .getAdminClient()
          .from('user_profiles')
          .insert({
            id: userId,
            phone,
            gender: gender || 'male', // 保存性别，默认男性
            // email 现在是可选的，不需要填充虚拟邮箱
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // 如果 profile 已存在（可能并发），尝试获取
          if (profileError.code === '23505') {
             const { data: existing } = await this.supabaseService
              .getAdminClient()
              .from('user_profiles')
              .select('*')
              .eq('id', userId)
              .single();
             userProfile = existing;
          } else {
             throw new UnauthorizedException('创建用户资料失败');
          }
        } else {
          // 重新获取
          const { data: newProfile } = await this.supabaseService
            .getAdminClient()
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .single();
          userProfile = newProfile;
        }
        
        console.log('User profile ready:', userId);
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

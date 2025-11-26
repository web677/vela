import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PhoneLoginDto } from './dto/phone-login.dto';
import { SmsService } from '../sms/sms.service';
import { CaptchaService } from '../captcha/captcha.service';
import { VerificationService } from '../verification/verification.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private smsService: SmsService,
    private captchaService: CaptchaService,
    private verificationService: VerificationService,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // 获取图形验证码配置
  @Get('captcha-config')
  async getCaptchaConfig() {
    return this.captchaService.getCaptchaConfig();
  }

  // 发送短信验证码（需要阿里云图形验证码）
  @Post('send-sms-code')
  @HttpCode(HttpStatus.OK)
  async sendSmsCode(
    @Body()
    body: {
      phone: string;
      lotNumber: string;
      captchaOutput: string;
      passToken: string;
      genTime: string;
    },
  ) {
    const { phone, lotNumber, captchaOutput, passToken, genTime } = body;

    if (!phone || !lotNumber || !captchaOutput || !passToken || !genTime) {
      throw new BadRequestException('缺少必要参数');
    }

    // 1. 验证阿里云图形验证码
    const isCaptchaValid = await this.captchaService.verifyCaptcha(
      lotNumber,
      captchaOutput,
      passToken,
      genTime,
    );

    if (!isCaptchaValid) {
      return {
        success: false,
        message: '图形验证码验证失败',
      };
    }

    // 2. 检查发送频率
    const canSend = await this.verificationService.checkSmsRateLimit(phone);

    if (!canSend) {
      const waitTime =
        await this.verificationService.getRemainingWaitTime(phone);
      return {
        success: false,
        message: `发送过于频繁，请${waitTime}秒后再试`,
      };
    }

    // 3. 生成短信验证码
    const smsCode = this.verificationService.generateSmsCode();

    // 4. 存储到Redis
    await this.verificationService.storeSmsCode(phone, smsCode);

    // 5. 发送短信
    try {
      await this.smsService.sendVerificationCode(phone, smsCode);

      return {
        success: true,
        message: '验证码已发送',
      };
    } catch (error) {
      console.error('Failed to send SMS:', error);
      return {
        success: false,
        message: '发送失败，请稍后重试',
      };
    }
  }

  // 手机号验证码登录
  @Post('phone-login')
  async phoneLogin(@Body() phoneLoginDto: PhoneLoginDto) {
    return this.authService.phoneLoginOrRegister(phoneLoginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req) {
    return req.user;
  }
}

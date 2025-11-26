import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class CaptchaService {
  private readonly logger = new Logger(CaptchaService.name);
  private readonly captchaId: string;
  private readonly captchaKey: string;
  private readonly apiServer = 'https://captcha.alicaptcha.com';

  constructor(private configService: ConfigService) {
    this.captchaId = this.configService.get<string>('ALIYUN_CAPTCHA_APP_ID');
    this.captchaKey = this.configService.get<string>('ALIYUN_CAPTCHA_APP_KEY');

    if (!this.captchaId || !this.captchaKey) {
      this.logger.warn('Aliyun Captcha credentials not configured');
    }
  }

  /**
   * 验证阿里云图形验证码
   * @param lotNumber 验证流水号
   * @param captchaOutput 验证输出参数
   * @param passToken 验证通过标识
   * @param genTime 验证通过时间戳
   * @returns boolean
   */
  async verifyCaptcha(
    lotNumber: string,
    captchaOutput: string,
    passToken: string,
    genTime: string,
  ): Promise<boolean> {
    if (!this.captchaId || !this.captchaKey) {
      this.logger.error('Captcha service not configured');
      throw new HttpException(
        'Captcha service not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      // 生成签名 - 使用HMAC-SHA256算法
      const signToken = crypto
        .createHmac('sha256', this.captchaKey)
        .update(lotNumber)
        .digest('hex');

      // 构建校验参数
      const params = new URLSearchParams({
        lot_number: lotNumber,
        captcha_output: captchaOutput,
        pass_token: passToken,
        gen_time: genTime,
        sign_token: signToken,
      });

      // 调用阿里云二次校验接口
      const url = `${this.apiServer}/validate?captcha_id=${this.captchaId}`;

      this.logger.log(`Verifying captcha for lot_number: ${lotNumber}`);

      const response = await axios.post(url, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 5000,
      });

      // 检查响应
      if (response.status !== 200) {
        this.logger.error(`Captcha API error: ${response.status}`);
        return false;
      }

      const result = response.data;

      if (result.result === 'success') {
        this.logger.log(`Captcha verified successfully: ${result.reason}`);
        return true;
      } else {
        this.logger.warn(`Captcha verification failed: ${result.reason}`);
        return false;
      }
    } catch (error) {
      this.logger.error(`Captcha verification error: ${error.message}`);
      // 根据阿里云文档建议，接口异常时应允许通过，避免阻碍业务
      this.logger.warn('Captcha API request failed, allowing request to proceed');
      return true;
    }
  }

  /**
   * 获取图形验证码配置（用于前端）
   */
  getCaptchaConfig() {
    if (!this.captchaId) {
      throw new HttpException(
        'Captcha not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      captchaId: this.captchaId,
      product: 'bind',
    };
  }
}

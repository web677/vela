import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);
  private readonly SMS_PREFIX = 'sms:';
  private readonly SMS_TTL = 300; // 5分钟过期
  private readonly SMS_RATE_PREFIX = 'sms_rate:';
  private readonly SMS_RATE_TTL = 60; // 1分钟内限制

  constructor(private redisService: RedisService) {}

  /**
   * 生成6位数字验证码
   */
  generateSmsCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * 存储短信验证码
   */
  async storeSmsCode(phone: string, code: string): Promise<void> {
    const key = `${this.SMS_PREFIX}${phone}`;
    await this.redisService.set(key, code, this.SMS_TTL);
    this.logger.log(`Stored SMS code for ${phone}`);
  }

  /**
   * 验证短信验证码
   */
  async verifySmsCode(phone: string, code: string): Promise<boolean> {
    const key = `${this.SMS_PREFIX}${phone}`;
    const stored = await this.redisService.get(key);

    if (!stored) {
      this.logger.warn(`SMS code for ${phone} not found or expired`);
      return false;
    }

    const isValid = stored === code;

    if (isValid) {
      // 验证成功后删除
      await this.redisService.del(key);
      this.logger.log(`SMS code for ${phone} verified successfully`);
    } else {
      this.logger.warn(`SMS code for ${phone} verification failed`);
    }

    return isValid;
  }

  /**
   * 检查发送频率限制
   * @returns true 如果允许发送, false 如果频率过快
   */
  async checkSmsRateLimit(phone: string): Promise<boolean> {
    const key = `${this.SMS_RATE_PREFIX}${phone}`;
    const exists = await this.redisService.exists(key);

    if (exists) {
      this.logger.warn(`SMS rate limit exceeded for ${phone}`);
      return false;
    }

    // 设置频率限制
    await this.redisService.set(key, '1', this.SMS_RATE_TTL);
    return true;
  }

  /**
   * 获取剩余等待时间（秒）
   */
  async getRemainingWaitTime(phone: string): Promise<number> {
    const key = `${this.SMS_RATE_PREFIX}${phone}`;
    const ttl = await this.redisService.getClient().ttl(key);
    return ttl > 0 ? ttl : 0;
  }
}

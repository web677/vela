import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);
  private readonly SMS_PREFIX = 'sms:';
  private readonly SMS_TTL = 300; // 5鍒嗛挓杩囨湡
  private readonly SMS_RATE_PREFIX = 'sms_rate:';
  private readonly SMS_RATE_TTL = 60; // 1鍒嗛挓鍐呴檺鍒?

  constructor(private redisService: RedisService) {}

  /**
   * 鐢熸垚6浣嶆暟瀛楅獙璇佺爜
   */
  generateSmsCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * 瀛樺偍鐭俊楠岃瘉鐮?
   */
  async storeSmsCode(phone: string, code: string): Promise<void> {
    const key = `${this.SMS_PREFIX}${phone}`;
    await this.redisService.set(key, code, this.SMS_TTL);
    this.logger.log(`Stored SMS code for ${phone}`);
  }

  /**
   * 楠岃瘉鐭俊楠岃瘉鐮?
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
      // 楠岃瘉鎴愬姛鍚庡垹闄?
      await this.redisService.del(key);
      this.logger.log(`SMS code for ${phone} verified successfully`);
    } else {
      this.logger.warn(`SMS code for ${phone} verification failed`);
    }

    return isValid;
  }

  /**
   * 妫€鏌ュ彂閫侀鐜囬檺鍒?
   * @returns true 濡傛灉鍏佽鍙戦€? false 濡傛灉棰戠巼杩囧揩
   */
  async checkSmsRateLimit(phone: string): Promise<boolean> {
    const key = `${this.SMS_RATE_PREFIX}${phone}`;
    const exists = await this.redisService.exists(key);

    if (exists) {
      this.logger.warn(`SMS rate limit exceeded for ${phone}`);
      return false;
    }

    // 璁剧疆棰戠巼闄愬埗
    await this.redisService.set(key, '1', this.SMS_RATE_TTL);
    return true;
  }

  /**
   * 鑾峰彇鍓╀綑绛夊緟鏃堕棿锛堢锛?
   */
  async getRemainingWaitTime(phone: string): Promise<number> {
    const key = `${this.SMS_RATE_PREFIX}${phone}`;
    const ttl = await this.redisService.getClient().ttl(key);
    return ttl > 0 ? ttl : 0;
  }
}

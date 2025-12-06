import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Dysmsapi20170525, * as $Dysmsapi20170525 from '@alicloud/dysmsapi20170525';
import * as $OpenApi from '@alicloud/openapi-client';
import * as $Util from '@alicloud/tea-util';

@Injectable()
export class SmsService {
  private client: Dysmsapi20170525;
  private readonly logger = new Logger(SmsService.name);
  private readonly signName: string;
  private readonly templateCode: string;

  constructor(private configService: ConfigService) {
    const accessKeyId = this.configService.get<string>('ALIYUN_ACCESS_KEY_ID');
    const accessKeySecret = this.configService.get<string>('ALIYUN_ACCESS_KEY_SECRET');
    this.signName = this.configService.get<string>('SMS_SIGN_NAME');
    this.templateCode = this.configService.get<string>('SMS_TEMPLATE_CODE');

    if (!accessKeyId || !accessKeySecret) {
      this.logger.warn('Aliyun SMS credentials not configured');
      return;
    }

    const config = new $OpenApi.Config({
      accessKeyId,
      accessKeySecret,
      endpoint: 'dysmsapi.aliyuncs.com',
    });

    this.client = new Dysmsapi20170525(config);
  }

  async sendCode(phone: string, code: string): Promise<boolean> {
    if (!this.client) {
      this.logger.error('SMS client not initialized');
      throw new Error('SMS service not configured');
    }

    try {
      this.logger.log(`Sending SMS to ${phone} with code ${code}`);

      const sendSmsRequest = new $Dysmsapi20170525.SendSmsRequest({
        phoneNumbers: phone,
        signName: this.signName,
        templateCode: this.templateCode,
        templateParam: JSON.stringify({ code }),
      });

      const runtime = new $Util.RuntimeOptions({
        connectTimeout: 10000,
        readTimeout: 10000,
      });
      const response = await this.client.sendSmsWithOptions(
        sendSmsRequest,
        runtime,
      );

      this.logger.log(`SMS response: ${JSON.stringify(response.body)}`);

      if (response.body.code === 'OK') {
        this.logger.log(`SMS sent successfully to ${phone}`);
        return true;
      } else {
        this.logger.error(
          `SMS send failed: ${response.body.code} - ${response.body.message}`,
        );
        return false;
      }
    } catch (error) {
      const msg = error?.message || '';
      if (msg.includes('ReadTimeout') || msg.includes('RequestTimeoutError')) {
        this.logger.warn(`SMS request timeout, treating as submitted: ${msg}`);
        return true;
      }
      this.logger.error(`Error sending SMS: ${msg}`, error.stack);
      throw error;
    }
  }

  async sendVerificationCode(phone: string, code: string): Promise<void> {
    const success = await this.sendCode(phone, code);
    if (!success) {
      throw new Error('Failed to send verification code');
    }
  }
}

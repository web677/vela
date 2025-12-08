import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../database/supabase.service';
import { CreateChargeDto } from './dto/create-charge.dto';
import { CreateRefundDto } from './dto/create-refund.dto';
import * as crypto from 'crypto';
import * as fs from 'fs';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly pingpp: any;
  private readonly publicKey: Buffer;
  private readonly appId: string;
  private readonly frontendUrl: string;

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
  ) {
    // 初始化 Ping++ SDK
    const apiKey = this.configService.get<string>('PINGPP_API_KEY');
    this.appId = this.configService.get<string>('PINGPP_APP_ID');
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';

    if (!apiKey || !this.appId) {
      throw new Error('Ping++ API Key and App ID must be configured');
    }

    const pingppModule = require('pingpp');
    this.pingpp = pingppModule(apiKey);

    // 加载商户RSA私钥用于签名请求
    const privateKeyPath = this.configService.get<string>('PINGPP_PRIVATE_KEY_PATH');
    if (privateKeyPath && fs.existsSync(privateKeyPath)) {
      const privateKeyContent = fs.readFileSync(privateKeyPath, 'utf8');
      this.pingpp.setPrivateKey(privateKeyContent);
      this.logger.log('Ping++ private key loaded for request signing');
    } else {
      this.logger.warn('Ping++ private key not configured, some payment channels may not work');
    }

    // 加载Ping++的RSA公钥用于webhook签名验证
    const publicKeyPath = this.configService.get<string>('PINGPP_PUBLIC_KEY_PATH');
    if (publicKeyPath && fs.existsSync(publicKeyPath)) {
      this.publicKey = fs.readFileSync(publicKeyPath);
    }
  }

  /**
   * 创建支付订单（Charge）
   */
  async createCharge(createChargeDto: CreateChargeDto, userId: string) {
    const { orderId, channel, clientIp, extra } = createChargeDto;

    try {
      // 1. 获取订单信息（使用adminClient绕过RLS）
      this.logger.log(`Creating charge for order ${orderId}, user ${userId}`);
      
      const { data: order, error } = await this.supabaseService
        .getAdminClient()
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) {
        this.logger.error(`Order query error: ${JSON.stringify(error)}`);
        throw new NotFoundException('Order not found');
      }

      if (!order) {
        this.logger.warn(`Order not found: orderId=${orderId}`);
        throw new NotFoundException('Order not found');
      }

      // 验证订单所有权
      if (order.user_id !== userId) {
        this.logger.warn(`Order ${orderId} belongs to user ${order.user_id}, not ${userId}`);
        throw new NotFoundException('Order not found');
      }

      this.logger.log(`Order found: ${order.id}, status: ${order.status}, user: ${order.user_id}`);

      // 2. 验证订单状态（允许pending和pending_payment状态进行支付）
      if (!['pending', 'pending_payment'].includes(order.status)) {
        throw new BadRequestException(`Order status is ${order.status}, cannot proceed with payment`);
      }

      // 3. 检查是否已有支付记录
      const { data: existingPayment } = await this.supabaseService
        .getAdminClient()
        .from('payment_logs')
        .select('*')
        .eq('order_id', orderId)
        .eq('status', 'succeeded')
        .single();

      if (existingPayment) {
        throw new BadRequestException('Order has already been paid');
      }

      // 4. 构建Channel Extra参数
      const channelExtra = this.buildChannelExtra(channel, order);

      // 5. 创建Ping++ Charge对象
      const amount = Math.round(order.total_amount * 100); // 转换为分
      const chargeParams = {
        order_no: order.order_number,
        app: { id: this.appId },
        channel,
        amount,
        client_ip: this.normalizeClientIp(clientIp),
        currency: 'cny',
        subject: `订单${order.order_number}`,
        body: `订单${order.order_number}支付`,
        extra: channelExtra,
      };

      this.logger.log(`Creating Ping++ charge: ${JSON.stringify(chargeParams)}`);
      const charge = await this.pingpp.charges.create(chargeParams);

      // 6. 保存支付记录到数据库
      const { error: insertError } = await this.supabaseService
        .getAdminClient()
        .from('payment_logs')
        .insert({
          order_id: orderId,
          user_id: userId,  // 添加用户ID
          charge_id: charge.id,
          channel,
          amount: charge.amount,
          currency: charge.currency,
          status: charge.paid ? 'succeeded' : 'pending',
          charge_data: charge,
        });

      if (insertError) {
        this.logger.error(`Failed to save payment log: ${JSON.stringify(insertError)}`);
        throw new Error('Failed to save payment record');
      }

      // 7. 更新订单状态为pending_payment
      await this.supabaseService
        .getAdminClient()
        .from('orders')
        .update({ status: 'pending_payment' })
        .eq('id', orderId);

      this.logger.log(`Charge created successfully: ${charge.id}`);
      return { charge };
    } catch (error) {
      this.logger.error(`Create charge failed: ${error.message}`);
      throw error;
    }
  }

  private normalizeClientIp(ip?: string): string {
    if (!ip) return '127.0.0.1';
    const v4 = ip.replace(/^::ffff:/, '');
    return /^(\d{1,3}\.){3}\d{1,3}$/.test(v4) ? v4 : '127.0.0.1';
  }

  /**
   * 构建不同支付渠道的extra参数
   */
  private buildChannelExtra(channel: string, order: any): any {
    // Ping++ 要求：测试环境使用 127.0.0.1 而不是 localhost
    // 将 localhost 替换为 127.0.0.1
    let frontendUrl = this.frontendUrl;
    if (frontendUrl.includes('localhost')) {
      frontendUrl = frontendUrl.replace('localhost', '127.0.0.1');
      this.logger.log(`Replaced localhost with 127.0.0.1 for Ping++ compatibility: ${frontendUrl}`);
    }
    
    // 使用查询参数格式，避免 URL 编码问题
    // 使用 order_number 而不是 UUID
    const successUrl = `${frontendUrl}/payment/success?order=${encodeURIComponent(order.order_number)}`;
    const cancelUrl = `${frontendUrl}/payment/cancel?order=${encodeURIComponent(order.order_number)}`;
    
    this.logger.log(`Building channel extra for ${channel}, success_url: ${successUrl}`);
    
    switch (channel) {
      case 'alipay_wap':
        return {
          success_url: successUrl,
          cancel_url: cancelUrl,  // iOS 设备上可能跳转到这里
        };
      case 'alipay_pc_direct':
        return {
          success_url: successUrl,
        };
      case 'wx_wap':
        return {
          result_url: successUrl,  // 微信使用 result_url
        };
      case 'wx_pub':
        // 微信公众号支付需要openid
        return {
          open_id: order.contact_info?.wechat_openid || '',
        };
      default:
        return {};
    }
  }

  /**
   * 处理Ping++ Webhook回调
   */
  async handlePaymentWebhook(rawBody: string, signature: string) {
    try {
      // 1. 验证签名
      if (!this.verifyWebhookSignature(rawBody, signature)) {
        this.logger.warn('Invalid webhook signature');
        return { status: 'signature_invalid' };
      }

      // 2. 解析webhook数据
      const event = JSON.parse(rawBody);
      this.logger.log(`Received webhook event: ${event.type}, ID: ${event.id}`);

      // 3. 防止重放攻击 - 检查事件是否已处理
      const { data: existing } = await this.supabaseService
        .getAdminClient()
        .from('payment_logs')
        .select('*')
        .eq('ping_event_id', event.id)
        .single();

      if (existing) {
        this.logger.log(`Event ${event.id} already processed`);
        return { status: 'already_processed' };
      }

      // 4. 根据事件类型处理
      if (event.type === 'charge.succeeded') {
        await this.handleChargeSucceeded(event.data.object);
      } else if (event.type === 'refund.succeeded') {
        await this.handleRefundSucceeded(event.data.object);
      }

      return { status: 'success' };
    } catch (error) {
      this.logger.error(`Webhook processing failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * 处理支付成功事件
   */
  private async handleChargeSucceeded(charge: any) {
    this.logger.log(`Processing charge succeeded: ${charge.id}`);

    // 1. 更新payment_logs
    const { error: updateError } = await this.supabaseService
      .getAdminClient()
      .from('payment_logs')
      .update({
        status: 'succeeded',
        paid_at: new Date(charge.time_paid * 1000).toISOString(),
        ping_event_id: charge.id,
        charge_data: charge,
      })
      .eq('charge_id', charge.id);

    if (updateError) {
      this.logger.error(`Failed to update payment log: ${JSON.stringify(updateError)}`);
      throw new Error('Failed to update payment record');
    }

    // 2. 更新订单状态为paid
    const { data: paymentLog } = await this.supabaseService
      .getAdminClient()
      .from('payment_logs')
      .select('order_id')
      .eq('charge_id', charge.id)
      .single();

    if (paymentLog) {
      await this.supabaseService
        .getAdminClient()
        .from('orders')
        .update({
          status: 'paid',
          paid_at: new Date(charge.time_paid * 1000).toISOString(),
        })
        .eq('id', paymentLog.order_id);

      this.logger.log(`Order ${paymentLog.order_id} marked as paid`);
    }
  }

  /**
   * 处理退款成功事件
   */
  private async handleRefundSucceeded(refund: any) {
    this.logger.log(`Processing refund succeeded: ${refund.id}`);

    // 1. 更新refund_logs
    await this.supabaseService
      .getAdminClient()
      .from('refund_logs')
      .update({
        status: 'succeeded',
        succeeded_at: new Date(refund.time_succeed * 1000).toISOString(),
        refund_data: refund,
      })
      .eq('refund_id', refund.id);

    // 2. 更新订单状态为refunded
    const { data: refundLog } = await this.supabaseService
      .getAdminClient()
      .from('refund_logs')
      .select('charge_id')
      .eq('refund_id', refund.id)
      .single();

    if (refundLog) {
      const { data: paymentLog } = await this.supabaseService
        .getAdminClient()
        .from('payment_logs')
        .select('order_id')
        .eq('charge_id', refundLog.charge_id)
        .single();

      if (paymentLog) {
        await this.supabaseService
          .getAdminClient()
          .from('orders')
          .update({ status: 'refunded' })
          .eq('id', paymentLog.order_id);

        this.logger.log(`Order ${paymentLog.order_id} marked as refunded`);
      }
    }
  }

  /**
   * 验证Webhook签名
   */
  private verifyWebhookSignature(rawBody: string, signature: string): boolean {
    if (!this.publicKey) {
      this.logger.warn('Public key not configured, skipping signature verification');
      return true;  // 开发环境可能没有配置公钥
    }

    try {
      const verifier = crypto.createVerify('RSA-SHA256');
      verifier.update(rawBody);
      return verifier.verify(this.publicKey, signature, 'base64');
    } catch (error) {
      this.logger.error(`Signature verification error: ${error.message}`);
      return false;
    }
  }

  /**
   * 查询支付状态
   */
  async verifyPayment(orderId: string, userId: string) {
    // 验证订单所有权
    const { data: order } = await this.supabaseService
      .getAdminClient()
      .from('orders')
      .select('user_id, status')
      .eq('id', orderId)
      .single();

    if (!order || order.user_id !== userId) {
      throw new NotFoundException('Order not found');
    }

    // 查询支付记录
    const { data: payment } = await this.supabaseService
      .getAdminClient()
      .from('payment_logs')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return {
      order_id: orderId,
      order_status: order.status,
      payment_status: payment?.status || 'not_found',
      payment,
    };
  }

  /**
   * 通过订单号查询支付状态（用于支付回跳页面）
   */
  async verifyPaymentByOrderNumber(orderNumber: string) {
    // 1. 通过 order_number 查询订单
    const { data: order } = await this.supabaseService
      .getAdminClient()
      .from('orders')
      .select('id, order_number, total_amount, status, user_id, paid_at')
      .eq('order_number', orderNumber)
      .single();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // 2. 查询支付记录
    const { data: payment } = await this.supabaseService
      .getAdminClient()
      .from('payment_logs')
      .select('*')
      .eq('order_id', order.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // 3. 如果支付记录存在但状态为 pending，主动查询 Ping++
    if (payment && payment.status === 'pending') {
      try {
        const charge = await this.pingpp.charges.retrieve(payment.charge_id);
        
        // 如果支付宝/微信已经支付成功，但 webhook 未触发，手动更新状态
        if (charge.paid) {
          this.logger.log(`Payment succeeded for charge ${charge.id}, updating order status`);
          await this.handleChargeSucceeded(charge);
          
          // 递归查询更新后的状态
          return this.verifyPaymentByOrderNumber(orderNumber);
        }
      } catch (error) {
        this.logger.warn(`Failed to query charge status: ${error.message}`);
      }
    }

    return {
      order_id: order.id,
      order_number: order.order_number,
      order_status: order.status,
      total_amount: order.total_amount,
      paid_at: order.paid_at,
      payment_status: payment?.status || 'not_found',
      payment,
    };
  }

  /**
   * 创建退款
   */
  async createRefund(createRefundDto: CreateRefundDto, userId: string) {
    const { orderId, amount, reason } = createRefundDto;

    try {
      // 1. 查询订单并验证所有权
      const { data: order } = await this.supabaseService
        .getAdminClient()
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (!order || order.user_id !== userId) {
        throw new NotFoundException('Order not found');
      }

      // 2. 查询支付记录
      const { data: payment } = await this.supabaseService
        .getAdminClient()
        .from('payment_logs')
        .select('*')
        .eq('order_id', orderId)
        .eq('status', 'succeeded')
        .single();

      if (!payment) {
        throw new NotFoundException('No successful payment found for this order');
      }

      // 3. 验证退款金额
      const refundAmount = amount || payment.amount;
      if (refundAmount > payment.amount) {
        throw new BadRequestException('Refund amount exceeds payment amount');
      }

      // 4. 创建Ping++退款
      const refundParams = {
        description: reason || '用户申请退款',
        amount: refundAmount,
      };

      this.logger.log(`Creating refund for charge ${payment.charge_id}`);
      const refund = await this.pingpp.charges.createRefund(
        payment.charge_id,
        refundParams,
      );

      // 5. 保存退款记录
      await this.supabaseService
        .getAdminClient()
        .from('refund_logs')
        .insert({
          refund_id: refund.id,
          charge_id: payment.charge_id,
          amount: refund.amount,
          status: refund.succeed ? 'succeeded' : 'pending',
          reason,
          refund_data: refund,
        });

      this.logger.log(`Refund created: ${refund.id}`);
      return { refund };
    } catch (error) {
      this.logger.error(`Create refund failed: ${error.message}`);
      throw error;
    }
  }
}

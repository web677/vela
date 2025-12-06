import { Controller, Post, Get, Body, Param, Headers, RawBodyRequest, Req, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreateChargeDto } from './dto/create-charge.dto';
import { CreateRefundDto } from './dto/create-refund.dto';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * 创建支付订单
   * POST /api/payments/create
   */
  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createCharge(
    @Body() createChargeDto: CreateChargeDto,
    @Req() req: any,
  ) {
    // 从请求中获取用户ID
    const userId = req.user?.id;
    if (!userId) {
      return { success: false, message: 'Unauthorized' };
    }

    // 获取客户端IP
    const clientIp = req.ip || req.connection.remoteAddress;
    createChargeDto.clientIp = clientIp;

    const result = await this.paymentsService.createCharge(createChargeDto, userId);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * Webhook回调接口
   * POST /api/payments/webhook
   */
  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-pingplusplus-signature') signature: string,
  ) {
    // 获取原始请求体
    const rawBody = req.rawBody?.toString('utf8') || JSON.stringify(req.body);
    
    const result = await this.paymentsService.handlePaymentWebhook(rawBody, signature);
    return result;
  }

  /**
   * 查询支付状态
   * GET /api/payments/verify/:orderId
   */
  @Get('verify/:orderId')
  @UseGuards(JwtAuthGuard)
  async verifyPayment(
    @Param('orderId') orderId: string,
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      return { success: false, message: 'Unauthorized' };
    }

    const result = await this.paymentsService.verifyPayment(orderId, userId);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 通过订单号查询支付状态（用于支付回跳页面）
   * GET /api/payments/verify-by-order/:orderNumber
   */
  @Get('verify-by-order/:orderNumber')
  async verifyPaymentByOrderNumber(
    @Param('orderNumber') orderNumber: string,
  ) {
    const result = await this.paymentsService.verifyPaymentByOrderNumber(orderNumber);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 创建退款
   * POST /api/refunds/create
   */
  @Post('/refunds/create')
  @UseGuards(JwtAuthGuard)
  async createRefund(
    @Body() createRefundDto: CreateRefundDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      return { success: false, message: 'Unauthorized' };
    }

    const result = await this.paymentsService.createRefund(createRefundDto, userId);
    return {
      success: true,
      data: result,
    };
  }
}

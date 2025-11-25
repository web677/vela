import { Controller, Post, Body } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('create')
  createPayment(
    @Body() body: { order_id: string; payment_method: string },
  ) {
    return this.paymentsService.createPayment(
      body.order_id,
      body.payment_method,
    );
  }

  @Post('callback')
  handleCallback(
    @Body()
    body: { order_id: string; status: string; transaction_id: string },
  ) {
    return this.paymentsService.handleCallback(
      body.order_id,
      body.status,
      body.transaction_id,
    );
  }
}

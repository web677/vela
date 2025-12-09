import { Controller, Get, Query } from '@nestjs/common';
import { AdminShippingService } from '../admin/admin-shipping.service';

@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: AdminShippingService) {}

  // 公开接口 - 计算运费
  @Get('calculate')
  calculateShipping(
    @Query('province') province: string,
    @Query('amount') amount: string,
  ) {
    return this.shippingService.calculateShipping(
      province,
      amount ? parseFloat(amount) : 0,
    );
  }
}

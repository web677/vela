import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { AdminShippingService, ShippingRule } from './admin-shipping.service';
import { AdminAuthGuard } from './admin-auth.guard';

@Controller('admin/shipping')
export class AdminShippingController {
  constructor(private readonly shippingService: AdminShippingService) {}

  @Get('rules')
  @UseGuards(AdminAuthGuard)
  findAll() {
    return this.shippingService.findAll();
  }

  @Post('rules')
  @UseGuards(AdminAuthGuard)
  create(@Body() rule: ShippingRule) {
    return this.shippingService.create(rule);
  }

  @Patch('rules/:id')
  @UseGuards(AdminAuthGuard)
  update(@Param('id') id: string, @Body() rule: Partial<ShippingRule>) {
    return this.shippingService.update(id, rule);
  }

  @Delete('rules/:id')
  @UseGuards(AdminAuthGuard)
  delete(@Param('id') id: string) {
    return this.shippingService.delete(id);
  }

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

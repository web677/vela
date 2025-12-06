import { Controller, Get, Param } from '@nestjs/common';
import { LogisticsService } from './logistics.service';

@Controller('logistics')
export class LogisticsController {
  constructor(private logisticsService: LogisticsService) {}

  @Get(':trackingNumber')
  async getTracking(@Param('trackingNumber') trackingNumber: string) {
    return this.logisticsService.queryTracking(trackingNumber);
  }
}

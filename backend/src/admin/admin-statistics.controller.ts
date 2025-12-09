import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminStatisticsService } from './admin-statistics.service';
import { AdminAuthGuard } from './admin-auth.guard';

@Controller('admin/statistics')
@UseGuards(AdminAuthGuard)
export class AdminStatisticsController {
  constructor(private readonly statisticsService: AdminStatisticsService) {}

  @Get('overview')
  getOverview() {
    return this.statisticsService.getOverview();
  }

  @Get('sales')
  getSalesData(@Query('days') days?: string) {
    return this.statisticsService.getSalesData(days ? parseInt(days, 10) : 7);
  }

  @Get('products')
  getProductStats() {
    return this.statisticsService.getProductStats();
  }
}

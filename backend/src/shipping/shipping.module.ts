import { Module } from '@nestjs/common';
import { ShippingController } from './shipping.controller';
import { AdminShippingService } from '../admin/admin-shipping.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ShippingController],
  providers: [AdminShippingService],
  exports: [AdminShippingService],
})
export class ShippingModule {}

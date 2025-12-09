import { Module } from '@nestjs/common';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { AdminOrdersController } from './admin-orders.controller';
import { AdminOrdersService } from './admin-orders.service';
import { AdminProductsController } from './admin-products.controller';
import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from './admin-users.service';
import { AdminStatisticsController } from './admin-statistics.controller';
import { AdminStatisticsService } from './admin-statistics.service';
import { AdminShippingController } from './admin-shipping.controller';
import { AdminShippingService } from './admin-shipping.service';
import { DatabaseModule } from '../database/database.module';
import { ProductsModule } from '../products/products.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    DatabaseModule,
    ProductsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('ADMIN_JWT_SECRET') || configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    AdminAuthController,
    AdminOrdersController,
    AdminProductsController,
    AdminUsersController,
    AdminStatisticsController,
    AdminShippingController,
  ],
  providers: [
    AdminAuthService,
    AdminOrdersService,
    AdminUsersService,
    AdminStatisticsService,
    AdminShippingService,
  ],
})
export class AdminModule {}

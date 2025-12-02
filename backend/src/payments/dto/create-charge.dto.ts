import { IsNotEmpty, IsString, IsNumber, IsOptional, IsIn, Min } from 'class-validator';

export class CreateChargeDto {
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(['alipay_wap', 'alipay_pc_direct', 'wx_pub', 'wx_wap'])
  channel: string;

  @IsOptional()
  @IsString()
  clientIp?: string;

  @IsOptional()
  extra?: any;  // 渠道额外参数
}

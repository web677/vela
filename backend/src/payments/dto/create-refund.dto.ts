import { IsNotEmpty, IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateRefundDto {
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  amount?: number;  // 退款金额（分），不填则全额退款

  @IsOptional()
  @IsString()
  reason?: string;  // 退款原因
}

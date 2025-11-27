import { IsNotEmpty, IsString, Matches, IsOptional, IsIn } from 'class-validator';

export class PhoneLoginDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?\d{6,15}$/)
  phone!: string;

  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsOptional()
  @IsString()
  @IsIn(['male', 'female'])
  gender?: string;
}
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class PhoneLoginDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?\d{6,15}$/)
  phone!: string;

  @IsString()
  @IsNotEmpty()
  token!: string;
}
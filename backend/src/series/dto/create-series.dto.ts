import { IsString, IsOptional, IsHexColor, IsInt, IsBoolean, MaxLength } from 'class-validator';

export class CreateSeriesDto {
  @IsString()
  @MaxLength(50)
  slug: string;

  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  name_en?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  subtitle?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsHexColor()
  @IsOptional()
  theme_color?: string;

  @IsString()
  @IsOptional()
  hero_image_url?: string;

  @IsInt()
  @IsOptional()
  sort_order?: number;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

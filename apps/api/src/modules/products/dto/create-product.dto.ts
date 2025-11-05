import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
  IsUUID,
  IsArray,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Decimal } from '@prisma/client/runtime/library';

export class CreateProductDto {
  @ApiProperty({ example: 'Hambúrguer Artesanal' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Hambúrguer 180g com queijo cheddar' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsUUID()
  establishmentId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({ example: 25.90 })
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  price: Decimal;

  @ApiPropertyOptional({ example: 12.50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  cost?: Decimal;

  @ApiPropertyOptional({ example: 'HAMB001' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({ example: '7891234567890' })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  trackInventory?: boolean;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  currentStock?: Decimal;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  minStock?: Decimal;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  maxStock?: Decimal;

  @ApiPropertyOptional({ example: 'un' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ example: 'https://example.com/image1.jpg' })
  @IsOptional()
  @IsString()
  primaryImage?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ example: 15 })
  @IsOptional()
  @IsInt()
  @Min(0)
  preparationTime?: number;

  @ApiPropertyOptional({ example: ['hamburguer', 'artesanal', 'cheddar'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
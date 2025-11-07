import { IsString, IsBoolean, IsEnum, IsOptional, IsNumber, Min, Max, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { PaymentType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export class CreatePaymentMethodDto {
  @ApiProperty()
  @IsString()
  establishmentId: string;

  @ApiProperty({ example: 'Cartão de Crédito Visa' })
  @IsString()
  name: string;

  @ApiProperty({ enum: PaymentType })
  @IsEnum(PaymentType)
  type: PaymentType;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  requiresChange?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  hasFee?: boolean;

  @ApiPropertyOptional({ example: 2.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Transform(({ value }) => parseFloat(value))
  feePercentage?: Decimal;

  @ApiPropertyOptional({ example: 0.50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  feeFixed?: Decimal;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gatewayId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  gatewayConfig?: any;
}
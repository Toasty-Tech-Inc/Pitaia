import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsInt,
  IsEnum,
  IsDateString,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Decimal } from '@prisma/client/runtime/library';
import { DiscountType } from '@prisma/client';

export class CreateCouponDto {
  @ApiProperty({ example: 'DESCONTO10', description: 'Código do cupom' })
  @IsString()
  code: string;

  @ApiPropertyOptional({
    example: 'Desconto de 10% em todos os produtos',
    description: 'Descrição do cupom',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    enum: DiscountType,
    example: DiscountType.PERCENTAGE,
    description: 'Tipo de desconto',
  })
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiProperty({
    example: 10.0,
    description: 'Valor do desconto (percentual ou valor fixo)',
  })
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  discountValue: Decimal;

  @ApiPropertyOptional({
    example: 50.0,
    description: 'Valor mínimo de compra para usar o cupom',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  minPurchase?: Decimal;

  @ApiPropertyOptional({
    example: 100.0,
    description: 'Desconto máximo (para cupons percentuais)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  @ValidateIf((o) => o.discountType === DiscountType.PERCENTAGE)
  maxDiscount?: Decimal;

  @ApiPropertyOptional({
    example: 100,
    description: 'Limite total de usos do cupom',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  usageLimit?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Limite de usos por cliente',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  perCustomerLimit?: number;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Data de início da validade',
  })
  @IsDateString()
  validFrom: string;

  @ApiPropertyOptional({
    example: '2024-12-31T23:59:59.000Z',
    description: 'Data de fim da validade',
  })
  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    default: false,
    description: 'Se o cupom é público (visível para clientes)',
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({
    default: false,
    description: 'Se o cupom foi gerado por IA',
  })
  @IsOptional()
  @IsBoolean()
  aiGenerated?: boolean;

  @ApiPropertyOptional({
    description: 'Motivo da geração por IA',
  })
  @IsOptional()
  @IsString()
  aiReason?: string;
}


import { IsString, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Decimal } from '@prisma/client/runtime/library';

export class ValidateCouponDto {
  @ApiProperty({ example: 'DESCONTO10', description: 'Código do cupom' })
  @IsString()
  code: string;

  @ApiProperty({
    example: 100.0,
    description: 'Valor total do pedido',
  })
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  purchaseAmount: Decimal;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID do cliente (para verificar limite por cliente)',
  })
  @IsOptional()
  @IsUUID()
  customerId?: string;
}


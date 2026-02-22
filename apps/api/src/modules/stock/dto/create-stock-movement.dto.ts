import {
  IsString,
  IsOptional,
  IsNumber,
  IsUUID,
  IsEnum,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { StockMovementType } from '@prisma/client';

export class CreateStockMovementDto {
  @ApiProperty({ description: 'ID do produto' })
  @IsUUID()
  productId: string;

  @ApiProperty({
    enum: StockMovementType,
    description: 'Tipo de movimentação',
  })
  @IsEnum(StockMovementType)
  type: StockMovementType;

  @ApiProperty({ example: 10, description: 'Quantidade movimentada' })
  @IsNumber()
  @Min(0.001)
  @Transform(({ value }) => parseFloat(value))
  quantity: number;

  @ApiPropertyOptional({ description: 'Motivo da movimentação' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ description: 'Referência externa (ex: número da NF)' })
  @IsOptional()
  @IsString()
  reference?: string;
}

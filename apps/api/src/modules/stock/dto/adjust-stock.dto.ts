import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { StockMovementType } from '@prisma/client';

export class AdjustStockDto {
  @ApiProperty({
    enum: [StockMovementType.ADJUSTMENT, StockMovementType.LOSS, StockMovementType.PURCHASE, StockMovementType.RETURN],
    description: 'Tipo de ajuste',
  })
  @IsEnum(StockMovementType)
  type: StockMovementType;

  @ApiProperty({ example: 10, description: 'Quantidade a ajustar' })
  @IsNumber()
  @Min(0.001)
  @Transform(({ value }) => parseFloat(value))
  quantity: number;

  @ApiProperty({ description: 'Motivo do ajuste' })
  @IsString()
  reason: string;

  @ApiPropertyOptional({ description: 'Referência externa' })
  @IsOptional()
  @IsString()
  reference?: string;
}

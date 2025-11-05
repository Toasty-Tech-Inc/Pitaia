import { IsNumber, IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export enum StockOperationType {
  ADD = 'ADD',
  SUBTRACT = 'SUBTRACT',
  SET = 'SET',
}

export class UpdateStockDto {
  @ApiProperty({ enum: StockOperationType })
  @IsEnum(StockOperationType)
  operation: StockOperationType;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  quantity: number;

  @ApiPropertyOptional({ example: 'Compra de estoque' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reference?: string;
}
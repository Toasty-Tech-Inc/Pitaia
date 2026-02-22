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
import { CashMovementType } from '@prisma/client';

export class CreateCashMovementDto {
  @ApiProperty({ description: 'ID da sessão de caixa' })
  @IsUUID()
  cashierSessionId: string;

  @ApiProperty({
    enum: CashMovementType,
    description: 'Tipo de movimentação (DEPOSIT, WITHDRAWAL, ADJUSTMENT)',
  })
  @IsEnum(CashMovementType)
  type: CashMovementType;

  @ApiProperty({ example: 100.00, description: 'Valor da movimentação' })
  @IsNumber()
  @Min(0.01)
  @Transform(({ value }) => parseFloat(value))
  amount: number;

  @ApiProperty({ description: 'Motivo da movimentação' })
  @IsString()
  reason: string;

  @ApiPropertyOptional({ description: 'Observações adicionais' })
  @IsOptional()
  @IsString()
  notes?: string;
}

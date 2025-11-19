import { IsInt, IsString, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LoyaltyTransactionType } from '@prisma/client';

export class AddLoyaltyPointsDto {
  @ApiProperty({
    example: 100,
    description: 'Quantidade de pontos (positivo para adicionar, negativo para remover)',
  })
  @IsInt()
  points: number;

  @ApiPropertyOptional({
    enum: LoyaltyTransactionType,
    example: LoyaltyTransactionType.ADJUSTED,
    description: 'Tipo de transação',
  })
  @IsOptional()
  type?: LoyaltyTransactionType;

  @ApiPropertyOptional({
    example: 'Ajuste manual de pontos',
    description: 'Descrição da transação',
  })
  @IsOptional()
  @IsString()
  description?: string;
}


import {
  IsString,
  IsOptional,
  IsNumber,
  IsUUID,
  IsEnum,
  IsDateString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { LoyaltyTransactionType } from '@prisma/client';

export class CreateLoyaltyTransactionDto {
  @ApiProperty({ description: 'ID do cliente' })
  @IsUUID()
  customerId: string;

  @ApiPropertyOptional({ description: 'ID da venda (se relacionado)' })
  @IsOptional()
  @IsUUID()
  saleId?: string;

  @ApiProperty({
    enum: LoyaltyTransactionType,
    description: 'Tipo de transação',
  })
  @IsEnum(LoyaltyTransactionType)
  type: LoyaltyTransactionType;

  @ApiProperty({ example: 100, description: 'Quantidade de pontos' })
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  points: number;

  @ApiPropertyOptional({ description: 'Descrição da transação' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Data de expiração dos pontos' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

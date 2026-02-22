import {
  IsString,
  IsOptional,
  IsNumber,
  IsUUID,
  IsBoolean,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateDynamicPriceDto {
  @ApiProperty({ description: 'ID do produto' })
  @IsUUID()
  productId: string;

  @ApiPropertyOptional({
    example: 0,
    description: 'Dia da semana (0=domingo, 6=sábado)',
    minimum: 0,
    maximum: 6,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(6)
  @Transform(({ value }) => parseInt(value))
  dayOfWeek?: number;

  @ApiPropertyOptional({ example: '18:00', description: 'Horário de início (HH:MM)' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'startTime deve estar no formato HH:MM',
  })
  startTime?: string;

  @ApiPropertyOptional({ example: '22:00', description: 'Horário de fim (HH:MM)' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'endTime deve estar no formato HH:MM',
  })
  endTime?: string;

  @ApiProperty({ example: 29.90, description: 'Preço dinâmico' })
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  price: number;

  @ApiProperty({
    example: 15,
    description: 'Percentual de ajuste em relação ao preço original',
  })
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  adjustment: number;

  @ApiPropertyOptional({ description: 'Motivo do ajuste' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({
    example: 85.5,
    description: 'Nível de confiança da IA (0-100)',
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @Transform(({ value }) => parseFloat(value))
  confidence: number;

  @ApiPropertyOptional({ default: true, description: 'Se o preço dinâmico está ativo' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

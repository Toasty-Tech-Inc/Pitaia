import {
  IsString,
  IsOptional,
  IsNumber,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class RedeemPointsDto {
  @ApiProperty({ example: 100, description: 'Quantidade de pontos a resgatar' })
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  points: number;

  @ApiPropertyOptional({ description: 'ID da venda relacionada' })
  @IsOptional()
  @IsUUID()
  saleId?: string;

  @ApiPropertyOptional({ description: 'Descrição do resgate' })
  @IsOptional()
  @IsString()
  description?: string;
}

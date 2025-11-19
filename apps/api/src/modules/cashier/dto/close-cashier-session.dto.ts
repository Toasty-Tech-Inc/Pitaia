import { IsNumber, Min, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CloseCashierSessionDto {
  @ApiProperty({ example: 1250.50 })
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  closingAmount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
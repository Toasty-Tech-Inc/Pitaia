import { IsUUID, IsNumber, Min, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class OpenCashierSessionDto {
  @ApiProperty()
  @IsUUID()
  establishmentId: string;

  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty({ example: 100.00 })
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  openingAmount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
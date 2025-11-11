import { IsString, IsUUID, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateSaleDto {
  @ApiProperty()
  @IsUUID()
  establishmentId: string;

  @ApiProperty()
  @IsUUID()
  orderId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiProperty()
  @IsUUID()
  sellerId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  cashierSessionId?: string;

  @ApiProperty({ example: 89.80 })
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  subtotal: number;

  @ApiPropertyOptional({ example: 8.98, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  discount?: number;

  @ApiProperty({ example: 89.80 })
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  total: number;
}
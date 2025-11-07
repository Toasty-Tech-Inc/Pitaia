import { IsString, IsNumber, IsEnum, IsOptional, IsInt, Min, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { PaymentStatus } from '@prisma/client';

export class CreatePaymentDto {
  @ApiProperty()
  @IsUUID()
  saleId: string;

  @ApiProperty()
  @IsUUID()
  paymentMethodId: string;

  @ApiProperty({ example: 50.00 })
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  amount: number;

  @ApiPropertyOptional({ enum: PaymentStatus, default: PaymentStatus.PENDING })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  authorizationCode?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  installments?: number;

  @ApiPropertyOptional()
  @IsOptional()
  gatewayResponse?: any;
}
import { IsArray, ValidateNested, IsNumber, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';

export class PaymentItemDto {
  @ApiProperty()
  @IsUUID()
  paymentMethodId: string;

  @ApiProperty({ example: 50.00 })
  @IsNumber()
  @Min(0.01)
  @Transform(({ value }) => parseFloat(value))
  amount: number;
}

export class ProcessPaymentDto {
  @ApiProperty({ type: [PaymentItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentItemDto)
  payments: PaymentItemDto[];
}
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefundPaymentDto {
  @ApiProperty({ example: 'Cliente solicitou cancelamento' })
  @IsString()
  reason: string;
}
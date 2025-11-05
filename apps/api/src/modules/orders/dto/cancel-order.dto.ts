import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelOrderDto {
  @ApiProperty({ example: 'Cliente desistiu do pedido' })
  @IsString()
  reason: string;
}
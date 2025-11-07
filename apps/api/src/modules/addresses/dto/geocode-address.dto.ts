import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GeocodeAddressDto {
  @ApiProperty({ example: '01000000' })
  @IsString()
  zipCode: string;
}
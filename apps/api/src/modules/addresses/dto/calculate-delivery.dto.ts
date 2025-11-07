import { IsString, IsUUID, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CalculateDeliveryDto {
  @ApiProperty({ description: 'ID do estabelecimento' })
  @IsUUID()
  establishmentId: string;

  @ApiPropertyOptional({ description: 'ID do endereço do cliente' })
  @IsOptional()
  @IsUUID()
  addressId?: string;

  @ApiPropertyOptional({ description: 'CEP de destino (se não tiver addressId)' })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiPropertyOptional({ description: 'Latitude de destino (opcional)' })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude de destino (opcional)' })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}
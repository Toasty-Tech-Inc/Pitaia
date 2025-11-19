import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsUUID,
  IsEnum,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TableStatus } from '@prisma/client';

export class CreateTableDto {
  @ApiProperty({ example: 'Mesa 1' })
  @IsString()
  number: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  establishmentId: string;

  @ApiProperty({ example: 4, description: 'Capacidade da mesa' })
  @IsInt()
  @Min(1)
  capacity: number;

  @ApiPropertyOptional({ example: 'Salão', description: 'Localização da mesa' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    enum: TableStatus,
    default: TableStatus.AVAILABLE,
    description: 'Status da mesa',
  })
  @IsOptional()
  @IsEnum(TableStatus)
  status?: TableStatus;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: 'QR_CODE_STRING',
    description: 'Código QR para pedidos',
  })
  @IsOptional()
  @IsString()
  qrCode?: string;
}


import { IsString, IsEnum, IsBoolean, IsOptional, IsInt, Min, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ModifierType } from '@prisma/client';

export class CreateProductModifierDto {
  @ApiProperty()
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 'Ponto da Carne' })
  @IsString()
  name: string;

  @ApiProperty({ enum: ModifierType })
  @IsEnum(ModifierType)
  type: ModifierType;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  minChoices?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  maxChoices?: number;
}
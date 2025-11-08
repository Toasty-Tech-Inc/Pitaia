import { IsArray, ValidateNested, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateProductModifierDto } from './create-product-modifier.dto';
import { CreateModifierOptionDto } from './create-modifier-option.dto';

export class ModifierWithOptionsDto extends CreateProductModifierDto {
  @ApiProperty({ type: [CreateModifierOptionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateModifierOptionDto)
  options: CreateModifierOptionDto[];
}

export class BulkCreateModifierDto {
  @ApiProperty()
  @IsUUID()
  productId: string;

  @ApiProperty({ type: [ModifierWithOptionsDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModifierWithOptionsDto)
  modifiers: ModifierWithOptionsDto[];
}
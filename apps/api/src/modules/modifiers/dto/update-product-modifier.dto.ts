import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateProductModifierDto } from './create-product-modifier.dto';

export class UpdateProductModifierDto extends PartialType(
  OmitType(CreateProductModifierDto, ['productId'] as const),
) {}
import { ProductModifier, ModifierOption } from '@prisma/client';
import { CreateProductModifierDto } from '../dto/create-product-modifier.dto';
import { UpdateProductModifierDto } from '../dto/update-product-modifier.dto';
import { CreateModifierOptionDto } from '../dto/create-modifier-option.dto';
import { UpdateModifierOptionDto } from '../dto/update-modifier-option.dto';

export interface IModifierService {
  // Product Modifiers
  createModifier(dto: CreateProductModifierDto): Promise<ProductModifier>;
  findModifiersByProduct(productId: string): Promise<ProductModifier[]>;
  findOneModifier(id: string): Promise<ProductModifier>;
  updateModifier(id: string, dto: UpdateProductModifierDto): Promise<ProductModifier>;
  removeModifier(id: string): Promise<void>;
  toggleRequired(id: string): Promise<ProductModifier>;

  // Modifier Options
  createOption(modifierId: string, dto: CreateModifierOptionDto): Promise<ModifierOption>;
  findOptionsByModifier(modifierId: string): Promise<ModifierOption[]>;
  findOneOption(id: string): Promise<ModifierOption>;
  updateOption(id: string, dto: UpdateModifierOptionDto): Promise<ModifierOption>;
  removeOption(id: string): Promise<void>;
  setAsDefault(id: string): Promise<ModifierOption>;
}
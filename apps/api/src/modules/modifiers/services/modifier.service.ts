import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ProductModifier, ModifierOption, Prisma } from '@prisma/client';
import { ProductModifierRepository } from '../repositories/product-modifier.repository';
import { ModifierOptionRepository } from '../repositories/modifier-option.repository';
import { IModifierService } from '../contracts/modifier-service.interface';
import { CreateProductModifierDto } from '../dto/create-product-modifier.dto';
import { UpdateProductModifierDto } from '../dto/update-product-modifier.dto';
import { CreateModifierOptionDto } from '../dto/create-modifier-option.dto';
import { UpdateModifierOptionDto } from '../dto/update-modifier-option.dto';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class ModifierService implements IModifierService {
  constructor(
    private readonly modifierRepository: ProductModifierRepository,
    private readonly optionRepository: ModifierOptionRepository,
    private readonly prisma: PrismaService,
  ) {}

  // ============================================
  // PRODUCT MODIFIERS
  // ============================================

  async createModifier(dto: CreateProductModifierDto): Promise<ProductModifier> {
    // Verificar se produto existe
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    // Validar minChoices e maxChoices
    if (dto.minChoices !== undefined && dto.maxChoices !== undefined) {
      if (dto.minChoices > dto.maxChoices) {
        throw new BadRequestException(
          'minChoices não pode ser maior que maxChoices',
        );
      }
    }

    return this.modifierRepository.create(dto);
  }

  async findModifiersByProduct(productId: string): Promise<ProductModifier[]> {
    return this.modifierRepository.findByProduct(productId);
  }

  async findOneModifier(id: string): Promise<ProductModifier> {
    const modifier = await this.modifierRepository.findById(id);
    if (!modifier) {
      throw new NotFoundException('Modificador não encontrado');
    }
    return modifier;
  }

  async updateModifier(
    id: string,
    dto: UpdateProductModifierDto,
  ): Promise<ProductModifier> {
    await this.findOneModifier(id);

    // Validar minChoices e maxChoices
    if (dto.minChoices !== undefined && dto.maxChoices !== undefined) {
      if (dto.minChoices > dto.maxChoices) {
        throw new BadRequestException(
          'minChoices não pode ser maior que maxChoices',
        );
      }
    }

    return this.modifierRepository.update(id, dto);
  }

  async removeModifier(id: string): Promise<void> {
    await this.findOneModifier(id);

    // Verificar se há opções vinculadas
    const options = await this.optionRepository.findByModifier(id);
    if (options.length > 0) {
      throw new BadRequestException(
        'Não é possível excluir modificador com opções vinculadas. Exclua as opções primeiro.',
      );
    }

    await this.modifierRepository.delete(id);
  }

  async toggleRequired(id: string): Promise<ProductModifier> {
    await this.findOneModifier(id);
    return this.modifierRepository.toggleRequired(id);
  }

  // ============================================
  // MODIFIER OPTIONS
  // ============================================

  async createOption(
    modifierId: string,
    dto: CreateModifierOptionDto,
  ): Promise<ModifierOption> {
    // Verificar se modificador existe
    await this.findOneModifier(modifierId);

    // Se for definir como default, remover default das outras
    if (dto.isDefault) {
      await this.prisma.modifierOption.updateMany({
        where: { modifierId },
        data: { isDefault: false },
      });
    }

    // Se for a primeira opção, definir como default automaticamente
    const existingOptions = await this.optionRepository.findByModifier(
      modifierId,
    );
    const isFirstOption = existingOptions.length === 0;

    return this.optionRepository.create({
      ...dto,
      modifierId,
      price: new Prisma.Decimal(dto.price),
      isDefault: dto.isDefault || isFirstOption,
    });
  }

  async findOptionsByModifier(modifierId: string): Promise<ModifierOption[]> {
    return this.optionRepository.findByModifier(modifierId);
  }

  async findOneOption(id: string): Promise<ModifierOption> {
    const option = await this.optionRepository.findById(id);
    if (!option) {
      throw new NotFoundException('Opção não encontrada');
    }
    return option;
  }

  async updateOption(
    id: string,
    dto: UpdateModifierOptionDto,
  ): Promise<ModifierOption> {
    const option = await this.findOneOption(id);

    // Se alterar para default, remover default das outras
    if (dto.isDefault) {
      await this.prisma.modifierOption.updateMany({
        where: { modifierId: option.modifierId },
        data: { isDefault: false },
      });
    }

    return this.optionRepository.update(id, {
      ...dto,
      price: dto.price ? new Prisma.Decimal(dto.price) : undefined,
    });
  }

  async removeOption(id: string): Promise<void> {
    const option = await this.findOneOption(id);

    // Se for o default, definir outro como default
    if (option.isDefault) {
      const otherOptions = await this.optionRepository.findByModifier(
        option.modifierId,
      );
      const nextDefault = otherOptions.find((o) => o.id !== id);

      if (nextDefault) {
        await this.optionRepository.update(nextDefault.id, {
          isDefault: true,
        });
      }
    }

    await this.optionRepository.delete(id);
  }

  async setAsDefault(id: string): Promise<ModifierOption> {
    const option = await this.findOneOption(id);
    return this.optionRepository.setAsDefault(id, option.modifierId);
  }

  // ============================================
  // BULK OPERATIONS
  // ============================================

  async bulkCreateModifiers(
    productId: string,
    modifiers: Array<{
      name: string;
      type: any;
      isRequired?: boolean;
      minChoices?: number;
      maxChoices?: number;
      options: Array<{
        name: string;
        price: number;
        isDefault?: boolean;
      }>;
    }>,
  ): Promise<ProductModifier[]> {
    // Verificar se produto existe
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    const createdModifiers: ProductModifier[] = [];

    for (const modifierData of modifiers) {
      const { options, ...modifierDto } = modifierData;

      // Criar modificador
      const modifier = await this.modifierRepository.create({
        ...modifierDto,
        productId,
      });

      // Criar opções
      for (const optionData of options) {
        await this.optionRepository.create({
          ...optionData,
          modifierId: modifier.id,
          price: new Prisma.Decimal(optionData.price),
        });
      }

      // Buscar modificador com opções para retornar
      const modifierWithOptions = await this.modifierRepository.findById(
        modifier.id,
      );
      if (modifierWithOptions) {
        createdModifiers.push(modifierWithOptions);
      }
    }

    return createdModifiers;
  }

  async duplicateModifiers(
    sourceProductId: string,
    targetProductId: string,
  ): Promise<ProductModifier[]> {
    // Buscar modificadores do produto origem COM as opções
    const sourceModifiers = await this.modifierRepository.findByProduct(
      sourceProductId,
    );

    const duplicatedModifiers: ProductModifier[] = [];

    for (const sourceModifier of sourceModifiers) {
      // Criar modificador duplicado
      const newModifier = await this.modifierRepository.create({
        productId: targetProductId,
        name: sourceModifier.name,
        type: sourceModifier.type,
        isRequired: sourceModifier.isRequired,
        minChoices: sourceModifier.minChoices,
        maxChoices: sourceModifier.maxChoices,
      });

      //@ts-expect-error erro de lint do prisma, tá tudo certo 👍
      if (sourceModifier.options && Array.isArray(sourceModifier.options)) {
        //@ts-expect-error erro de lint do prisma, tá tudo certo 👍
        for (const option of sourceModifier.options) {
          await this.optionRepository.create({
            modifierId: newModifier.id,
            name: option.name,
            price: option.price,
            isDefault: option.isDefault,
          });
        }
      }

      // Buscar modificador completo para retornar
      const modifierWithOptions = await this.modifierRepository.findById(
        newModifier.id,
      );
      if (modifierWithOptions) {
        duplicatedModifiers.push(modifierWithOptions);
      }
    }

    return duplicatedModifiers;
  }
}
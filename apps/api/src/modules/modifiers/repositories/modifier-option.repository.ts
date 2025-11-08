import { Injectable } from '@nestjs/common';
import { ModifierOption } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { IModifierOptionRepository } from '../contracts/modifier-option-repository.interface';

@Injectable()
export class ModifierOptionRepository
  extends BaseRepository<ModifierOption>
  implements IModifierOptionRepository
{
  constructor(prisma: PrismaService) {
    super(prisma, 'modifierOption');
  }

  async findByModifier(modifierId: string): Promise<ModifierOption[]> {
    return this.prisma.modifierOption.findMany({
      where: { modifierId },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });
  }

  async setAsDefault(id: string, modifierId: string): Promise<ModifierOption> {
    // Remover default de todas as opções do modificador
    await this.prisma.modifierOption.updateMany({
      where: { modifierId },
      data: { isDefault: false },
    });

    // Definir a nova default
    return this.prisma.modifierOption.update({
      where: { id },
      data: { isDefault: true },
    });
  }

  // Override findById to include relations
  async findById(id: string): Promise<ModifierOption | null> {
    return this.prisma.modifierOption.findUnique({
      where: { id },
      include: {
        modifier: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }
}
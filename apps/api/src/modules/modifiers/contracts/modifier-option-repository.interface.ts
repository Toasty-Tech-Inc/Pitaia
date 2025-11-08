import { ModifierOption } from '@prisma/client';
import { IBaseRepository } from '../../../common/contracts/base-repository.interface';

export interface IModifierOptionRepository extends IBaseRepository<ModifierOption> {
  findByModifier(modifierId: string): Promise<ModifierOption[]>;
  setAsDefault(id: string, modifierId: string): Promise<ModifierOption>;
}
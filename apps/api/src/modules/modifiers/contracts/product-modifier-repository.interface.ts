import { ProductModifier } from '@prisma/client';
import { IBaseRepository } from '../../../common/contracts/base-repository.interface';

export interface IProductModifierRepository extends IBaseRepository<ProductModifier> {
  findByProduct(productId: string): Promise<ProductModifier[]>;
  findWithOptions(id: string): Promise<ProductModifier | null>;
  toggleRequired(id: string): Promise<ProductModifier>;
}
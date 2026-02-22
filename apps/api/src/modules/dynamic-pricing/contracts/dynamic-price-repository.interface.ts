import { DynamicPrice } from '@prisma/client';
import { IBaseRepository } from '../../../common/contracts/base-repository.interface';

export interface IDynamicPriceRepository extends IBaseRepository<DynamicPrice> {
  findByProduct(productId: string): Promise<DynamicPrice[]>;
  findActiveByProduct(productId: string): Promise<DynamicPrice[]>;
  findCurrentPrice(productId: string): Promise<DynamicPrice | null>;
  findByDayOfWeek(productId: string, dayOfWeek: number): Promise<DynamicPrice[]>;
  deactivateAll(productId: string): Promise<void>;
}

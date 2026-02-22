import { LoyaltyTransaction, LoyaltyTransactionType } from '@prisma/client';
import { IBaseRepository } from '../../../common/contracts/base-repository.interface';

export interface ILoyaltyRepository extends IBaseRepository<LoyaltyTransaction> {
  findByCustomer(customerId: string): Promise<LoyaltyTransaction[]>;
  findByCustomerAndDateRange(
    customerId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<LoyaltyTransaction[]>;
  findBySale(saleId: string): Promise<LoyaltyTransaction[]>;
  getCustomerBalance(customerId: string): Promise<number>;
  getExpiredPoints(customerId: string): Promise<LoyaltyTransaction[]>;
}

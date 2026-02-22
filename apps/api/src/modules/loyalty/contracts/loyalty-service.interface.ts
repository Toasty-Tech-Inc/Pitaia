import { LoyaltyTransaction, Customer } from '@prisma/client';
import { CreateLoyaltyTransactionDto } from '../dto/create-loyalty-transaction.dto';
import { FilterLoyaltyTransactionDto } from '../dto/filter-loyalty-transaction.dto';
import { RedeemPointsDto } from '../dto/redeem-points.dto';
import { IPaginatedResult } from '../../../common/contracts/base-repository.interface';

export interface ILoyaltyService {
  earnPoints(dto: CreateLoyaltyTransactionDto): Promise<LoyaltyTransaction>;
  redeemPoints(customerId: string, dto: RedeemPointsDto): Promise<LoyaltyTransaction>;
  findAll(filters: FilterLoyaltyTransactionDto): Promise<IPaginatedResult<LoyaltyTransaction>>;
  findByCustomer(customerId: string): Promise<LoyaltyTransaction[]>;
  getCustomerBalance(customerId: string): Promise<number>;
  adjustPoints(dto: CreateLoyaltyTransactionDto): Promise<LoyaltyTransaction>;
  processExpiredPoints(): Promise<number>;
  getCustomerLoyaltySummary(customerId: string): Promise<any>;
}

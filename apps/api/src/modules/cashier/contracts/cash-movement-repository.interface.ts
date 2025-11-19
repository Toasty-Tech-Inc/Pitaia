import { CashMovement } from '@prisma/client';
import { IBaseRepository } from '../../../common/contracts/base-repository.interface';

export interface ICashMovementRepository extends IBaseRepository<CashMovement> {
  findBySession(cashierSessionId: string): Promise<CashMovement[]>;
  findByDateRange(cashierSessionId: string, startDate: Date, endDate: Date): Promise<CashMovement[]>;
  getTotalByType(cashierSessionId: string, type: string): Promise<number>;
}
import { CashMovement, CashMovementType } from '@prisma/client';
import { IBaseRepository } from '../../../common/contracts/base-repository.interface';

export interface ICashMovementRepository extends IBaseRepository<CashMovement> {
  findBySession(cashierSessionId: string): Promise<CashMovement[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<CashMovement[]>;
  findByType(cashierSessionId: string, type: CashMovementType): Promise<CashMovement[]>;
  getTotalByType(cashierSessionId: string, type: CashMovementType): Promise<number>;
  getSessionSummary(cashierSessionId: string): Promise<any>;
}

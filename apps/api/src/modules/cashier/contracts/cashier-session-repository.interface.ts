import { CashierSession } from '@prisma/client';
import { IBaseRepository } from '../../../common/contracts/base-repository.interface';

export interface ICashierSessionRepository extends IBaseRepository<CashierSession> {
  findByEstablishment(establishmentId: string): Promise<CashierSession[]>;
  findByUser(userId: string): Promise<CashierSession[]>;
  findActiveByUser(userId: string): Promise<CashierSession | null>;
  findActiveByEstablishment(establishmentId: string): Promise<CashierSession[]>;
  findByDateRange(establishmentId: string, startDate: Date, endDate: Date): Promise<CashierSession[]>;
  findWithDetails(id: string): Promise<CashierSession | null>;
  closeSession(id: string, closingAmount: number, notes?: string): Promise<CashierSession>;
}
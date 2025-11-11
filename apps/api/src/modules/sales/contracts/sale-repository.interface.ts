import { Sale, PaymentStatus } from '@prisma/client';
import { IBaseRepository } from '../../../common/contracts/base-repository.interface';

export interface ISaleRepository extends IBaseRepository<Sale> {
  findByEstablishment(establishmentId: string): Promise<Sale[]>;
  findByCustomer(customerId: string): Promise<Sale[]>;
  findBySeller(sellerId: string): Promise<Sale[]>;
  findByCashierSession(cashierSessionId: string): Promise<Sale[]>;
  findByPaymentStatus(status: PaymentStatus): Promise<Sale[]>;
  findByDateRange(establishmentId: string, startDate: Date, endDate: Date): Promise<Sale[]>;
  findWithDetails(id: string): Promise<Sale | null>;
  updatePaymentStatus(id: string, status: PaymentStatus): Promise<Sale>;
  getTotalsByPeriod(establishmentId: string, startDate: Date, endDate: Date): Promise<{
    totalSales: number;
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    averageTicket: number;
  }>;
}
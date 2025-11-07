import { Payment, PaymentStatus } from '@prisma/client';
import { IBaseRepository } from '../../../common/contracts/base-repository.interface';

export interface IPaymentRepository extends IBaseRepository<Payment> {
  findBySale(saleId: string): Promise<Payment[]>;
  findByPaymentMethod(paymentMethodId: string): Promise<Payment[]>;
  findByStatus(status: PaymentStatus): Promise<Payment[]>;
  findByTransactionId(transactionId: string): Promise<Payment | null>;
  updateStatus(id: string, status: PaymentStatus): Promise<Payment>;
}
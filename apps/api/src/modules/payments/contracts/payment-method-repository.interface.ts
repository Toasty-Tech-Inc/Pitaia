import { PaymentMethod } from '@prisma/client';
import { IBaseRepository } from '../../../common/contracts/base-repository.interface';

export interface IPaymentMethodRepository extends IBaseRepository<PaymentMethod> {
  findByEstablishment(establishmentId: string): Promise<PaymentMethod[]>;
  findActiveByEstablishment(establishmentId: string): Promise<PaymentMethod[]>;
  toggleActive(id: string): Promise<PaymentMethod>;
}
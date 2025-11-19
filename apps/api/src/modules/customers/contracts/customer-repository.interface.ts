import { Customer } from '@prisma/client';
import { IBaseRepository } from '../../../common/contracts/base-repository.interface';

export interface ICustomerRepository extends IBaseRepository<Customer> {
  findByPhone(phone: string): Promise<Customer | null>;
  findByEmail(email: string): Promise<Customer | null>;
  findByCpf(cpf: string): Promise<Customer | null>;
  updateLoyaltyPoints(id: string, points: number): Promise<Customer>;
  toggleActive(id: string): Promise<Customer>;
}


import { CustomerAddress } from '@prisma/client';
import { IBaseRepository } from '../../../common/contracts/base-repository.interface';

export interface IAddressRepository extends IBaseRepository<CustomerAddress> {
  findByCustomer(customerId: string): Promise<CustomerAddress[]>;
  findDefaultByCustomer(customerId: string): Promise<CustomerAddress | null>;
  setAsDefault(id: string, customerId: string): Promise<CustomerAddress>;
}
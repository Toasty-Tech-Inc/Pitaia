import { Customer } from '@prisma/client';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { FilterCustomerDto } from '../dto/filter-customer.dto';
import { AddLoyaltyPointsDto } from '../dto/add-loyalty-points.dto';
import { IPaginatedResult } from '../../../common/contracts/base-repository.interface';

export interface ICustomerService {
  create(createCustomerDto: CreateCustomerDto): Promise<Customer>;
  findAll(filters: FilterCustomerDto): Promise<IPaginatedResult<Customer>>;
  findOne(id: string): Promise<Customer>;
  update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer>;
  remove(id: string): Promise<void>;
  findByPhone(phone: string): Promise<Customer>;
  findByCpf(cpf: string): Promise<Customer>;
  toggleActive(id: string): Promise<Customer>;
  addLoyaltyPoints(id: string, addLoyaltyPointsDto: AddLoyaltyPointsDto): Promise<Customer>;
  getLoyaltyHistory(customerId: string): Promise<any[]>;
}


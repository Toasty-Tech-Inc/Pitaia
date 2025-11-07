import { CustomerAddress } from '@prisma/client';
import { CreateAddressDto } from '../dto/create-address.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';
import { CalculateDeliveryDto } from '../dto/calculate-delivery.dto';

export interface IAddressService {
  create(customerId: string, dto: CreateAddressDto): Promise<CustomerAddress>;
  findByCustomer(customerId: string): Promise<CustomerAddress[]>;
  findOne(id: string): Promise<CustomerAddress>;
  update(id: string, dto: UpdateAddressDto): Promise<CustomerAddress>;
  remove(id: string): Promise<void>;
  setAsDefault(id: string, customerId: string): Promise<CustomerAddress>;
  calculateDeliveryFee(dto: CalculateDeliveryDto): Promise<{
    distance: number;
    fee: number;
    estimatedTime: number;
  }>;
  getCoordinates(zipCode: string): Promise<{ lat: number; lng: number }>;
}
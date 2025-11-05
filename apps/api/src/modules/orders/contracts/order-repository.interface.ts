import { Order, OrderStatus } from '@prisma/client';
import { IBaseRepository } from '../../../common/contracts/base-repository.interface';

export interface IOrderRepository extends IBaseRepository<Order> {
  findByEstablishment(establishmentId: string): Promise<Order[]>;
  findByCustomer(customerId: string): Promise<Order[]>;
  findByStatus(establishmentId: string, status: OrderStatus): Promise<Order[]>;
  findByTable(tableId: string): Promise<Order[]>;
  findByDateRange(establishmentId: string, startDate: Date, endDate: Date): Promise<Order[]>;
  updateStatus(id: string, status: OrderStatus, notes?: string): Promise<Order>;
  getNextOrderNumber(establishmentId: string, date: Date): Promise<number>;
  findWithItems(id: string): Promise<Order | null>;
  findByExternalId(externalId: string): Promise<Order | null>;
}
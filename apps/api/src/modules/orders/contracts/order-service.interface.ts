import { Order, OrderStatus } from '@prisma/client';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { FilterOrderDto } from '../dto/filter-order.dto';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { IPaginatedResult } from '../../../common/contracts/base-repository.interface';

export interface IOrderService {
  create(createOrderDto: CreateOrderDto): Promise<Order>;
  findAll(filters: FilterOrderDto): Promise<IPaginatedResult<Order>>;
  findOne(id: string): Promise<Order>;
  update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order>;
  updateStatus(id: string, updateStatusDto: UpdateOrderStatusDto): Promise<Order>;
  cancel(id: string, reason: string): Promise<Order>;
  remove(id: string): Promise<void>;
  getOrdersByStatus(establishmentId: string, status: OrderStatus): Promise<Order[]>;
}
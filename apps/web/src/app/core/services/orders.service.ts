import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Order, OrderStatus } from '../models/order.model';
import { PaginatedResponse, PaginationParams } from '../models/api-response.model';

export interface CreateOrderDto {
  establishmentId: string;
  customerId?: string;
  type: string;
  source: string;
  deliveryAddress?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    reference?: string;
  };
  notes?: string;
  couponCode?: string;
  items: {
    productId: string;
    quantity: number;
    notes?: string;
    modifiers?: {
      modifierId: string;
      optionId: string;
    }[];
  }[];
  payments: {
    paymentMethodId: string;
    amount: number;
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private api = inject(ApiService);

  getAll(params?: PaginationParams & { 
    establishmentId?: string; 
    status?: OrderStatus;
    customerId?: string;
  }): Observable<PaginatedResponse<Order>> {
    return this.api.getPaginated<Order>('/orders', params);
  }

  getById(id: string): Observable<Order> {
    return this.api.getData<Order>(`/orders/${id}`);
  }

  getMyOrders(): Observable<Order[]> {
    return this.api.getData<Order[]>('/orders/my-orders');
  }

  create(order: CreateOrderDto): Observable<Order> {
    return this.api.postData<Order>('/orders', order);
  }

  trackOrder(id: string): Observable<Order> {
    return this.api.getData<Order>(`/orders/${id}`);
  }
}

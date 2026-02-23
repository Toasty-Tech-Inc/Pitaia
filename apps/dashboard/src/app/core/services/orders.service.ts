import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Order, OrderStatus } from '../models/order.model';
import { PaginatedResponse, PaginationParams } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private api = inject(ApiService);

  getAll(params?: PaginationParams & { establishmentId?: string; status?: OrderStatus }): Observable<PaginatedResponse<Order>> {
    return this.api.getPaginated<Order>('/orders', params);
  }

  getById(id: string): Observable<Order> {
    return this.api.getData<Order>(`/orders/${id}`);
  }

  create(order: Partial<Order>): Observable<Order> {
    return this.api.postData<Order>('/orders', order);
  }

  update(id: string, order: Partial<Order>): Observable<Order> {
    return this.api.patchData<Order>(`/orders/${id}`, order);
  }

  updateStatus(id: string, status: OrderStatus, notes?: string): Observable<Order> {
    return this.api.patchData<Order>(`/orders/${id}/status`, { status, notes });
  }

  cancel(id: string, reason?: string): Observable<Order> {
    return this.api.postData<Order>(`/orders/${id}/cancel`, { reason });
  }

  delete(id: string): Observable<void> {
    return this.api.deleteData<void>(`/orders/${id}`);
  }
}


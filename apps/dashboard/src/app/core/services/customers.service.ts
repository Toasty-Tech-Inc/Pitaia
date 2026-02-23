import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Customer, CustomerAddress } from '../models/customer.model';
import { PaginatedResponse, PaginationParams } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class CustomersService {
  private api = inject(ApiService);

  getAll(params?: PaginationParams & {
    search?: string;
    email?: string;
    phone?: string;
    cpf?: string;
    isActive?: boolean;
  }): Observable<PaginatedResponse<Customer>> {
    return this.api.getPaginated<Customer>('/customers', params);
  }

  getById(id: string): Observable<Customer> {
    return this.api.getData<Customer>(`/customers/${id}`);
  }

  getByPhone(phone: string): Observable<Customer> {
    return this.api.getData<Customer>(`/customers/phone/${phone}`);
  }

  getByCpf(cpf: string): Observable<Customer> {
    return this.api.getData<Customer>(`/customers/cpf/${cpf}`);
  }

  create(customer: Partial<Customer>): Observable<Customer> {
    return this.api.postData<Customer>('/customers', customer);
  }

  update(id: string, customer: Partial<Customer>): Observable<Customer> {
    return this.api.patchData<Customer>(`/customers/${id}`, customer);
  }

  delete(id: string): Observable<void> {
    return this.api.deleteData<void>(`/customers/${id}`);
  }

  toggleActive(id: string): Observable<Customer> {
    return this.api.patchData<Customer>(`/customers/${id}/toggle-active`, {});
  }

  addLoyaltyPoints(id: string, points: number, description?: string): Observable<Customer> {
    return this.api.postData<Customer>(`/customers/${id}/loyalty-points`, { points, description });
  }

  getLoyaltyHistory(id: string): Observable<any[]> {
    return this.api.getData<any[]>(`/customers/${id}/loyalty-history`);
  }

  // Addresses
  addAddress(customerId: string, address: Partial<CustomerAddress>): Observable<CustomerAddress> {
    return this.api.postData<CustomerAddress>(`/customers/${customerId}/addresses`, address);
  }

  getAddresses(customerId: string): Observable<CustomerAddress[]> {
    return this.api.getData<CustomerAddress[]>(`/customers/${customerId}/addresses`);
  }

  updateAddress(customerId: string, addressId: string, address: Partial<CustomerAddress>): Observable<CustomerAddress> {
    return this.api.patchData<CustomerAddress>(`/customers/${customerId}/addresses/${addressId}`, address);
  }

  deleteAddress(customerId: string, addressId: string): Observable<void> {
    return this.api.deleteData<void>(`/customers/${customerId}/addresses/${addressId}`);
  }
}


import { inject, Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { Customer, CustomerAddress } from '../models/order.model';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterCustomerDto {
  name: string;
  email?: string;
  phone: string;
  password?: string;
  cpf?: string;
  birthDate?: string;
}

export interface AuthResponse {
  access_token: string;
  customer: Customer;
}

const STORAGE_KEY = 'pitaia_customer_auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);

  private customerSignal = signal<Customer | null>(null);
  private tokenSignal = signal<string | null>(null);

  readonly customer = this.customerSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.tokenSignal());
  readonly customerName = computed(() => this.customerSignal()?.name ?? '');

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored) as { token: string; customer: Customer };
        this.tokenSignal.set(data.token);
        this.customerSignal.set(data.customer);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  private saveToStorage(token: string, customer: Customer): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, customer }));
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  login(credentials: LoginDto): Observable<AuthResponse> {
    return this.api.postData<AuthResponse>('/customers/auth/login', credentials).pipe(
      tap((response) => {
        this.tokenSignal.set(response.access_token);
        this.customerSignal.set(response.customer);
        this.saveToStorage(response.access_token, response.customer);
      })
    );
  }

  register(data: RegisterCustomerDto): Observable<Customer> {
    return this.api.postData<Customer>('/customers', data).pipe(
      tap((customer) => {
        this.customerSignal.set(customer);
      })
    );
  }

  logout(): void {
    this.tokenSignal.set(null);
    this.customerSignal.set(null);
    localStorage.removeItem(STORAGE_KEY);
    this.router.navigate(['/']);
  }

  getProfile(): Observable<Customer> {
    return this.api.getData<Customer>('/customers/profile');
  }

  updateProfile(data: Partial<Customer>): Observable<Customer> {
    const customerId = this.customerSignal()?.id;
    return this.api.patchData<Customer>(`/customers/${customerId}`, data).pipe(
      tap((customer) => {
        this.customerSignal.set(customer);
        const token = this.tokenSignal();
        if (token) {
          this.saveToStorage(token, customer);
        }
      })
    );
  }

  addAddress(address: Omit<CustomerAddress, 'id' | 'customerId' | 'createdAt' | 'updatedAt'>): Observable<CustomerAddress> {
    const customerId = this.customerSignal()?.id;
    return this.api.postData<CustomerAddress>(`/customers/${customerId}/addresses`, address);
  }

  updateAddress(addressId: string, address: Partial<CustomerAddress>): Observable<CustomerAddress> {
    const customerId = this.customerSignal()?.id;
    return this.api.patchData<CustomerAddress>(`/customers/${customerId}/addresses/${addressId}`, address);
  }

  deleteAddress(addressId: string): Observable<void> {
    const customerId = this.customerSignal()?.id;
    return this.api.deleteData(`/customers/${customerId}/addresses/${addressId}`);
  }

  getAddresses(): Observable<CustomerAddress[]> {
    const customerId = this.customerSignal()?.id;
    return this.api.getData<CustomerAddress[]>(`/customers/${customerId}/addresses`);
  }
}

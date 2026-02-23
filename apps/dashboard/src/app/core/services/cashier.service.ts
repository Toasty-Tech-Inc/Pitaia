import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Cashier, CashMovement, MovementType } from '../models/cashier.model';
import { PaginatedResponse, PaginationParams } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class CashierService {
  private api = inject(ApiService);

  getAll(params?: PaginationParams & {
    establishmentId?: string;
    userId?: string;
    status?: string;
  }): Observable<PaginatedResponse<Cashier>> {
    return this.api.getPaginated<Cashier>('/cashier', params);
  }

  getCurrent(establishmentId: string): Observable<Cashier> {
    return this.api.getData<Cashier>(`/cashier/current/${establishmentId}`);
  }

  getById(id: string): Observable<Cashier> {
    return this.api.getData<Cashier>(`/cashier/${id}`);
  }

  open(data: { establishmentId: string; openingBalance: number; notes?: string }): Observable<Cashier> {
    return this.api.postData<Cashier>('/cashier/open', data);
  }

  close(id: string, data: { closingBalance: number; notes?: string }): Observable<Cashier> {
    return this.api.postData<Cashier>(`/cashier/${id}/close`, data);
  }

  addMovement(cashierId: string, movement: {
    type: MovementType;
    amount: number;
    description?: string;
    paymentMethod?: string;
  }): Observable<CashMovement> {
    return this.api.postData<CashMovement>(`/cashier/${cashierId}/movements`, movement);
  }

  getMovements(cashierId: string): Observable<CashMovement[]> {
    return this.api.getData<CashMovement[]>(`/cashier/${cashierId}/movements`);
  }

  getReport(cashierId: string): Observable<{
    cashier: Cashier;
    summary: {
      totalSales: number;
      totalRefunds: number;
      totalWithdrawals: number;
      totalDeposits: number;
      netAmount: number;
    };
    movementsByType: Record<string, number>;
    movementsByPaymentMethod: Record<string, number>;
  }> {
    return this.api.getData(`/cashier/${cashierId}/report`);
  }
}

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
    isOpen?: boolean;
    startDate?: string;
    endDate?: string;
  }): Observable<PaginatedResponse<Cashier>> {
    return this.api.getPaginated<Cashier>('/cashier-sessions', params);
  }

  getActiveSession(): Observable<Cashier> {
    return this.api.getData<Cashier>('/cashier-sessions/active');
  }

  getById(id: string): Observable<Cashier> {
    return this.api.getData<Cashier>(`/cashier-sessions/${id}`);
  }

  open(data: { establishmentId: string; userId: string; openingAmount: number; notes?: string }): Observable<Cashier> {
    return this.api.postData<Cashier>('/cashier-sessions/open', data);
  }

  close(id: string, data: { closingAmount: number; notes?: string }): Observable<Cashier> {
    return this.api.postData<Cashier>(`/cashier-sessions/${id}/close`, data);
  }

  addMovement(cashierSessionId: string, movement: {
    type: MovementType;
    amount: number;
    description?: string;
    paymentMethod?: string;
  }): Observable<CashMovement> {
    return this.api.postData<CashMovement>('/cashier-sessions/movements', {
      cashierSessionId,
      ...movement,
    });
  }

  getMovements(cashierSessionId: string): Observable<CashMovement[]> {
    return this.api.getData<CashMovement[]>(`/cashier-sessions/${cashierSessionId}/movements`);
  }

  getReport(cashierSessionId: string): Observable<{
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
    return this.api.getData(`/cashier-sessions/${cashierSessionId}/report`);
  }
}

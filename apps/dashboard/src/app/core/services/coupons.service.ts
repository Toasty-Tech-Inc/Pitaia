import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Coupon } from '../models/coupon.model';
import { PaginatedResponse, PaginationParams } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class CouponsService {
  private api = inject(ApiService);

  getAll(params?: PaginationParams & {
    establishmentId?: string;
    code?: string;
    isActive?: boolean;
  }): Observable<PaginatedResponse<Coupon>> {
    return this.api.getPaginated<Coupon>('/coupons', params);
  }

  getById(id: string): Observable<Coupon> {
    return this.api.getData<Coupon>(`/coupons/${id}`);
  }

  getByCode(code: string): Observable<Coupon> {
    return this.api.getData<Coupon>(`/coupons/code/${code}`);
  }

  create(coupon: Partial<Coupon>): Observable<Coupon> {
    return this.api.postData<Coupon>('/coupons', coupon);
  }

  update(id: string, coupon: Partial<Coupon>): Observable<Coupon> {
    return this.api.patchData<Coupon>(`/coupons/${id}`, coupon);
  }

  delete(id: string): Observable<void> {
    return this.api.deleteData<void>(`/coupons/${id}`);
  }

  toggleActive(id: string): Observable<Coupon> {
    return this.api.patchData<Coupon>(`/coupons/${id}/toggle-active`, {});
  }

  validateCoupon(code: string, orderTotal: number): Observable<{ valid: boolean; coupon?: Coupon; discount?: number }> {
    return this.api.postData<{ valid: boolean; coupon?: Coupon; discount?: number }>('/coupons/validate', { code, orderTotal });
  }
}

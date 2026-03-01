import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Coupon } from '../models/order.model';

export interface ValidateCouponResponse {
  valid: boolean;
  coupon?: Coupon;
  discount?: number;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CouponsService {
  private api = inject(ApiService);

  getPublicCoupons(): Observable<Coupon[]> {
    return this.api.getData<Coupon[]>('/coupons/public');
  }

  getByCode(code: string): Observable<Coupon> {
    return this.api.getData<Coupon>(`/coupons/code/${code}`);
  }

  validateCoupon(code: string, orderTotal: number, establishmentId: string): Observable<ValidateCouponResponse> {
    return this.api.postData<ValidateCouponResponse>('/coupons/validate', {
      code,
      orderTotal,
      establishmentId,
    });
  }
}

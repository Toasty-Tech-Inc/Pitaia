import { Coupon } from '@prisma/client';
import { IBaseRepository } from '../../../common/contracts/base-repository.interface';

export interface ICouponRepository extends IBaseRepository<Coupon> {
  findByCode(code: string): Promise<Coupon | null>;
  findActiveCoupons(): Promise<Coupon[]>;
  findPublicCoupons(): Promise<Coupon[]>;
  findValidCoupons(): Promise<Coupon[]>;
  incrementUsageCount(id: string): Promise<Coupon>;
}


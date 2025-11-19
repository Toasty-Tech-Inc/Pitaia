import { Coupon } from '@prisma/client';
import { CreateCouponDto } from '../dto/create-coupon.dto';
import { UpdateCouponDto } from '../dto/update-coupon.dto';
import { FilterCouponDto } from '../dto/filter-coupon.dto';
import { ValidateCouponDto } from '../dto/validate-coupon.dto';
import { IPaginatedResult } from '../../../common/contracts/base-repository.interface';

export interface ICouponService {
  create(createCouponDto: CreateCouponDto): Promise<Coupon>;
  findAll(filters: FilterCouponDto): Promise<IPaginatedResult<Coupon>>;
  findOne(id: string): Promise<Coupon>;
  update(id: string, updateCouponDto: UpdateCouponDto): Promise<Coupon>;
  remove(id: string): Promise<void>;
  validateCoupon(validateCouponDto: ValidateCouponDto): Promise<Coupon>;
  findByCode(code: string): Promise<Coupon>;
  toggleActive(id: string): Promise<Coupon>;
  findPublicCoupons(): Promise<Coupon[]>;
}


import { Injectable } from '@nestjs/common';
import { Coupon, Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { ICouponRepository } from '../contracts/coupon-repository.interface';

@Injectable()
export class CouponRepository
  extends BaseRepository<Coupon>
  implements ICouponRepository
{
  constructor(prisma: PrismaService) {
    super(prisma, 'coupon');
  }

  async findByCode(code: string): Promise<Coupon | null> {
    return this.prisma.coupon.findUnique({
      where: { code },
    });
  }

  async findActiveCoupons(): Promise<Coupon[]> {
    return this.prisma.coupon.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPublicCoupons(): Promise<Coupon[]> {
    const now = new Date();
    return this.prisma.coupon.findMany({
      where: {
        isActive: true,
        isPublic: true,
        validFrom: { lte: now },
        OR: [
          { validUntil: null },
          { validUntil: { gte: now } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findValidCoupons(): Promise<Coupon[]> {
    const now = new Date();
    const coupons = await this.prisma.coupon.findMany({
      where: {
        isActive: true,
        validFrom: { lte: now },
        OR: [
          { validUntil: null },
          { validUntil: { gte: now } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filtrar por limite de uso (não pode ser feito diretamente no Prisma)
    return coupons.filter(
      (coupon) =>
        !coupon.usageLimit || coupon.usageCount < coupon.usageLimit,
    );
  }

  async incrementUsageCount(id: string): Promise<Coupon> {
    return this.prisma.coupon.update({
      where: { id },
      data: {
        usageCount: {
          increment: 1,
        },
      },
    });
  }

  // Override findById to include relations
  async findById(id: string): Promise<Coupon | null> {
    return this.prisma.coupon.findUnique({
      where: { id },
      include: {
        orders: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            orderNumber: true,
            total: true,
            createdAt: true,
          },
        },
      },
    });
  }

  // Override findAll to include relations
  async findAll(params?: any): Promise<Coupon[]> {
    return this.prisma.coupon.findMany({
      ...params,
      orderBy: { createdAt: 'desc' },
    });
  }
}


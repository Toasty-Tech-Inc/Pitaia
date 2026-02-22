import { Injectable } from '@nestjs/common';
import { LoyaltyTransaction, LoyaltyTransactionType } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { ILoyaltyRepository } from '../contracts/loyalty-repository.interface';

@Injectable()
export class LoyaltyRepository
  extends BaseRepository<LoyaltyTransaction>
  implements ILoyaltyRepository
{
  constructor(prisma: PrismaService) {
    super(prisma, 'loyaltyTransaction');
  }

  async findByCustomer(customerId: string): Promise<LoyaltyTransaction[]> {
    return this.prisma.loyaltyTransaction.findMany({
      where: { customerId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            loyaltyPoints: true,
          },
        },
        sale: {
          select: {
            id: true,
            total: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByCustomerAndDateRange(
    customerId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<LoyaltyTransaction[]> {
    return this.prisma.loyaltyTransaction.findMany({
      where: {
        customerId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        sale: {
          select: {
            id: true,
            total: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBySale(saleId: string): Promise<LoyaltyTransaction[]> {
    return this.prisma.loyaltyTransaction.findMany({
      where: { saleId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });
  }

  async getCustomerBalance(customerId: string): Promise<number> {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      select: { loyaltyPoints: true },
    });
    return customer?.loyaltyPoints || 0;
  }

  async getExpiredPoints(customerId: string): Promise<LoyaltyTransaction[]> {
    const now = new Date();
    return this.prisma.loyaltyTransaction.findMany({
      where: {
        customerId,
        type: LoyaltyTransactionType.EARNED,
        expiresAt: {
          lt: now,
        },
      },
      orderBy: { expiresAt: 'asc' },
    });
  }

  async findById(id: string): Promise<LoyaltyTransaction | null> {
    return this.prisma.loyaltyTransaction.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            loyaltyPoints: true,
          },
        },
        sale: {
          select: {
            id: true,
            total: true,
            createdAt: true,
          },
        },
      },
    });
  }
}

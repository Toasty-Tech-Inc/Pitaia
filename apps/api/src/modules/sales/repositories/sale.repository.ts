import { Injectable } from '@nestjs/common';
import { Sale, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { ISaleRepository } from '../contracts/sale-repository.interface';

@Injectable()
export class SaleRepository
  extends BaseRepository<Sale>
  implements ISaleRepository
{
  constructor(prisma: PrismaService) {
    super(prisma, 'sale');
  }

  async findByEstablishment(establishmentId: string): Promise<Sale[]> {
    return this.prisma.sale.findMany({
      where: { establishmentId },
      include: {
        customer: true,
        order: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
        payments: {
          include: {
            paymentMethod: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByCustomer(customerId: string): Promise<Sale[]> {
    return this.prisma.sale.findMany({
      where: { customerId },
      include: {
        establishment: true,
        order: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
        payments: {
          include: {
            paymentMethod: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBySeller(sellerId: string): Promise<Sale[]> {
    return this.prisma.sale.findMany({
      where: { sellerId },
      include: {
        customer: true,
        order: true,
        payments: {
          include: {
            paymentMethod: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByCashierSession(cashierSessionId: string): Promise<Sale[]> {
    return this.prisma.sale.findMany({
      where: { cashierSessionId },
      include: {
        customer: true,
        order: true,
        payments: {
          include: {
            paymentMethod: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByPaymentStatus(status: PaymentStatus): Promise<Sale[]> {
    return this.prisma.sale.findMany({
      where: { paymentStatus: status },
      include: {
        customer: true,
        order: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByDateRange(
    establishmentId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Sale[]> {
    return this.prisma.sale.findMany({
      where: {
        establishmentId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        customer: true,
        order: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
        payments: {
          include: {
            paymentMethod: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findWithDetails(id: string): Promise<Sale | null> {
    return this.prisma.sale.findUnique({
      where: { id },
      include: {
        establishment: true,
        customer: true,
        order: {
          include: {
            table: true,
            waiter: true,
            items: {
              include: {
                product: {
                  include: {
                    category: true,
                  },
                },
              },
            },
          },
        },
        payments: {
          include: {
            paymentMethod: true,
          },
        },
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
        cashierSession: true,
        loyaltyTransactions: true,
      },
    });
  }

  async updatePaymentStatus(
    id: string,
    status: PaymentStatus,
  ): Promise<Sale> {
    return this.prisma.sale.update({
      where: { id },
      data: { paymentStatus: status },
    });
  }

  async getTotalsByPeriod(
    establishmentId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalSales: number;
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    averageTicket: number;
  }> {
    const sales = await this.findByDateRange(
      establishmentId,
      startDate,
      endDate,
    );

    const totalSales = sales.length;
    const totalRevenue = sales.reduce(
      (sum, sale) => sum + Number(sale.total),
      0,
    );

    // Calcular custo total
    const totalCost = sales.reduce((sum, sale) => {
      //@ts-expect-error prisma me zuando aqui 👍
      const saleCost = sale.items.reduce((itemSum, item) => {
        const unitCost = item.unitCost ? Number(item.unitCost) : 0;
        const quantity = Number(item.quantity);
        return itemSum + unitCost * quantity;
      }, 0);
      return sum + saleCost;
    }, 0);

    const totalProfit = totalRevenue - totalCost;
    const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

    return {
      totalSales,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      totalProfit: Math.round(totalProfit * 100) / 100,
      averageTicket: Math.round(averageTicket * 100) / 100,
    };
  }

  // Override findById to include relations
  async findById(id: string): Promise<Sale | null> {
    return this.findWithDetails(id);
  }
}
import { Injectable } from '@nestjs/common';
import { Order, OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { IOrderRepository } from '../contracts/order-repository.interface';

@Injectable()
export class OrderRepository
  extends BaseRepository<Order>
  implements IOrderRepository
{
  constructor(prisma: PrismaService) {
    super(prisma, 'order');
  }

  async findByEstablishment(establishmentId: string): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: { establishmentId },
      include: {
        customer: true,
        waiter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        table: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByCustomer(customerId: string): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: { customerId },
      include: {
        establishment: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByStatus(
    establishmentId: string,
    status: OrderStatus,
  ): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: {
        establishmentId,
        status,
      },
      include: {
        customer: true,
        waiter: {
          select: {
            id: true,
            name: true,
          },
        },
        table: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findByTable(tableId: string): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: {
        tableId,
        status: {
          notIn: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
        },
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByDateRange(
    establishmentId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: {
        establishmentId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(
    id: string,
    status: OrderStatus,
    notes?: string,
  ): Promise<Order> {
    // Atualizar ordem
    const order = await this.prisma.order.update({
      where: { id },
      data: { status },
    });

    // Criar histórico de status
    await this.prisma.orderStatusHistory.create({
      data: {
        orderId: id,
        status,
        notes,
      },
    });

    return order;
  }

  async getNextOrderNumber(
    establishmentId: string,
    date: Date,
  ): Promise<number> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const lastOrder = await this.prisma.order.findFirst({
      where: {
        establishmentId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: {
        orderNumber: 'desc',
      },
    });

    return lastOrder ? lastOrder.orderNumber + 1 : 1;
  }

  async findWithItems(id: string): Promise<Order | null> {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        establishment: true,
        customer: true,
        waiter: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        table: true,
        coupon: true,
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
        statusHistory: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        sale: true,
      },
    });
  }

  async findByExternalId(externalId: string): Promise<Order | null> {
    return this.prisma.order.findFirst({
      where: { externalId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  // Override findById to include relations
  async findById(id: string): Promise<Order | null> {
    return this.findWithItems(id);
  }

  // Override findAll to include relations
  async findAll(params?: any): Promise<Order[]> {
    return this.prisma.order.findMany({
      ...params,
      include: {
        establishment: {
          select: {
            id: true,
            name: true,
            tradeName: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        waiter: {
          select: {
            id: true,
            name: true,
          },
        },
        table: {
          select: {
            id: true,
            number: true,
            location: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
      },
    });
  }
}
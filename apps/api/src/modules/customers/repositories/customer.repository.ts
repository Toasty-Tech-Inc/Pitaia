import { Injectable } from '@nestjs/common';
import { Customer, Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { ICustomerRepository } from '../contracts/customer-repository.interface';

@Injectable()
export class CustomerRepository
  extends BaseRepository<Customer>
  implements ICustomerRepository
{
  constructor(prisma: PrismaService) {
    super(prisma, 'customer');
  }

  async findByPhone(phone: string): Promise<Customer | null> {
    return this.prisma.customer.findUnique({
      where: { phone },
      include: {
        addresses: true,
      },
    });
  }

  async findByEmail(email: string): Promise<Customer | null> {
    return this.prisma.customer.findFirst({
      where: { email },
      include: {
        addresses: true,
      },
    });
  }

  async findByCpf(cpf: string): Promise<Customer | null> {
    return this.prisma.customer.findUnique({
      where: { cpf },
      include: {
        addresses: true,
      },
    });
  }

  async updateLoyaltyPoints(id: string, points: number): Promise<Customer> {
    return this.prisma.customer.update({
      where: { id },
      data: {
        loyaltyPoints: {
          increment: points,
        },
      },
    });
  }

  async toggleActive(id: string): Promise<Customer> {
    const customer = await this.findById(id);
    return this.prisma.customer.update({
      where: { id },
      data: { isActive: !customer?.isActive },
    });
  }

  // Override findById to include relations
  async findById(id: string): Promise<Customer | null> {
    return this.prisma.customer.findUnique({
      where: { id },
      include: {
        addresses: {
          orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
        },
        orders: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            orderNumber: true,
            total: true,
            status: true,
            createdAt: true,
          },
        },
        sales: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            total: true,
            paymentStatus: true,
            createdAt: true,
          },
        },
        loyaltyTransactions: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            sale: {
              select: {
                id: true,
                total: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });
  }

  // Override findAll to include relations
  async findAll(params?: any): Promise<Customer[]> {
    return this.prisma.customer.findMany({
      ...params,
      include: {
        addresses: {
          where: { isDefault: true },
          take: 1,
        },
      },
    });
  }
}


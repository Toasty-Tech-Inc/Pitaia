import { Injectable } from '@nestjs/common';
import { Payment, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { IPaymentRepository } from '../contracts/payment-repository.interface';

@Injectable()
export class PaymentRepository
  extends BaseRepository<Payment>
  implements IPaymentRepository
{
  constructor(prisma: PrismaService) {
    super(prisma, 'payment');
  }

  async findBySale(saleId: string): Promise<Payment[]> {
    return this.prisma.payment.findMany({
      where: { saleId },
      include: {
        paymentMethod: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findByPaymentMethod(paymentMethodId: string): Promise<Payment[]> {
    return this.prisma.payment.findMany({
      where: { paymentMethodId },
      include: {
        sale: {
          include: {
            order: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByStatus(status: PaymentStatus): Promise<Payment[]> {
    return this.prisma.payment.findMany({
      where: { status },
      include: {
        paymentMethod: true,
        sale: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByTransactionId(transactionId: string): Promise<Payment | null> {
    return this.prisma.payment.findFirst({
      where: { transactionId },
      include: {
        paymentMethod: true,
        sale: true,
      },
    });
  }

  async updateStatus(id: string, status: PaymentStatus): Promise<Payment> {
    return this.prisma.payment.update({
      where: { id },
      data: { status },
    });
  }

  // Override findById to include relations
  async findById(id: string): Promise<Payment | null> {
    return this.prisma.payment.findUnique({
      where: { id },
      include: {
        paymentMethod: true,
        sale: {
          include: {
            order: {
              include: {
                customer: true,
                establishment: true,
              },
            },
          },
        },
      },
    });
  }
}
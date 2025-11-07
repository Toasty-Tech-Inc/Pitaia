import { Injectable } from '@nestjs/common';
import { PaymentMethod } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { IPaymentMethodRepository } from '../contracts/payment-method-repository.interface';

@Injectable()
export class PaymentMethodRepository
  extends BaseRepository<PaymentMethod>
  implements IPaymentMethodRepository
{
  constructor(prisma: PrismaService) {
    super(prisma, 'paymentMethod');
  }

  async findByEstablishment(establishmentId: string): Promise<PaymentMethod[]> {
    return this.prisma.paymentMethod.findMany({
      where: { establishmentId },
      orderBy: { name: 'asc' },
    });
  }

  async findActiveByEstablishment(establishmentId: string): Promise<PaymentMethod[]> {
    return this.prisma.paymentMethod.findMany({
      where: {
        establishmentId,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async toggleActive(id: string): Promise<PaymentMethod> {
    const paymentMethod = await this.findById(id);
    return this.prisma.paymentMethod.update({
      where: { id },
      data: { isActive: !paymentMethod?.isActive },
    });
  }
}
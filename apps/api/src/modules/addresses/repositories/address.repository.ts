import { Injectable } from '@nestjs/common';
import { CustomerAddress } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { IAddressRepository } from '../contracts/address-repository.interface';

@Injectable()
export class AddressRepository
  extends BaseRepository<CustomerAddress>
  implements IAddressRepository
{
  constructor(prisma: PrismaService) {
    super(prisma, 'customerAddress');
  }

  async findByCustomer(customerId: string): Promise<CustomerAddress[]> {
    return this.prisma.customerAddress.findMany({
      where: { customerId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findDefaultByCustomer(customerId: string): Promise<CustomerAddress | null> {
    return this.prisma.customerAddress.findFirst({
      where: {
        customerId,
        isDefault: true,
      },
    });
  }

  async setAsDefault(
    id: string,
    customerId: string,
  ): Promise<CustomerAddress> {
    // Remover default de todos os endereços do cliente
    await this.prisma.customerAddress.updateMany({
      where: { customerId },
      data: { isDefault: false },
    });

    // Definir o novo default
    return this.prisma.customerAddress.update({
      where: { id },
      data: { isDefault: true },
    });
  }
}
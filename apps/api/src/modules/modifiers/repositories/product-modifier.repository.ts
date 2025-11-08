import { Injectable } from '@nestjs/common';
import { ProductModifier } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { IProductModifierRepository } from '../contracts/product-modifier-repository.interface';

@Injectable()
export class ProductModifierRepository
  extends BaseRepository<ProductModifier>
  implements IProductModifierRepository
{
  constructor(prisma: PrismaService) {
    super(prisma, 'productModifier');
  }

  async findByProduct(productId: string): Promise<ProductModifier[]> {
    return this.prisma.productModifier.findMany({
      where: { productId },
      include: {
        options: {
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findWithOptions(id: string): Promise<ProductModifier | null> {
    return this.prisma.productModifier.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
        options: {
          orderBy: { name: 'asc' },
        },
      },
    });
  }

  async toggleRequired(id: string): Promise<ProductModifier> {
    const modifier = await this.findById(id);
    return this.prisma.productModifier.update({
      where: { id },
      data: { isRequired: !modifier?.isRequired },
    });
  }

  // Override findById to include relations
  async findById(id: string): Promise<ProductModifier | null> {
    return this.findWithOptions(id);
  }
}
import { Injectable } from '@nestjs/common';
import { DynamicPrice } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { IDynamicPriceRepository } from '../contracts/dynamic-price-repository.interface';

@Injectable()
export class DynamicPriceRepository
  extends BaseRepository<DynamicPrice>
  implements IDynamicPriceRepository
{
  constructor(prisma: PrismaService) {
    super(prisma, 'dynamicPrice');
  }

  async findByProduct(productId: string): Promise<DynamicPrice[]> {
    return this.prisma.dynamicPrice.findMany({
      where: { productId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            sku: true,
          },
        },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  async findActiveByProduct(productId: string): Promise<DynamicPrice[]> {
    return this.prisma.dynamicPrice.findMany({
      where: {
        productId,
        isActive: true,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  async findCurrentPrice(productId: string): Promise<DynamicPrice | null> {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.toTimeString().substring(0, 5); // HH:MM

    return this.prisma.dynamicPrice.findFirst({
      where: {
        productId,
        isActive: true,
        OR: [
          // Preço para dia específico e horário
          {
            dayOfWeek: currentDay,
            startTime: { lte: currentTime },
            endTime: { gte: currentTime },
          },
          // Preço para dia específico sem horário
          {
            dayOfWeek: currentDay,
            startTime: null,
            endTime: null,
          },
          // Preço geral (sem dia específico) com horário
          {
            dayOfWeek: null,
            startTime: { lte: currentTime },
            endTime: { gte: currentTime },
          },
          // Preço geral sem dia e horário
          {
            dayOfWeek: null,
            startTime: null,
            endTime: null,
          },
        ],
      },
      orderBy: [
        { dayOfWeek: 'desc' }, // Priorizar regras com dia específico
        { startTime: 'desc' }, // Priorizar regras com horário
      ],
    });
  }

  async findByDayOfWeek(productId: string, dayOfWeek: number): Promise<DynamicPrice[]> {
    return this.prisma.dynamicPrice.findMany({
      where: {
        productId,
        dayOfWeek,
        isActive: true,
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async deactivateAll(productId: string): Promise<void> {
    await this.prisma.dynamicPrice.updateMany({
      where: { productId },
      data: { isActive: false },
    });
  }

  async findById(id: string): Promise<DynamicPrice | null> {
    return this.prisma.dynamicPrice.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            sku: true,
            establishmentId: true,
          },
        },
      },
    });
  }
}

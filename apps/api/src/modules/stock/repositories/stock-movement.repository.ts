import { Injectable } from '@nestjs/common';
import { StockMovement, StockMovementType } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { IStockMovementRepository } from '../contracts/stock-repository.interface';

@Injectable()
export class StockMovementRepository
  extends BaseRepository<StockMovement>
  implements IStockMovementRepository
{
  constructor(prisma: PrismaService) {
    super(prisma, 'stockMovement');
  }

  async findByProduct(productId: string): Promise<StockMovement[]> {
    return this.prisma.stockMovement.findMany({
      where: { productId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            unit: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByProductAndDateRange(
    productId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<StockMovement[]> {
    return this.prisma.stockMovement.findMany({
      where: {
        productId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByType(productId: string, type: StockMovementType): Promise<StockMovement[]> {
    return this.prisma.stockMovement.findMany({
      where: {
        productId,
        type,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMovementsByEstablishment(establishmentId: string): Promise<StockMovement[]> {
    return this.prisma.stockMovement.findMany({
      where: {
        product: {
          establishmentId,
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            unit: true,
            establishmentId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<StockMovement | null> {
    return this.prisma.stockMovement.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            unit: true,
            currentStock: true,
          },
        },
      },
    });
  }
}

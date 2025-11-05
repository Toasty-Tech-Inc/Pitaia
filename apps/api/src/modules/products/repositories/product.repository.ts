import { Injectable } from '@nestjs/common';
import { Product, Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { IProductRepository } from '../contracts/product-repository.interface';

@Injectable()
export class ProductRepository
  extends BaseRepository<Product>
  implements IProductRepository
{
  constructor(prisma: PrismaService) {
    super(prisma, 'product');
  }

  async findBySku(sku: string): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: { sku },
      include: {
        category: true,
        establishment: true,
      },
    });
  }

  async findByBarcode(barcode: string): Promise<Product | null> {
    return this.prisma.product.findFirst({
      where: { barcode },
      include: {
        category: true,
        establishment: true,
      },
    });
  }

  async findByEstablishment(establishmentId: string): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: { establishmentId },
      include: {
        category: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findByCategory(categoryId: string): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: { categoryId },
      include: {
        establishment: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findLowStock(establishmentId: string): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: {
        establishmentId,
        trackInventory: true,
        AND: [
          {
            currentStock: {
              lte: this.prisma.product.fields.minStock,
            },
          },
        ],
      },
      include: {
        category: true,
      },
      orderBy: { currentStock: 'asc' },
    });
  }

  async updateStock(id: string, quantity: number): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data: { currentStock: quantity },
    });
  }

  async toggleAvailability(id: string): Promise<Product> {
    const product = await this.findById(id);
    return this.prisma.product.update({
      where: { id },
      data: { isAvailable: !product?.isAvailable },
    });
  }

  async findFeatured(establishmentId: string): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: {
        establishmentId,
        isFeatured: true,
        isActive: true,
        isAvailable: true,
      },
      include: {
        category: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  // Override findById to include relations
  async findById(id: string): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        establishment: true,
        modifiers: {
          include: {
            options: true,
          },
        },
        dynamicPrices: {
          where: { isActive: true },
        },
      },
    });
  }

  // Override findAll to include relations
  async findAll(params?: any): Promise<Product[]> {
    return this.prisma.product.findMany({
      ...params,
      include: {
        category: true,
        establishment: {
          select: {
            id: true,
            name: true,
            tradeName: true,
          },
        },
      },
    });
  }
}
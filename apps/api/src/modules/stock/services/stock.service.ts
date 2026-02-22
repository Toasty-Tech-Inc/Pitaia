import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { StockMovement, StockMovementType, Product, Prisma } from '@prisma/client';
import { StockMovementRepository } from '../repositories/stock-movement.repository';
import { IStockService } from '../contracts/stock-service.interface';
import { CreateStockMovementDto } from '../dto/create-stock-movement.dto';
import { FilterStockMovementDto } from '../dto/filter-stock-movement.dto';
import { AdjustStockDto } from '../dto/adjust-stock.dto';
import { IPaginatedResult } from '../../../common/contracts/base-repository.interface';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class StockService implements IStockService {
  constructor(
    private readonly stockMovementRepository: StockMovementRepository,
    private readonly prisma: PrismaService,
  ) {}

  async createMovement(dto: CreateStockMovementDto): Promise<StockMovement> {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    if (!product.trackInventory) {
      throw new BadRequestException('Produto não rastreia estoque');
    }

    const previousStock = Number(product.currentStock) || 0;
    let newStock: number;

    // Calcular novo estoque baseado no tipo de movimento
    switch (dto.type) {
      case StockMovementType.PURCHASE:
      case StockMovementType.RETURN:
        newStock = previousStock + dto.quantity;
        break;
      case StockMovementType.SALE:
      case StockMovementType.LOSS:
      case StockMovementType.TRANSFER:
        newStock = previousStock - dto.quantity;
        if (newStock < 0) {
          throw new BadRequestException('Estoque insuficiente para esta operação');
        }
        break;
      case StockMovementType.ADJUSTMENT:
        newStock = dto.quantity; // Ajuste define o estoque diretamente
        break;
      default:
        newStock = previousStock;
    }

    // Usar transação para garantir consistência
    return this.prisma.$transaction(async (tx) => {
      // Atualizar estoque do produto
      await tx.product.update({
        where: { id: dto.productId },
        data: { currentStock: new Prisma.Decimal(newStock) },
      });

      // Criar movimento de estoque
      return tx.stockMovement.create({
        data: {
          productId: dto.productId,
          type: dto.type,
          quantity: new Prisma.Decimal(dto.quantity),
          reason: dto.reason,
          reference: dto.reference,
          previousStock: new Prisma.Decimal(previousStock),
          newStock: new Prisma.Decimal(newStock),
        },
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
      });
    });
  }

  async findAll(filters: FilterStockMovementDto): Promise<IPaginatedResult<StockMovement>> {
    const { productId, establishmentId, type, startDate, endDate, search, ...pagination } = filters;

    const where: any = {};

    if (productId) {
      where.productId = productId;
    }

    if (establishmentId) {
      where.product = { establishmentId };
    }

    if (type) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    if (search) {
      where.OR = [
        { reason: { contains: search, mode: 'insensitive' } },
        { reference: { contains: search, mode: 'insensitive' } },
        { product: { name: { contains: search, mode: 'insensitive' } } },
        { product: { sku: { contains: search } } },
      ];
    }

    return this.stockMovementRepository.paginate({
      ...pagination,
      ...where,
    });
  }

  async findOne(id: string): Promise<StockMovement> {
    const movement = await this.stockMovementRepository.findById(id);
    if (!movement) {
      throw new NotFoundException('Movimentação de estoque não encontrada');
    }
    return movement;
  }

  async findByProduct(productId: string): Promise<StockMovement[]> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    return this.stockMovementRepository.findByProduct(productId);
  }

  async adjustStock(productId: string, dto: AdjustStockDto): Promise<Product> {
    await this.createMovement({
      productId,
      type: dto.type,
      quantity: dto.quantity,
      reason: dto.reason,
      reference: dto.reference,
    });

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
      },
    });

    return product!;
  }

  async getStockReport(establishmentId: string): Promise<any> {
    // Buscar produtos com estoque
    const products = await this.prisma.product.findMany({
      where: {
        establishmentId,
        trackInventory: true,
      },
      include: {
        category: true,
      },
    });

    // Produtos com estoque baixo
    const lowStockProducts = products.filter(
      (p) => p.currentStock && p.minStock && Number(p.currentStock) <= Number(p.minStock),
    );

    // Produtos sem estoque
    const outOfStockProducts = products.filter(
      (p) => p.currentStock && Number(p.currentStock) === 0,
    );

    // Valor total em estoque
    const totalStockValue = products.reduce((sum, p) => {
      const cost = Number(p.cost) || Number(p.price);
      const stock = Number(p.currentStock) || 0;
      return sum + cost * stock;
    }, 0);

    // Últimas movimentações
    const recentMovements = await this.prisma.stockMovement.findMany({
      where: {
        product: { establishmentId },
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
      take: 20,
    });

    // Resumo por tipo de movimento (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const movementsByType = await this.prisma.stockMovement.groupBy({
      by: ['type'],
      where: {
        product: { establishmentId },
        createdAt: { gte: thirtyDaysAgo },
      },
      _count: { id: true },
      _sum: { quantity: true },
    });

    return {
      summary: {
        totalProducts: products.length,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,
        totalStockValue,
      },
      lowStockProducts: lowStockProducts.map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        currentStock: Number(p.currentStock),
        minStock: Number(p.minStock),
        category: p.category?.name,
      })),
      outOfStockProducts: outOfStockProducts.map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category?.name,
      })),
      recentMovements,
      movementsByType: movementsByType.map((m) => ({
        type: m.type,
        count: m._count.id,
        totalQuantity: Number(m._sum.quantity),
      })),
    };
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DynamicPrice, Prisma } from '@prisma/client';
import { DynamicPriceRepository } from '../repositories/dynamic-price.repository';
import { IDynamicPriceService } from '../contracts/dynamic-price-service.interface';
import { CreateDynamicPriceDto } from '../dto/create-dynamic-price.dto';
import { UpdateDynamicPriceDto } from '../dto/update-dynamic-price.dto';
import { FilterDynamicPriceDto } from '../dto/filter-dynamic-price.dto';
import { IPaginatedResult } from '../../../common/contracts/base-repository.interface';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class DynamicPriceService implements IDynamicPriceService {
  constructor(
    private readonly dynamicPriceRepository: DynamicPriceRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateDynamicPriceDto): Promise<DynamicPrice> {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    // Validar horários se ambos fornecidos
    if (dto.startTime && dto.endTime && dto.startTime >= dto.endTime) {
      throw new BadRequestException('Horário de início deve ser anterior ao horário de fim');
    }

    return this.dynamicPriceRepository.create({
      productId: dto.productId,
      dayOfWeek: dto.dayOfWeek,
      startTime: dto.startTime,
      endTime: dto.endTime,
      price: new Prisma.Decimal(dto.price),
      adjustment: new Prisma.Decimal(dto.adjustment),
      reason: dto.reason,
      confidence: new Prisma.Decimal(dto.confidence),
      isActive: dto.isActive ?? true,
    });
  }

  async findAll(filters: FilterDynamicPriceDto): Promise<IPaginatedResult<DynamicPrice>> {
    const { productId, establishmentId, isActive, dayOfWeek, ...pagination } = filters;

    const where: any = {};

    if (productId) {
      where.productId = productId;
    }

    if (establishmentId) {
      where.product = { establishmentId };
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (dayOfWeek !== undefined) {
      where.dayOfWeek = dayOfWeek;
    }

    return this.dynamicPriceRepository.paginate({
      ...pagination,
      ...where,
    });
  }

  async findOne(id: string): Promise<DynamicPrice> {
    const dynamicPrice = await this.dynamicPriceRepository.findById(id);
    if (!dynamicPrice) {
      throw new NotFoundException('Preço dinâmico não encontrado');
    }
    return dynamicPrice;
  }

  async findByProduct(productId: string): Promise<DynamicPrice[]> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    return this.dynamicPriceRepository.findByProduct(productId);
  }

  async update(id: string, dto: UpdateDynamicPriceDto): Promise<DynamicPrice> {
    await this.findOne(id);

    // Validar horários se ambos fornecidos
    if (dto.startTime && dto.endTime && dto.startTime >= dto.endTime) {
      throw new BadRequestException('Horário de início deve ser anterior ao horário de fim');
    }

    const updateData: any = {};

    if (dto.dayOfWeek !== undefined) updateData.dayOfWeek = dto.dayOfWeek;
    if (dto.startTime !== undefined) updateData.startTime = dto.startTime;
    if (dto.endTime !== undefined) updateData.endTime = dto.endTime;
    if (dto.price !== undefined) updateData.price = new Prisma.Decimal(dto.price);
    if (dto.adjustment !== undefined) updateData.adjustment = new Prisma.Decimal(dto.adjustment);
    if (dto.reason !== undefined) updateData.reason = dto.reason;
    if (dto.confidence !== undefined) updateData.confidence = new Prisma.Decimal(dto.confidence);
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    return this.dynamicPriceRepository.update(id, updateData);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.dynamicPriceRepository.delete(id);
  }

  async getCurrentPrice(productId: string): Promise<number> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    // Buscar preço dinâmico atual
    const dynamicPrice = await this.dynamicPriceRepository.findCurrentPrice(productId);

    if (dynamicPrice) {
      return Number(dynamicPrice.price);
    }

    // Retornar preço base do produto
    return Number(product.price);
  }

  async toggleActive(id: string): Promise<DynamicPrice> {
    const dynamicPrice = await this.findOne(id);
    return this.dynamicPriceRepository.update(id, {
      isActive: !dynamicPrice.isActive,
    });
  }

  // Métodos auxiliares para integração com IA

  async createBulkPrices(productId: string, prices: CreateDynamicPriceDto[]): Promise<DynamicPrice[]> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    const createdPrices: DynamicPrice[] = [];

    for (const priceDto of prices) {
      const created = await this.create({
        ...priceDto,
        productId,
      });
      createdPrices.push(created);
    }

    return createdPrices;
  }

  async getProductPricingAnalysis(productId: string): Promise<any> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        dynamicPrices: true,
        orderItems: {
          include: {
            order: {
              select: {
                createdAt: true,
                status: true,
              },
            },
          },
          take: 100,
          orderBy: { order: { createdAt: 'desc' } },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    // Analisar vendas por dia da semana
    const salesByDay: Record<number, { count: number; revenue: number }> = {};
    
    product.orderItems.forEach((item) => {
      if (item.order.status === 'COMPLETED') {
        const day = item.order.createdAt.getDay();
        if (!salesByDay[day]) {
          salesByDay[day] = { count: 0, revenue: 0 };
        }
        salesByDay[day].count++;
        salesByDay[day].revenue += Number(item.total);
      }
    });

    // Analisar vendas por hora
    const salesByHour: Record<number, { count: number; revenue: number }> = {};
    
    product.orderItems.forEach((item) => {
      if (item.order.status === 'COMPLETED') {
        const hour = item.order.createdAt.getHours();
        if (!salesByHour[hour]) {
          salesByHour[hour] = { count: 0, revenue: 0 };
        }
        salesByHour[hour].count++;
        salesByHour[hour].revenue += Number(item.total);
      }
    });

    return {
      product: {
        id: product.id,
        name: product.name,
        basePrice: Number(product.price),
        cost: product.cost ? Number(product.cost) : null,
      },
      activeDynamicPrices: product.dynamicPrices.filter((p) => p.isActive).length,
      totalDynamicPrices: product.dynamicPrices.length,
      salesAnalysis: {
        byDayOfWeek: Object.entries(salesByDay).map(([day, data]) => ({
          day: parseInt(day),
          dayName: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][parseInt(day)],
          ...data,
        })),
        byHour: Object.entries(salesByHour).map(([hour, data]) => ({
          hour: parseInt(hour),
          ...data,
        })),
      },
      suggestions: this.generatePricingSuggestions(salesByDay, salesByHour, Number(product.price)),
    };
  }

  private generatePricingSuggestions(
    salesByDay: Record<number, { count: number; revenue: number }>,
    salesByHour: Record<number, { count: number; revenue: number }>,
    basePrice: number,
  ): any[] {
    const suggestions: any[] = [];

    // Encontrar dias com mais vendas
    const sortedDays = Object.entries(salesByDay).sort((a, b) => b[1].count - a[1].count);
    
    if (sortedDays.length > 0) {
      const topDay = sortedDays[0];
      const bottomDay = sortedDays[sortedDays.length - 1];

      if (parseInt(topDay[0]) !== parseInt(bottomDay[0])) {
        suggestions.push({
          type: 'INCREASE',
          dayOfWeek: parseInt(topDay[0]),
          suggestedAdjustment: 10,
          reason: 'Alto volume de vendas neste dia',
        });

        suggestions.push({
          type: 'DECREASE',
          dayOfWeek: parseInt(bottomDay[0]),
          suggestedAdjustment: -10,
          reason: 'Baixo volume de vendas neste dia',
        });
      }
    }

    // Encontrar horários de pico
    const sortedHours = Object.entries(salesByHour).sort((a, b) => b[1].count - a[1].count);
    
    if (sortedHours.length > 2) {
      const peakHour = parseInt(sortedHours[0][0]);
      suggestions.push({
        type: 'INCREASE',
        startTime: `${peakHour.toString().padStart(2, '0')}:00`,
        endTime: `${(peakHour + 1).toString().padStart(2, '0')}:00`,
        suggestedAdjustment: 5,
        reason: 'Horário de pico de vendas',
      });
    }

    return suggestions;
  }
}

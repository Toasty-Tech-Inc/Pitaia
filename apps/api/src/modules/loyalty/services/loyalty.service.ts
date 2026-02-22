import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { LoyaltyTransaction, LoyaltyTransactionType } from '@prisma/client';
import { LoyaltyRepository } from '../repositories/loyalty.repository';
import { ILoyaltyService } from '../contracts/loyalty-service.interface';
import { CreateLoyaltyTransactionDto } from '../dto/create-loyalty-transaction.dto';
import { FilterLoyaltyTransactionDto } from '../dto/filter-loyalty-transaction.dto';
import { RedeemPointsDto } from '../dto/redeem-points.dto';
import { IPaginatedResult } from '../../../common/contracts/base-repository.interface';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class LoyaltyService implements ILoyaltyService {
  constructor(
    private readonly loyaltyRepository: LoyaltyRepository,
    private readonly prisma: PrismaService,
  ) {}

  async earnPoints(dto: CreateLoyaltyTransactionDto): Promise<LoyaltyTransaction> {
    const customer = await this.prisma.customer.findUnique({
      where: { id: dto.customerId },
    });

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    // Usar transação para garantir consistência
    return this.prisma.$transaction(async (tx) => {
      // Atualizar saldo do cliente
      await tx.customer.update({
        where: { id: dto.customerId },
        data: {
          loyaltyPoints: {
            increment: dto.points,
          },
        },
      });

      // Criar transação de fidelidade
      return tx.loyaltyTransaction.create({
        data: {
          customerId: dto.customerId,
          saleId: dto.saleId,
          type: LoyaltyTransactionType.EARNED,
          points: dto.points,
          description: dto.description || 'Pontos ganhos em compra',
          expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              loyaltyPoints: true,
            },
          },
        },
      });
    });
  }

  async redeemPoints(customerId: string, dto: RedeemPointsDto): Promise<LoyaltyTransaction> {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    if (customer.loyaltyPoints < dto.points) {
      throw new BadRequestException(
        `Saldo insuficiente. Saldo atual: ${customer.loyaltyPoints} pontos`,
      );
    }

    // Usar transação para garantir consistência
    return this.prisma.$transaction(async (tx) => {
      // Atualizar saldo do cliente
      await tx.customer.update({
        where: { id: customerId },
        data: {
          loyaltyPoints: {
            decrement: dto.points,
          },
        },
      });

      // Criar transação de resgate
      return tx.loyaltyTransaction.create({
        data: {
          customerId,
          saleId: dto.saleId,
          type: LoyaltyTransactionType.REDEEMED,
          points: dto.points,
          description: dto.description || 'Pontos resgatados',
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              loyaltyPoints: true,
            },
          },
        },
      });
    });
  }

  async findAll(
    filters: FilterLoyaltyTransactionDto,
  ): Promise<IPaginatedResult<LoyaltyTransaction>> {
    const { customerId, saleId, type, startDate, endDate, ...pagination } = filters;

    const where: any = {};

    if (customerId) {
      where.customerId = customerId;
    }

    if (saleId) {
      where.saleId = saleId;
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

    return this.loyaltyRepository.paginate({
      ...pagination,
      ...where,
    });
  }

  async findByCustomer(customerId: string): Promise<LoyaltyTransaction[]> {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return this.loyaltyRepository.findByCustomer(customerId);
  }

  async getCustomerBalance(customerId: string): Promise<number> {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return customer.loyaltyPoints;
  }

  async adjustPoints(dto: CreateLoyaltyTransactionDto): Promise<LoyaltyTransaction> {
    const customer = await this.prisma.customer.findUnique({
      where: { id: dto.customerId },
    });

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    // Para ajustes negativos, verificar saldo
    if (dto.points < 0 && customer.loyaltyPoints + dto.points < 0) {
      throw new BadRequestException('Ajuste resultaria em saldo negativo');
    }

    return this.prisma.$transaction(async (tx) => {
      // Atualizar saldo do cliente
      if (dto.points > 0) {
        await tx.customer.update({
          where: { id: dto.customerId },
          data: {
            loyaltyPoints: {
              increment: dto.points,
            },
          },
        });
      } else {
        await tx.customer.update({
          where: { id: dto.customerId },
          data: {
            loyaltyPoints: {
              decrement: Math.abs(dto.points),
            },
          },
        });
      }

      // Criar transação de ajuste
      return tx.loyaltyTransaction.create({
        data: {
          customerId: dto.customerId,
          type: LoyaltyTransactionType.ADJUSTED,
          points: dto.points,
          description: dto.description || 'Ajuste manual de pontos',
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              loyaltyPoints: true,
            },
          },
        },
      });
    });
  }

  async processExpiredPoints(): Promise<number> {
    const now = new Date();

    // Buscar transações de pontos que expiraram
    const expiredTransactions = await this.prisma.loyaltyTransaction.findMany({
      where: {
        type: LoyaltyTransactionType.EARNED,
        expiresAt: {
          lt: now,
        },
      },
      include: {
        customer: true,
      },
    });

    // Agrupar por cliente
    const customerExpiredPoints: Record<string, number> = {};
    expiredTransactions.forEach((t) => {
      if (!customerExpiredPoints[t.customerId]) {
        customerExpiredPoints[t.customerId] = 0;
      }
      customerExpiredPoints[t.customerId] += t.points;
    });

    let totalExpired = 0;

    // Processar expiração para cada cliente
    for (const [customerId, points] of Object.entries(customerExpiredPoints)) {
      await this.prisma.$transaction(async (tx) => {
        // Decrementar pontos do cliente
        await tx.customer.update({
          where: { id: customerId },
          data: {
            loyaltyPoints: {
              decrement: points,
            },
          },
        });

        // Criar transação de expiração
        await tx.loyaltyTransaction.create({
          data: {
            customerId,
            type: LoyaltyTransactionType.EXPIRED,
            points,
            description: 'Pontos expirados automaticamente',
          },
        });

        // Marcar transações originais como processadas (remover expiresAt)
        await tx.loyaltyTransaction.updateMany({
          where: {
            customerId,
            type: LoyaltyTransactionType.EARNED,
            expiresAt: {
              lt: now,
            },
          },
          data: {
            expiresAt: null,
          },
        });
      });

      totalExpired += points;
    }

    return totalExpired;
  }

  async getCustomerLoyaltySummary(customerId: string): Promise<any> {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    const transactions = await this.loyaltyRepository.findByCustomer(customerId);

    // Calcular totais
    const earned = transactions
      .filter((t) => t.type === LoyaltyTransactionType.EARNED)
      .reduce((sum, t) => sum + t.points, 0);

    const redeemed = transactions
      .filter((t) => t.type === LoyaltyTransactionType.REDEEMED)
      .reduce((sum, t) => sum + t.points, 0);

    const expired = transactions
      .filter((t) => t.type === LoyaltyTransactionType.EXPIRED)
      .reduce((sum, t) => sum + t.points, 0);

    const adjusted = transactions
      .filter((t) => t.type === LoyaltyTransactionType.ADJUSTED)
      .reduce((sum, t) => sum + t.points, 0);

    // Pontos prestes a expirar (próximos 30 dias)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringPoints = await this.prisma.loyaltyTransaction.findMany({
      where: {
        customerId,
        type: LoyaltyTransactionType.EARNED,
        expiresAt: {
          gte: new Date(),
          lte: thirtyDaysFromNow,
        },
      },
    });

    const pointsExpiringSoon = expiringPoints.reduce((sum, t) => sum + t.points, 0);

    return {
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
      },
      balance: customer.loyaltyPoints,
      summary: {
        earned,
        redeemed,
        expired,
        adjusted,
      },
      pointsExpiringSoon,
      recentTransactions: transactions.slice(0, 10),
    };
  }
}

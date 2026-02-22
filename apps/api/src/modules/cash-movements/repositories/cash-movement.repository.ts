import { Injectable } from '@nestjs/common';
import { CashMovement, CashMovementType } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { ICashMovementRepository } from '../contracts/cash-movement-repository.interface';

@Injectable()
export class CashMovementRepository
  extends BaseRepository<CashMovement>
  implements ICashMovementRepository
{
  constructor(prisma: PrismaService) {
    super(prisma, 'cashMovement');
  }

  async findBySession(cashierSessionId: string): Promise<CashMovement[]> {
    return this.prisma.cashMovement.findMany({
      where: { cashierSessionId },
      include: {
        cashierSession: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
            establishment: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<CashMovement[]> {
    return this.prisma.cashMovement.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        cashierSession: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
            establishment: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByType(cashierSessionId: string, type: CashMovementType): Promise<CashMovement[]> {
    return this.prisma.cashMovement.findMany({
      where: {
        cashierSessionId,
        type,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTotalByType(cashierSessionId: string, type: CashMovementType): Promise<number> {
    const result = await this.prisma.cashMovement.aggregate({
      where: {
        cashierSessionId,
        type,
      },
      _sum: {
        amount: true,
      },
    });

    return Number(result._sum.amount) || 0;
  }

  async getSessionSummary(cashierSessionId: string): Promise<any> {
    const movements = await this.findBySession(cashierSessionId);

    const deposits = movements
      .filter((m) => m.type === CashMovementType.DEPOSIT)
      .reduce((sum, m) => sum + Number(m.amount), 0);

    const withdrawals = movements
      .filter((m) => m.type === CashMovementType.WITHDRAWAL)
      .reduce((sum, m) => sum + Number(m.amount), 0);

    const adjustments = movements
      .filter((m) => m.type === CashMovementType.ADJUSTMENT)
      .reduce((sum, m) => sum + Number(m.amount), 0);

    return {
      totalMovements: movements.length,
      deposits: {
        count: movements.filter((m) => m.type === CashMovementType.DEPOSIT).length,
        total: deposits,
      },
      withdrawals: {
        count: movements.filter((m) => m.type === CashMovementType.WITHDRAWAL).length,
        total: withdrawals,
      },
      adjustments: {
        count: movements.filter((m) => m.type === CashMovementType.ADJUSTMENT).length,
        total: adjustments,
      },
      netMovement: deposits - withdrawals + adjustments,
      movements,
    };
  }

  async findById(id: string): Promise<CashMovement | null> {
    return this.prisma.cashMovement.findUnique({
      where: { id },
      include: {
        cashierSession: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
            establishment: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }
}

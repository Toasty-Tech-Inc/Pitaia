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
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findByDateRange(
    cashierSessionId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<CashMovement[]> {
    return this.prisma.cashMovement.findMany({
      where: {
        cashierSessionId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getTotalByType(
    cashierSessionId: string,
    type: string,
  ): Promise<number> {
    const movements = await this.prisma.cashMovement.findMany({
      where: {
        cashierSessionId,
        type: type as CashMovementType,
      },
    });

    return movements.reduce(
      (sum, movement) => sum + Number(movement.amount),
      0,
    );
  }
}

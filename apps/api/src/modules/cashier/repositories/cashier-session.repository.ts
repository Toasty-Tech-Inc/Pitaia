import { Injectable } from '@nestjs/common';
import { CashierSession, Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { ICashierSessionRepository } from '../contracts/cashier-session-repository.interface';

@Injectable()
export class CashierSessionRepository
  extends BaseRepository<CashierSession>
  implements ICashierSessionRepository
{
  constructor(prisma: PrismaService) {
    super(prisma, 'cashierSession');
  }

  async findByEstablishment(establishmentId: string): Promise<CashierSession[]> {
    return this.prisma.cashierSession.findMany({
      where: { establishmentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        movements: true,
        sales: true,
      },
      orderBy: { openedAt: 'desc' },
    });
  }

  async findByUser(userId: string): Promise<CashierSession[]> {
    return this.prisma.cashierSession.findMany({
      where: { userId },
      include: {
        establishment: true,
        movements: true,
        sales: true,
      },
      orderBy: { openedAt: 'desc' },
    });
  }

  async findActiveByUser(userId: string): Promise<CashierSession | null> {
    return this.prisma.cashierSession.findFirst({
      where: {
        userId,
        closedAt: null,
      },
      include: {
        establishment: true,
        movements: true,
      },
    });
  }

  async findActiveByEstablishment(establishmentId: string): Promise<CashierSession[]> {
    return this.prisma.cashierSession.findMany({
      where: {
        establishmentId,
        closedAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        movements: true,
      },
      orderBy: { openedAt: 'desc' },
    });
  }

  async findByDateRange(
    establishmentId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<CashierSession[]> {
    return this.prisma.cashierSession.findMany({
      where: {
        establishmentId,
        openedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        movements: true,
        sales: true,
      },
      orderBy: { openedAt: 'desc' },
    });
  }

  async findWithDetails(id: string): Promise<CashierSession | null> {
    return this.prisma.cashierSession.findUnique({
      where: { id },
      include: {
        establishment: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        movements: {
          orderBy: { createdAt: 'asc' },
        },
        sales: {
          include: {
            order: {
              include: {
                customer: true,
              },
            },
            payments: {
              include: {
                paymentMethod: true,
              },
            },
          },
        },
      },
    });
  }

  async closeSession(
    id: string,
    closingAmount: number,
    notes?: string,
  ): Promise<CashierSession> {
    const session = await this.findById(id);
    const expectedAmount = await this.calculateExpectedAmount(id);
    const difference = closingAmount - expectedAmount;

    return this.prisma.cashierSession.update({
      where: { id },
      data: {
        closingAmount: new Prisma.Decimal(closingAmount),
        expectedAmount: new Prisma.Decimal(expectedAmount),
        difference: new Prisma.Decimal(difference),
        closedAt: new Date(),
        notes,
      },
    });
  }

  private async calculateExpectedAmount(sessionId: string): Promise<number> {
    const session = await this.findWithDetails(sessionId);
    if (!session) return 0;

    let expected = Number(session.openingAmount);

    // Somar vendas em dinheiro
    const cashSales = await this.prisma.payment.findMany({
      where: {
        sale: {
          cashierSessionId: sessionId,
        },
        paymentMethod: {
          requiresChange: true, // Pagamentos que exigem troco são dinheiro
        },
        status: 'PAID',
      },
    });

    const cashSalesTotal = cashSales.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0,
    );

    expected += cashSalesTotal;

    // Adicionar depósitos e subtrair retiradas
    session.movements.forEach((movement) => {
      const amount = Number(movement.amount);
      if (movement.type === 'DEPOSIT' || movement.type === 'ADJUSTMENT') {
        expected += amount;
      } else if (movement.type === 'WITHDRAWAL') {
        expected -= amount;
      }
    });

    return expected;
  }

  async findById(id: string): Promise<CashierSession | null> {
    return this.findWithDetails(id);
  }
}

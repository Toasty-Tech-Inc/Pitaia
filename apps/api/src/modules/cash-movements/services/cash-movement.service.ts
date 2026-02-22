import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CashMovement, CashMovementType, Prisma } from '@prisma/client';
import { CashMovementRepository } from '../repositories/cash-movement.repository';
import { ICashMovementService } from '../contracts/cash-movement-service.interface';
import { CreateCashMovementDto } from '../dto/create-cash-movement.dto';
import { FilterCashMovementDto } from '../dto/filter-cash-movement.dto';
import { IPaginatedResult } from '../../../common/contracts/base-repository.interface';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class CashMovementService implements ICashMovementService {
  constructor(
    private readonly cashMovementRepository: CashMovementRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateCashMovementDto): Promise<CashMovement> {
    // Verificar se a sessão existe e está aberta
    const session = await this.prisma.cashierSession.findUnique({
      where: { id: dto.cashierSessionId },
    });

    if (!session) {
      throw new NotFoundException('Sessão de caixa não encontrada');
    }

    if (session.closedAt) {
      throw new BadRequestException('Não é possível adicionar movimentações em sessão fechada');
    }

    return this.cashMovementRepository.create({
      cashierSessionId: dto.cashierSessionId,
      type: dto.type,
      amount: new Prisma.Decimal(dto.amount),
      reason: dto.reason,
      notes: dto.notes,
    });
  }

  async findAll(filters: FilterCashMovementDto): Promise<IPaginatedResult<CashMovement>> {
    const { cashierSessionId, establishmentId, type, startDate, endDate, ...pagination } = filters;

    const where: any = {};

    if (cashierSessionId) {
      where.cashierSessionId = cashierSessionId;
    }

    if (establishmentId) {
      where.cashierSession = { establishmentId };
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

    return this.cashMovementRepository.paginate({
      ...pagination,
      ...where,
    });
  }

  async findOne(id: string): Promise<CashMovement> {
    const movement = await this.cashMovementRepository.findById(id);
    if (!movement) {
      throw new NotFoundException('Movimentação não encontrada');
    }
    return movement;
  }

  async findBySession(cashierSessionId: string): Promise<CashMovement[]> {
    const session = await this.prisma.cashierSession.findUnique({
      where: { id: cashierSessionId },
    });

    if (!session) {
      throw new NotFoundException('Sessão de caixa não encontrada');
    }

    return this.cashMovementRepository.findBySession(cashierSessionId);
  }

  async getSessionSummary(cashierSessionId: string): Promise<any> {
    const session = await this.prisma.cashierSession.findUnique({
      where: { id: cashierSessionId },
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
    });

    if (!session) {
      throw new NotFoundException('Sessão de caixa não encontrada');
    }

    const movementsSummary = await this.cashMovementRepository.getSessionSummary(cashierSessionId);

    // Buscar vendas da sessão
    const sales = await this.prisma.sale.findMany({
      where: { cashierSessionId },
      include: {
        payments: {
          include: {
            paymentMethod: true,
          },
        },
      },
    });

    // Agrupar vendas por método de pagamento
    const salesByPaymentMethod: Record<string, { count: number; total: number }> = {};
    let totalCashSales = 0;

    sales.forEach((sale) => {
      sale.payments.forEach((payment) => {
        const method = payment.paymentMethod.name;
        const type = payment.paymentMethod.type;

        if (!salesByPaymentMethod[method]) {
          salesByPaymentMethod[method] = { count: 0, total: 0 };
        }
        salesByPaymentMethod[method].count++;
        salesByPaymentMethod[method].total += Number(payment.amount);

        if (type === 'CASH') {
          totalCashSales += Number(payment.amount);
        }
      });
    });

    // Calcular saldo esperado em dinheiro
    const expectedCash =
      Number(session.openingAmount) +
      totalCashSales +
      movementsSummary.deposits.total -
      movementsSummary.withdrawals.total +
      movementsSummary.adjustments.total;

    return {
      session: {
        id: session.id,
        openedAt: session.openedAt,
        closedAt: session.closedAt,
        openingAmount: Number(session.openingAmount),
        closingAmount: session.closingAmount ? Number(session.closingAmount) : null,
        user: session.user,
        establishment: session.establishment,
      },
      sales: {
        count: sales.length,
        total: sales.reduce((sum, s) => sum + Number(s.total), 0),
        byPaymentMethod: salesByPaymentMethod,
        totalCash: totalCashSales,
      },
      movements: movementsSummary,
      expectedCashBalance: expectedCash,
    };
  }

  async getDailyReport(establishmentId: string, date: string): Promise<any> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Buscar sessões do dia
    const sessions = await this.prisma.cashierSession.findMany({
      where: {
        establishmentId,
        openedAt: {
          gte: startOfDay,
          lte: endOfDay,
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
        sales: {
          include: {
            payments: {
              include: {
                paymentMethod: true,
              },
            },
          },
        },
      },
    });

    // Calcular totais
    let totalDeposits = 0;
    let totalWithdrawals = 0;
    let totalSales = 0;
    let totalCashSales = 0;
    const paymentMethodTotals: Record<string, number> = {};

    sessions.forEach((session) => {
      session.movements.forEach((m) => {
        if (m.type === CashMovementType.DEPOSIT) {
          totalDeposits += Number(m.amount);
        } else if (m.type === CashMovementType.WITHDRAWAL) {
          totalWithdrawals += Number(m.amount);
        }
      });

      session.sales.forEach((sale) => {
        totalSales += Number(sale.total);
        sale.payments.forEach((payment) => {
          const method = payment.paymentMethod.name;
          const type = payment.paymentMethod.type;

          if (!paymentMethodTotals[method]) {
            paymentMethodTotals[method] = 0;
          }
          paymentMethodTotals[method] += Number(payment.amount);

          if (type === 'CASH') {
            totalCashSales += Number(payment.amount);
          }
        });
      });
    });

    return {
      date,
      establishmentId,
      sessionsCount: sessions.length,
      sessions: sessions.map((s) => ({
        id: s.id,
        user: s.user,
        openedAt: s.openedAt,
        closedAt: s.closedAt,
        openingAmount: Number(s.openingAmount),
        closingAmount: s.closingAmount ? Number(s.closingAmount) : null,
        salesCount: s.sales.length,
        movementsCount: s.movements.length,
      })),
      totals: {
        deposits: totalDeposits,
        withdrawals: totalWithdrawals,
        netMovements: totalDeposits - totalWithdrawals,
        sales: totalSales,
        cashSales: totalCashSales,
        byPaymentMethod: paymentMethodTotals,
      },
    };
  }
}

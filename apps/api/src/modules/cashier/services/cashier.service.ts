import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { CashierSession, CashMovement, Prisma } from '@prisma/client';
import { CashierSessionRepository } from '../repositories/cashier-session.repository';
import { CashMovementRepository } from '../repositories/cash-movement.repository';
import { ICashierService } from '../contracts/cashier-service.interface';
import { OpenCashierSessionDto } from '../dto/open-cashier-session.dto';
import { CloseCashierSessionDto } from '../dto/close-cashier-session.dto';
import { CreateCashMovementDto } from '../dto/create-cash-movement.dto';
import { FilterCashierSessionDto } from '../dto/filter-cashier-session.dto';
import { IPaginatedResult } from '../../../common/contracts/base-repository.interface';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class CashierService implements ICashierService {
  constructor(
    private readonly cashierSessionRepository: CashierSessionRepository,
    private readonly cashMovementRepository: CashMovementRepository,
    private readonly prisma: PrismaService,
  ) {}

  async openSession(dto: OpenCashierSessionDto): Promise<CashierSession> {
    // Verificar se usuário já tem sessão aberta
    const activeSession = await this.cashierSessionRepository.findActiveByUser(
      dto.userId,
    );

    if (activeSession) {
      throw new ConflictException(
        'Usuário já possui uma sessão de caixa aberta',
      );
    }

    return this.cashierSessionRepository.create({
      ...dto,
      openingAmount: new Prisma.Decimal(dto.openingAmount),
    });
  }

  async closeSession(
    id: string,
    dto: CloseCashierSessionDto,
  ): Promise<CashierSession> {
    const session = await this.findOne(id);

    if (session.closedAt) {
      throw new BadRequestException('Sessão de caixa já está fechada');
    }

    return this.cashierSessionRepository.closeSession(
      id,
      dto.closingAmount,
      dto.notes,
    );
  }

  async findAll(
    filters: FilterCashierSessionDto,
  ): Promise<IPaginatedResult<CashierSession>> {
    const {
      establishmentId,
      userId,
      isOpen,
      startDate,
      endDate,
      ...pagination
    } = filters;

    const where: any = {};

    if (establishmentId) {
      where.establishmentId = establishmentId;
    }

    if (userId) {
      where.userId = userId;
    }

    if (isOpen !== undefined) {
      where.closedAt = isOpen ? null : { not: null };
    }

    if (startDate || endDate) {
      where.openedAt = {};
      if (startDate) {
        where.openedAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.openedAt.lte = new Date(endDate);
      }
    }

    return this.cashierSessionRepository.paginate({
      ...pagination,
      ...where,
    });
  }

  async findOne(id: string): Promise<CashierSession> {
    const session = await this.cashierSessionRepository.findById(id);
    if (!session) {
      throw new NotFoundException('Sessão de caixa não encontrada');
    }
    return session;
  }

  async getActiveSession(userId: string): Promise<CashierSession | null> {
    return this.cashierSessionRepository.findActiveByUser(userId);
  }

  // ============================================
  // CASH MOVEMENTS
  // ============================================

  async createMovement(dto: CreateCashMovementDto): Promise<CashMovement> {
    const session = await this.findOne(dto.cashierSessionId);

    if (session.closedAt) {
      throw new BadRequestException(
        'Não é possível adicionar movimentos em sessão fechada',
      );
    }

    return this.cashMovementRepository.create({
      ...dto,
      amount: new Prisma.Decimal(dto.amount),
    });
  }

  async getMovementsBySession(sessionId: string): Promise<CashMovement[]> {
    await this.findOne(sessionId);
    return this.cashMovementRepository.findBySession(sessionId);
  }

  // ============================================
  // REPORTS
  // ============================================

  async getSessionReport(sessionId: string): Promise<any> {
    const session = await this.findOne(sessionId);
    const movements = await this.cashMovementRepository.findBySession(
      sessionId,
    );

    // Calcular totais de vendas
    const sales = await this.prisma.sale.findMany({
      where: { cashierSessionId: sessionId },
      include: {
        payments: {
          include: {
            paymentMethod: true,
          },
        },
      },
    });

    const totalSales = sales.length;
    const totalRevenue = sales.reduce(
      (sum, sale) => sum + Number(sale.total),
      0,
    );

    // Agrupar vendas por forma de pagamento
    const salesByPaymentMethod: Record<
      string,
      { count: number; total: number }
    > = {};
    sales.forEach((sale) => {
      sale.payments.forEach((payment) => {
        const method = payment.paymentMethod.name;
        if (!salesByPaymentMethod[method]) {
          salesByPaymentMethod[method] = { count: 0, total: 0 };
        }
        salesByPaymentMethod[method].count++;
        salesByPaymentMethod[method].total += Number(payment.amount);
      });
    });

    // Calcular totais de movimentos
    const deposits = movements
      .filter((m) => m.type === 'DEPOSIT')
      .reduce((sum, m) => sum + Number(m.amount), 0);

    const withdrawals = movements
      .filter((m) => m.type === 'WITHDRAWAL')
      .reduce((sum, m) => sum + Number(m.amount), 0);

    const adjustments = movements
      .filter((m) => m.type === 'ADJUSTMENT')
      .reduce((sum, m) => sum + Number(m.amount), 0);

    return {
      session: {
        id: session.id,
        openedAt: session.openedAt,
        closedAt: session.closedAt,
        openingAmount: Number(session.openingAmount),
        closingAmount: session.closingAmount
          ? Number(session.closingAmount)
          : null,
        expectedAmount: session.expectedAmount
          ? Number(session.expectedAmount)
          : null,
        difference: session.difference ? Number(session.difference) : null,
        isOpen: !session.closedAt,
      },
      sales: {
        totalSales,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        averageTicket:
          totalSales > 0
            ? Math.round((totalRevenue / totalSales) * 100) / 100
            : 0,
        byPaymentMethod: salesByPaymentMethod,
      },
      movements: {
        totalDeposits: Math.round(deposits * 100) / 100,
        totalWithdrawals: Math.round(withdrawals * 100) / 100,
        totalAdjustments: Math.round(adjustments * 100) / 100,
        list: movements,
      },
    };
  }

  async getDailyReport(establishmentId: string, date: Date): Promise<any> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const sessions = await this.cashierSessionRepository.findByDateRange(
      establishmentId,
      startOfDay,
      endOfDay,
    );

    const reports = await Promise.all(
      sessions.map((session) => this.getSessionReport(session.id)),
    );

    const totalSales = reports.reduce(
      (sum, report) => sum + report.sales.totalSales,
      0,
    );
    const totalRevenue = reports.reduce(
      (sum, report) => sum + report.sales.totalRevenue,
      0,
    );

    return {
      date: date.toISOString().split('T')[0],
      totalSessions: sessions.length,
      openSessions: sessions.filter((s) => !s.closedAt).length,
      closedSessions: sessions.filter((s) => s.closedAt).length,
      summary: {
        totalSales,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        averageTicket:
          totalSales > 0
            ? Math.round((totalRevenue / totalSales) * 100) / 100
            : 0,
      },
      sessions: reports,
    };
  }
}

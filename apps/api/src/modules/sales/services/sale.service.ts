import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Sale, Prisma } from '@prisma/client';
import { SaleRepository } from '../repositories/sale.repository';
import { ISaleService } from '../contracts/sale-service.interface';
import { CreateSaleDto } from '../dto/create-sale.dto';
import { FilterSaleDto } from '../dto/filter-sale.dto';
import { SaleReportDto, ReportType } from '../dto/sale-report.dto';
import { IPaginatedResult } from '../../../common/contracts/base-repository.interface';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class SaleService implements ISaleService {
  constructor(
    private readonly saleRepository: SaleRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(createSaleDto: CreateSaleDto): Promise<Sale> {
    // Verificar se pedido existe
    const order = await this.prisma.order.findUnique({
      where: { id: createSaleDto.orderId },
    });

    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }

    // Verificar se já existe venda para este pedido
    const existingSale = await this.prisma.sale.findUnique({
      where: { orderId: createSaleDto.orderId },
    });

    if (existingSale) {
      throw new BadRequestException('Já existe venda para este pedido');
    }

    return this.saleRepository.create({
      ...createSaleDto,
      subtotal: new Prisma.Decimal(createSaleDto.subtotal),
      discount: new Prisma.Decimal(createSaleDto.discount || 0),
      total: new Prisma.Decimal(createSaleDto.total),
      paid: new Prisma.Decimal(0),
      change: new Prisma.Decimal(0),
      paymentStatus: 'PENDING',
    });
  }

  async findAll(filters: FilterSaleDto): Promise<IPaginatedResult<Sale>> {
    const {
      establishmentId,
      customerId,
      sellerId,
      cashierSessionId,
      paymentStatus,
      startDate,
      endDate,
      ...pagination
    } = filters;

    const where: any = {};

    if (establishmentId) {
      where.establishmentId = establishmentId;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (sellerId) {
      where.sellerId = sellerId;
    }

    if (cashierSessionId) {
      where.cashierSessionId = cashierSessionId;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
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

    return this.saleRepository.paginate({
      ...pagination,
      ...where,
    });
  }

  async findOne(id: string): Promise<Sale> {
    const sale = await this.saleRepository.findById(id);
    if (!sale) {
      throw new NotFoundException('Venda não encontrada');
    }
    return sale;
  }

  async getSalesByEstablishment(establishmentId: string): Promise<Sale[]> {
    return this.saleRepository.findByEstablishment(establishmentId);
  }

  async getSalesByCashierSession(cashierSessionId: string): Promise<Sale[]> {
    return this.saleRepository.findByCashierSession(cashierSessionId);
  }

  async getSalesReport(reportDto: SaleReportDto): Promise<any> {
    let startDate: Date;
    let endDate: Date;

    // Definir período baseado no tipo de relatório
    switch (reportDto.type) {
      case ReportType.DAILY:
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        break;

      case ReportType.WEEKLY:
        endDate = new Date();
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;

      case ReportType.MONTHLY:
        endDate = new Date();
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;

      case ReportType.CUSTOM:
        if (!reportDto.startDate || !reportDto.endDate) {
          throw new BadRequestException(
            'startDate e endDate são obrigatórios para relatório customizado',
          );
        }
        startDate = new Date(reportDto.startDate);
        endDate = new Date(reportDto.endDate);
        break;

      default:
        throw new BadRequestException('Tipo de relatório inválido');
    }

    // Buscar totais do período
    const totals = await this.saleRepository.getTotalsByPeriod(
      reportDto.establishmentId,
      startDate,
      endDate,
    );

    // Buscar vendas do período
    const sales = await this.saleRepository.findByDateRange(
      reportDto.establishmentId,
      startDate,
      endDate,
    );

    // Agrupar vendas por status de pagamento
    const salesByPaymentStatus = sales.reduce((acc, sale) => {
      const status = sale.paymentStatus;
      if (!acc[status]) {
        acc[status] = { count: 0, total: 0 };
      }
      acc[status].count++;
      acc[status].total += Number(sale.total);
      return acc;
    }, {} as Record<string, { count: number; total: number }>);

    // Agrupar vendas por forma de pagamento
    const salesByPaymentMethod: Record<
      string,
      { count: number; total: number }
    > = {};
    sales.forEach((sale) => {
      // @ts-expect-error prisma me tirando
      sale.payments.forEach((payment) => {
        const method = payment.paymentMethod.name;
        if (!salesByPaymentMethod[method]) {
          salesByPaymentMethod[method] = { count: 0, total: 0 };
        }
        salesByPaymentMethod[method].count++;
        salesByPaymentMethod[method].total += Number(payment.amount);
      });
    });

    return {
      period: {
        type: reportDto.type,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      summary: totals,
      salesByPaymentStatus,
      salesByPaymentMethod,
      topProducts: await this.getTopProducts(
        reportDto.establishmentId,
        startDate,
        endDate,
        10,
      ),
    };
  }

  async getDailyReport(establishmentId: string, date: Date): Promise<any> {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    return this.getSalesReport({
      establishmentId,
      type: ReportType.DAILY,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  }

  async getProductSalesReport(
    establishmentId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    const sales = await this.saleRepository.findByDateRange(
      establishmentId,
      startDate,
      endDate,
    );

    // Agrupar por produto
    const productSales: Record<
      string,
      {
        productId: string;
        productName: string;
        quantity: number;
        revenue: number;
        cost: number;
        profit: number;
      }
    > = {};

    sales.forEach((sale) => {
      //@ts-expect-error prisma me tirando 👍
      sale.items.forEach((item) => {
        const productId = item.productId;
        if (!productSales[productId]) {
          productSales[productId] = {
            productId,
            productName: item.product.name,
            quantity: 0,
            revenue: 0,
            cost: 0,
            profit: 0,
          };
        }

        const quantity = Number(item.quantity);
        const revenue = Number(item.total);
        const cost = item.unitCost
          ? Number(item.unitCost) * quantity
          : 0;

        productSales[productId].quantity += quantity;
        productSales[productId].revenue += revenue;
        productSales[productId].cost += cost;
        productSales[productId].profit += revenue - cost;
      });
    });

    // Converter para array e ordenar por revenue
    const products = Object.values(productSales).sort(
      (a, b) => b.revenue - a.revenue,
    );

    return {
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      totalProducts: products.length,
      products,
    };
  }

  async getCustomerSalesReport(
    customerId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    const sales = await this.prisma.sale.findMany({
      where: {
        customerId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
        payments: {
          include: {
            paymentMethod: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalSales = sales.length;
    const totalSpent = sales.reduce(
      (sum, sale) => sum + Number(sale.total),
      0,
    );
    const averageTicket = totalSales > 0 ? totalSpent / totalSales : 0;

    return {
      customerId,
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      summary: {
        totalSales,
        totalSpent: Math.round(totalSpent * 100) / 100,
        averageTicket: Math.round(averageTicket * 100) / 100,
      },
      sales,
    };
  }

  private async getTopProducts(
    establishmentId: string,
    startDate: Date,
    endDate: Date,
    limit: number,
  ): Promise<any[]> {
    const report = await this.getProductSalesReport(
      establishmentId,
      startDate,
      endDate,
    );

    return report.products.slice(0, limit);
  }
}
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PaymentMethod, Payment, PaymentStatus, Prisma } from '@prisma/client';
import { PaymentMethodRepository } from '../repositories/payment-method.repository';
import { PaymentRepository } from '../repositories/payment.repository';
import { IPaymentService } from '../contracts/payment-service.interface';
import { CreatePaymentMethodDto } from '../dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from '../dto/update-payment-method.dto';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { ProcessPaymentDto } from '../dto/process-payment.dto';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class PaymentService implements IPaymentService {
  constructor(
    private readonly paymentMethodRepository: PaymentMethodRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly prisma: PrismaService,
  ) {}

  // ============================================
  // PAYMENT METHODS
  // ============================================

  async createPaymentMethod(
    dto: CreatePaymentMethodDto,
  ): Promise<PaymentMethod> {
    return this.paymentMethodRepository.create(dto);
  }

  async findAllPaymentMethods(
    establishmentId: string,
  ): Promise<PaymentMethod[]> {
    return this.paymentMethodRepository.findByEstablishment(establishmentId);
  }

  async findActivePaymentMethods(
    establishmentId: string,
  ): Promise<PaymentMethod[]> {
    return this.paymentMethodRepository.findActiveByEstablishment(
      establishmentId,
    );
  }

  async findOnePaymentMethod(id: string): Promise<PaymentMethod> {
    const paymentMethod = await this.paymentMethodRepository.findById(id);
    if (!paymentMethod) {
      throw new NotFoundException('Forma de pagamento não encontrada');
    }
    return paymentMethod;
  }

  async updatePaymentMethod(
    id: string,
    dto: UpdatePaymentMethodDto,
  ): Promise<PaymentMethod> {
    await this.findOnePaymentMethod(id);
    return this.paymentMethodRepository.update(id, dto);
  }

  async togglePaymentMethod(id: string): Promise<PaymentMethod> {
    await this.findOnePaymentMethod(id);
    return this.paymentMethodRepository.toggleActive(id);
  }

  async removePaymentMethod(id: string): Promise<void> {
    await this.findOnePaymentMethod(id);

    // Verificar se há pagamentos com esta forma
    const payments = await this.paymentRepository.findByPaymentMethod(id);
    if (payments.length > 0) {
      throw new BadRequestException(
        'Não é possível excluir forma de pagamento com pagamentos vinculados',
      );
    }

    await this.paymentMethodRepository.delete(id);
  }

  // ============================================
  // PAYMENTS
  // ============================================

  async createPayment(dto: CreatePaymentDto): Promise<Payment> {
    // Verificar se forma de pagamento existe e está ativa
    const paymentMethod = await this.findOnePaymentMethod(dto.paymentMethodId);
    if (!paymentMethod.isActive) {
      throw new BadRequestException('Forma de pagamento não está ativa');
    }

    // Verificar se venda existe
    const sale = await this.prisma.sale.findUnique({
      where: { id: dto.saleId },
    });
    if (!sale) {
      throw new NotFoundException('Venda não encontrada');
    }

    // Calcular total já pago
    const existingPayments = await this.paymentRepository.findBySale(
      dto.saleId,
    );
    const totalPaid = existingPayments.reduce(
      (sum, payment) => sum.add(payment.amount),
      new Prisma.Decimal(0),
    );

    const newTotal = totalPaid.add(dto.amount);

    // Verificar se não ultrapassa o total da venda
    if (newTotal.greaterThan(sale.total)) {
      throw new BadRequestException(
        'Valor do pagamento ultrapassa o total da venda',
      );
    }

    // Criar pagamento
    const payment = await this.paymentRepository.create({
      ...dto,
      amount: new Prisma.Decimal(dto.amount),
      status: dto.status || PaymentStatus.PENDING,
    });

    // Atualizar status da venda
    await this.updateSalePaymentStatus(dto.saleId);

    return payment;
  }

  async processPayment(
    orderId: string,
    dto: ProcessPaymentDto,
  ): Promise<Payment[]> {
    // Buscar pedido
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { sale: true },
    });

    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }

    // Se já tem venda, usar essa venda
    let saleId = order.sale?.id;

    // Se não tem venda, criar uma
    if (!saleId) {
      const sale = await this.prisma.sale.create({
        data: {
          establishmentId: order.establishmentId,
          orderId: order.id,
          customerId: order.customerId,
          sellerId: order.waiterId || '', // TODO: pegar do contexto
          subtotal: order.subtotal,
          discount: order.discount,
          total: order.total,
          paymentStatus: PaymentStatus.PENDING,
        },
      });
      saleId = sale.id;
    }

    // Calcular total dos pagamentos
    const totalPayments = dto.payments.reduce(
      (sum, p) => sum + p.amount,
      0,
    );

    // Verificar se total dos pagamentos corresponde ao total do pedido
    const orderTotal = Number(order.total);
    if (Math.abs(totalPayments - orderTotal) > 0.01) {
      throw new BadRequestException(
        `Total dos pagamentos (${totalPayments}) não corresponde ao total do pedido (${orderTotal})`,
      );
    }

    // Criar todos os pagamentos
    const payments: Payment[] = [];
    for (const paymentItem of dto.payments) {
      const payment = await this.createPayment({
        saleId,
        paymentMethodId: paymentItem.paymentMethodId,
        amount: paymentItem.amount,
        status: PaymentStatus.PAID,
      });
      payments.push(payment);
    }

    return payments;
  }

  async findPaymentsBySale(saleId: string): Promise<Payment[]> {
    return this.paymentRepository.findBySale(saleId);
  }

  async findOnePayment(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findById(id);
    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }
    return payment;
  }

  async refundPayment(id: string, reason: string): Promise<Payment> {
    const payment = await this.findOnePayment(id);

    if (payment.status !== PaymentStatus.PAID) {
      throw new BadRequestException(
        'Apenas pagamentos confirmados podem ser estornados',
      );
    }

    // Atualizar status do pagamento
    const refundedPayment = await this.paymentRepository.updateStatus(
      id,
      PaymentStatus.REFUNDED,
    );

    // Atualizar status da venda
    await this.updateSalePaymentStatus(payment.saleId);

    // TODO: Integrar com gateway de pagamento para estorno real

    return refundedPayment;
  }

  private async updateSalePaymentStatus(saleId: string): Promise<void> {
    const sale = await this.prisma.sale.findUnique({
      where: { id: saleId },
    });

    if (!sale) return;

    const payments = await this.paymentRepository.findBySale(saleId);

    // Calcular total pago
    const totalPaid = payments
      .filter((p) => p.status === PaymentStatus.PAID)
      .reduce((sum, p) => sum.add(p.amount), new Prisma.Decimal(0));

    let paymentStatus: PaymentStatus;
    const saleTotal = sale.total;

    if (totalPaid.equals(0)) {
      paymentStatus = PaymentStatus.PENDING;
    } else if (totalPaid.lessThan(saleTotal)) {
      paymentStatus = PaymentStatus.PARTIAL;
    } else if (totalPaid.greaterThanOrEqualTo(saleTotal)) {
      paymentStatus = PaymentStatus.PAID;
    } else {
      paymentStatus = PaymentStatus.PENDING;
    }

    // Atualizar venda
    await this.prisma.sale.update({
      where: { id: saleId },
      data: {
        paid: totalPaid,
        change:
          totalPaid.greaterThan(saleTotal)
            ? totalPaid.sub(saleTotal)
            : new Prisma.Decimal(0),
        paymentStatus,
      },
    });
  }
}
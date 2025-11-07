import { PaymentMethod, Payment } from '@prisma/client';
import { CreatePaymentMethodDto } from '../dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from '../dto/update-payment-method.dto';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { ProcessPaymentDto } from '../dto/process-payment.dto';

export interface IPaymentService {
  // Payment Methods
  createPaymentMethod(dto: CreatePaymentMethodDto): Promise<PaymentMethod>;
  findAllPaymentMethods(establishmentId: string): Promise<PaymentMethod[]>;
  findActivePaymentMethods(establishmentId: string): Promise<PaymentMethod[]>;
  updatePaymentMethod(id: string, dto: UpdatePaymentMethodDto): Promise<PaymentMethod>;
  togglePaymentMethod(id: string): Promise<PaymentMethod>;
  removePaymentMethod(id: string): Promise<void>;

  // Payments
  createPayment(dto: CreatePaymentDto): Promise<Payment>;
  processPayment(orderId: string, dto: ProcessPaymentDto): Promise<Payment[]>;
  findPaymentsBySale(saleId: string): Promise<Payment[]>;
  refundPayment(id: string, reason: string): Promise<Payment>;
}
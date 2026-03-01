export interface Order {
  id: string;
  establishmentId: string;
  customerId?: string;
  orderNumber: number;
  type: OrderType;
  source: OrderSource;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  serviceFee: number;
  total: number;
  couponId?: string;
  deliveryAddress?: CustomerAddress;
  deliveryTime?: Date;
  notes?: string;
  externalId?: string;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
  customer?: Customer;
  coupon?: Coupon;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discount: number;
  total: number;
  modifiers?: OrderItemModifier[];
  notes?: string;
  product?: {
    id: string;
    name: string;
    primaryImage?: string;
  };
}

export interface OrderItemModifier {
  modifierId: string;
  modifierName: string;
  optionId: string;
  optionName: string;
  price: number;
}

export enum OrderType {
  DINE_IN = 'DINE_IN',
  TAKEOUT = 'TAKEOUT',
  DELIVERY = 'DELIVERY',
  CUSTOM = 'CUSTOM',
}

export enum OrderSource {
  POS = 'POS',
  ONLINE = 'ONLINE',
  MOBILE = 'MOBILE',
  IFOOD = 'IFOOD',
  RAPPI = 'RAPPI',
  WHATSAPP = 'WHATSAPP',
  PHONE = 'PHONE',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERING = 'DELIVERING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  cpf?: string;
  birthDate?: Date;
  loyaltyPoints: number;
  isActive: boolean;
  addresses?: CustomerAddress[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerAddress {
  id: string;
  customerId: string;
  label?: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  reference?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Coupon {
  id: string;
  establishmentId: string;
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
}

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: PaymentType;
  isActive: boolean;
  icon?: string;
}

export enum PaymentType {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PIX = 'PIX',
  VOUCHER = 'VOUCHER',
  TRANSFER = 'TRANSFER',
}

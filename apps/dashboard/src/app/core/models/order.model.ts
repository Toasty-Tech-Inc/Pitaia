export interface Order {
  id: string;
  establishmentId: string;
  customerId?: string;
  waiterId?: string;
  tableId?: string;
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
  deliveryAddress?: any;
  deliveryTime?: Date;
  deliveryPersonId?: string;
  notes?: string;
  kitchenNotes?: string;
  externalId?: string;
  externalSource?: string;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItem[];
  customer?: any;
  waiter?: any;
  table?: any;
  coupon?: any;
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
  modifiers?: any;
  notes?: string;
  product?: any;
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


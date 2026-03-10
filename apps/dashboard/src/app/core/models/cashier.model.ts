export interface Cashier {
  id: string;
  establishmentId: string;
  userId: string;
  openingAmount: number;
  closingAmount?: number;
  expectedAmount?: number;
  difference?: number;
  status: CashierStatus;
  openedAt: Date;
  closedAt?: Date;
  notes?: string;
  movements?: CashMovement[];
  user?: {
    id: string;
    name: string;
  };
}

export interface CashMovement {
  id: string;
  cashierId: string;
  type: MovementType;
  amount: number;
  description?: string;
  paymentMethod?: string;
  referenceId?: string;
  referenceType?: string;
  createdAt: Date;
}

export enum CashierStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export enum MovementType {
  OPENING = 'OPENING',
  SALE = 'SALE',
  REFUND = 'REFUND',
  WITHDRAWAL = 'WITHDRAWAL',
  DEPOSIT = 'DEPOSIT',
  CLOSING = 'CLOSING',
}

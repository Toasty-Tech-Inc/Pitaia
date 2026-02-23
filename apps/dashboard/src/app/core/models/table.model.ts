export interface Table {
  id: string;
  establishmentId: string;
  number: string;
  capacity: number;
  location?: string;
  status: TableStatus;
  isActive: boolean;
  qrCode?: string;
  createdAt: Date;
  updatedAt: Date;
  establishment?: any;
  orders?: any[];
}

export enum TableStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  RESERVED = 'RESERVED',
  CLEANING = 'CLEANING',
}


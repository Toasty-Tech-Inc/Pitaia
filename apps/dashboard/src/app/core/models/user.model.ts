import { Establishment } from './establishment.model';

export interface UserEstablishment {
  id: string;
  establishmentId: string;
  userId: string;
  role: UserRole;
  createdAt: Date;
  establishment: Establishment;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  avatar?: string;
  phone?: string;
  cpf?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  establishments?: UserEstablishment[];
}

export enum UserRole {
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  CASHIER = 'CASHIER',
  WAITER = 'WAITER',
  KITCHEN = 'KITCHEN',
  DELIVERY = 'DELIVERY',
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  user: User;
}


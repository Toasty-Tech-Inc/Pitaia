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


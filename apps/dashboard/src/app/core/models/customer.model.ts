export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  cpf?: string;
  birthDate?: Date;
  address?: CustomerAddress;
  loyaltyPoints: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  addresses?: CustomerAddress[];
  orders?: any[];
  sales?: any[];
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


export interface Establishment {
  id: string;
  ownerId?: string;
  name: string;
  tradeName?: string;
  slug?: string;
  description?: string;
  cnpj?: string;
  logo?: string;
  coverImage?: string;
  phone?: string;
  email?: string;
  document?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  address?: EstablishmentAddress;
  businessHours?: BusinessHours[];
  settings?: EstablishmentSettings;
  isActive: boolean;
  isOpen?: boolean;
  timezone?: string;
  currency?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EstablishmentAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
}

export interface BusinessHours {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

export interface EstablishmentSettings {
  acceptDelivery: boolean;
  acceptDineIn: boolean;
  acceptTakeout: boolean;
  deliveryRadius?: number;
  minOrderValue?: number;
  deliveryFee?: number;
  serviceCharge?: number;
  currency: string;
  timezone: string;
}

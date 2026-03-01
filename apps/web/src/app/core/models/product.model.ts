export interface Product {
  id: string;
  establishmentId: string;
  categoryId?: string;
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  price: number;
  cost?: number;
  trackInventory: boolean;
  currentStock?: number;
  minStock?: number;
  maxStock?: number;
  unit?: string;
  images: string[];
  primaryImage?: string;
  isActive: boolean;
  isAvailable: boolean;
  isFeatured: boolean;
  preparationTime?: number;
  aiGenerated: boolean;
  aiConfidence?: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  category?: Category;
  modifiers?: ProductModifier[];
}

export interface Category {
  id: string;
  establishmentId: string;
  name: string;
  description?: string;
  image?: string;
  sortOrder: number;
  isActive: boolean;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  products?: Product[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductModifier {
  id: string;
  productId: string;
  name: string;
  description?: string;
  minSelections: number;
  maxSelections: number;
  isRequired: boolean;
  options: ModifierOption[];
}

export interface ModifierOption {
  id: string;
  modifierId: string;
  name: string;
  price: number;
  isDefault: boolean;
}

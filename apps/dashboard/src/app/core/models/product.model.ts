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
  establishment?: any;
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
  createdAt: Date;
  updatedAt: Date;
}


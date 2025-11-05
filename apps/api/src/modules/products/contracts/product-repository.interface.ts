import { Product } from '@prisma/client';
import { IBaseRepository } from '../../../common/contracts/base-repository.interface';

export interface IProductRepository extends IBaseRepository<Product> {
  findBySku(sku: string): Promise<Product | null>;
  findByBarcode(barcode: string): Promise<Product | null>;
  findByEstablishment(establishmentId: string): Promise<Product[]>;
  findByCategory(categoryId: string): Promise<Product[]>;
  findLowStock(establishmentId: string): Promise<Product[]>;
  updateStock(id: string, quantity: number): Promise<Product>;
  toggleAvailability(id: string): Promise<Product>;
  findFeatured(establishmentId: string): Promise<Product[]>;
}
import { Product } from '@prisma/client';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { FilterProductDto } from '../dto/filter-product.dto';
import { UpdateStockDto } from '../dto/update-stock.dto';
import { IPaginatedResult } from '../../../common/contracts/base-repository.interface';

export interface IProductService {
  create(createProductDto: CreateProductDto): Promise<Product>;
  findAll(filters: FilterProductDto): Promise<IPaginatedResult<Product>>;
  findOne(id: string): Promise<Product>;
  update(id: string, updateProductDto: UpdateProductDto): Promise<Product>;
  remove(id: string): Promise<void>;
  updateStock(id: string, updateStockDto: UpdateStockDto): Promise<Product>;
  toggleAvailability(id: string): Promise<Product>;
  getLowStock(establishmentId: string): Promise<Product[]>;
}
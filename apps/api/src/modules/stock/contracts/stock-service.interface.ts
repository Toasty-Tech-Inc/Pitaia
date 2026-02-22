import { StockMovement, Product } from '@prisma/client';
import { CreateStockMovementDto } from '../dto/create-stock-movement.dto';
import { FilterStockMovementDto } from '../dto/filter-stock-movement.dto';
import { AdjustStockDto } from '../dto/adjust-stock.dto';
import { IPaginatedResult } from '../../../common/contracts/base-repository.interface';

export interface IStockService {
  createMovement(dto: CreateStockMovementDto): Promise<StockMovement>;
  findAll(filters: FilterStockMovementDto): Promise<IPaginatedResult<StockMovement>>;
  findOne(id: string): Promise<StockMovement>;
  findByProduct(productId: string): Promise<StockMovement[]>;
  adjustStock(productId: string, dto: AdjustStockDto): Promise<Product>;
  getStockReport(establishmentId: string): Promise<any>;
}

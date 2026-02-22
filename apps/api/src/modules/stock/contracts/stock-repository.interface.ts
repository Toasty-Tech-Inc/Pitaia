import { StockMovement, StockMovementType } from '@prisma/client';
import { IBaseRepository } from '../../../common/contracts/base-repository.interface';

export interface IStockMovementRepository extends IBaseRepository<StockMovement> {
  findByProduct(productId: string): Promise<StockMovement[]>;
  findByProductAndDateRange(
    productId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<StockMovement[]>;
  findByType(productId: string, type: StockMovementType): Promise<StockMovement[]>;
  getMovementsByEstablishment(establishmentId: string): Promise<StockMovement[]>;
}

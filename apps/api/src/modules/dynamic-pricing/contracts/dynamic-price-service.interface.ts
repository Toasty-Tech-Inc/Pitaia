import { DynamicPrice } from '@prisma/client';
import { CreateDynamicPriceDto } from '../dto/create-dynamic-price.dto';
import { UpdateDynamicPriceDto } from '../dto/update-dynamic-price.dto';
import { FilterDynamicPriceDto } from '../dto/filter-dynamic-price.dto';
import { IPaginatedResult } from '../../../common/contracts/base-repository.interface';

export interface IDynamicPriceService {
  create(dto: CreateDynamicPriceDto): Promise<DynamicPrice>;
  findAll(filters: FilterDynamicPriceDto): Promise<IPaginatedResult<DynamicPrice>>;
  findOne(id: string): Promise<DynamicPrice>;
  findByProduct(productId: string): Promise<DynamicPrice[]>;
  update(id: string, dto: UpdateDynamicPriceDto): Promise<DynamicPrice>;
  remove(id: string): Promise<void>;
  getCurrentPrice(productId: string): Promise<number>;
  toggleActive(id: string): Promise<DynamicPrice>;
}

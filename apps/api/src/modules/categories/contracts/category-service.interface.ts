import { Category } from '@prisma/client';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { FilterCategoryDto } from '../dto/filter-category.dto';
import { IPaginatedResult } from '../../../common/contracts/base-repository.interface';

export interface ICategoryService {
  create(createCategoryDto: CreateCategoryDto): Promise<Category>;
  findAll(filters: FilterCategoryDto): Promise<IPaginatedResult<Category>>;
  findOne(id: string): Promise<Category>;
  update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category>;
  remove(id: string): Promise<void>;
  findByEstablishment(establishmentId: string): Promise<Category[]>;
  findRootCategories(establishmentId: string): Promise<Category[]>;
  toggleActive(id: string): Promise<Category>;
  updateSortOrder(id: string, sortOrder: number): Promise<Category>;
}


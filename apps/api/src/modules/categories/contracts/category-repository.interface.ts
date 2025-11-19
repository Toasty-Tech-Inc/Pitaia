import { Category } from '@prisma/client';
import { IBaseRepository } from '../../../common/contracts/base-repository.interface';

export interface ICategoryRepository extends IBaseRepository<Category> {
  findByEstablishment(establishmentId: string): Promise<Category[]>;
  findByParent(parentId: string): Promise<Category[]>;
  findRootCategories(establishmentId: string): Promise<Category[]>;
  findWithChildren(id: string): Promise<Category | null>;
  updateSortOrder(id: string, sortOrder: number): Promise<Category>;
  toggleActive(id: string): Promise<Category>;
}


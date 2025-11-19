import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Category } from '@prisma/client';
import { CategoryRepository } from '../repositories/category.repository';
import { ICategoryService } from '../contracts/category-service.interface';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { FilterCategoryDto } from '../dto/filter-category.dto';
import { IPaginatedResult } from '../../../common/contracts/base-repository.interface';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class CategoryService implements ICategoryService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Verificar se parentId existe e pertence ao mesmo estabelecimento
    if (createCategoryDto.parentId) {
      const parent = await this.categoryRepository.findById(
        createCategoryDto.parentId,
      );

      if (!parent) {
        throw new NotFoundException('Categoria pai não encontrada');
      }

      if (parent.establishmentId !== createCategoryDto.establishmentId) {
        throw new BadRequestException(
          'Categoria pai deve pertencer ao mesmo estabelecimento',
        );
      }

      // Verificar se não está criando um loop (categoria pai sendo filha de si mesma)
      if (parent.id === createCategoryDto.parentId) {
        throw new BadRequestException(
          'Uma categoria não pode ser pai de si mesma',
        );
      }
    }

    return this.categoryRepository.create(createCategoryDto);
  }

  async findAll(filters: FilterCategoryDto): Promise<IPaginatedResult<Category>> {
    const {
      search,
      establishmentId,
      parentId,
      isActive,
      rootOnly,
      ...pagination
    } = filters;

    const where: any = {};

    if (establishmentId) {
      where.establishmentId = establishmentId;
    }

    if (rootOnly) {
      where.parentId = null;
    } else if (parentId !== undefined) {
      if (parentId === null) {
        where.parentId = null;
      } else {
        where.parentId = parentId;
      }
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const result = await this.categoryRepository.paginate({
      ...pagination,
      ...where,
    });

    return result;
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findWithChildren(id);
    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);

    // Verificar se parentId está sendo alterado
    if (
      updateCategoryDto.parentId !== undefined &&
      updateCategoryDto.parentId !== category.parentId
    ) {
      // Se está definindo um parentId
      if (updateCategoryDto.parentId) {
        const parent = await this.categoryRepository.findById(
          updateCategoryDto.parentId,
        );

        if (!parent) {
          throw new NotFoundException('Categoria pai não encontrada');
        }

        if (parent.establishmentId !== category.establishmentId) {
          throw new BadRequestException(
            'Categoria pai deve pertencer ao mesmo estabelecimento',
          );
        }

        // Verificar se não está criando um loop
        if (parent.id === id) {
          throw new BadRequestException(
            'Uma categoria não pode ser pai de si mesma',
          );
        }

        // Verificar se a categoria pai não é filha da categoria atual (evitar loop)
        const checkLoop = await this.checkCategoryLoop(
          id,
          updateCategoryDto.parentId,
        );
        if (checkLoop) {
          throw new BadRequestException(
            'Não é possível criar uma hierarquia circular',
          );
        }
      }
    }

    return this.categoryRepository.update(id, updateCategoryDto);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);

    // Verificar se tem produtos associados
    const productsCount = await this.prisma.product.count({
      where: { categoryId: id },
    });

    if (productsCount > 0) {
      throw new ConflictException(
        `Não é possível deletar a categoria. Existem ${productsCount} produto(s) associado(s).`,
      );
    }

    // Verificar se tem subcategorias
    const childrenCount = await this.prisma.category.count({
      where: { parentId: id },
    });

    if (childrenCount > 0) {
      throw new ConflictException(
        `Não é possível deletar a categoria. Existem ${childrenCount} subcategoria(s) associada(s).`,
      );
    }

    await this.categoryRepository.delete(id);
  }

  async findByEstablishment(establishmentId: string): Promise<Category[]> {
    return this.categoryRepository.findByEstablishment(establishmentId);
  }

  async findRootCategories(establishmentId: string): Promise<Category[]> {
    return this.categoryRepository.findRootCategories(establishmentId);
  }

  async toggleActive(id: string): Promise<Category> {
    await this.findOne(id);
    return this.categoryRepository.toggleActive(id);
  }

  async updateSortOrder(id: string, sortOrder: number): Promise<Category> {
    await this.findOne(id);
    return this.categoryRepository.updateSortOrder(id, sortOrder);
  }

  /**
   * Verifica se existe um loop na hierarquia de categorias
   */
  private async checkCategoryLoop(
    categoryId: string,
    newParentId: string,
  ): Promise<boolean> {
    let currentParentId = newParentId;
    const visited = new Set<string>();

    while (currentParentId) {
      if (visited.has(currentParentId)) {
        return true; // Loop detectado
      }

      if (currentParentId === categoryId) {
        return true; // A categoria seria pai de si mesma indiretamente
      }

      visited.add(currentParentId);

      const parent = await this.categoryRepository.findById(currentParentId);
      if (!parent || !parent.parentId) {
        break;
      }

      currentParentId = parent.parentId;
    }

    return false;
  }
}


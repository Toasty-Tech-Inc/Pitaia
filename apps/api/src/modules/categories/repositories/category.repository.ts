import { Injectable } from '@nestjs/common';
import { Category } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { ICategoryRepository } from '../contracts/category-repository.interface';

@Injectable()
export class CategoryRepository
  extends BaseRepository<Category>
  implements ICategoryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma, 'category');
  }

  async findByEstablishment(establishmentId: string): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: { establishmentId },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            sortOrder: true,
            isActive: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async findByParent(parentId: string): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: { parentId },
      include: {
        children: {
          select: {
            id: true,
            name: true,
            sortOrder: true,
            isActive: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findRootCategories(establishmentId: string): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: {
        establishmentId,
        parentId: null,
      },
      include: {
        children: {
          select: {
            id: true,
            name: true,
            sortOrder: true,
            isActive: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findWithChildren(id: string): Promise<Category | null> {
    return this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            sortOrder: true,
          },
        },
        children: {
          include: {
            children: {
              select: {
                id: true,
                name: true,
                sortOrder: true,
                isActive: true,
              },
              orderBy: { sortOrder: 'asc' },
            },
            _count: {
              select: {
                products: true,
              },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
        establishment: {
          select: {
            id: true,
            name: true,
            tradeName: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
  }

  async updateSortOrder(id: string, sortOrder: number): Promise<Category> {
    return this.prisma.category.update({
      where: { id },
      data: { sortOrder },
    });
  }

  async toggleActive(id: string): Promise<Category> {
    const category = await this.findById(id);
    return this.prisma.category.update({
      where: { id },
      data: { isActive: !category?.isActive },
    });
  }

  // Override findById to include relations
  async findById(id: string): Promise<Category | null> {
    return this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            sortOrder: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            sortOrder: true,
            isActive: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
        establishment: {
          select: {
            id: true,
            name: true,
            tradeName: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
  }

  // Override findAll to include relations
  async findAll(params?: any): Promise<Category[]> {
    return this.prisma.category.findMany({
      ...params,
      include: {
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            sortOrder: true,
            isActive: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }
}


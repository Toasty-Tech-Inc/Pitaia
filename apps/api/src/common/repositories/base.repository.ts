import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { IBaseRepository, IPaginationParams, IPaginatedResult } from '../contracts/base-repository.interface';

@Injectable()
export abstract class BaseRepository<T> implements IBaseRepository<T> {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly modelName: string,
  ) {}

  protected get model() {
    return this.prisma[this.modelName];
  }

  async findAll(params?: any): Promise<T[]> {
    return this.model.findMany(params);
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findUnique({ where: { id } });
  }

  async create(data: Partial<T>): Promise<T> {
    return this.model.create({ data });
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    return this.model.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.model.delete({ where: { id } });
  }

  async count(params?: any): Promise<number> {
    return this.model.count(params);
  }

  async paginate(params: IPaginationParams & any): Promise<IPaginatedResult<T>> {
    const { page = 1, limit = 10, orderBy, order = 'desc', ...filters } = params;

    const skip = (page - 1) * limit;
    const take = limit;

    const [data, total] = await Promise.all([
      this.model.findMany({
        skip,
        take,
        where: filters,
        orderBy: orderBy ? { [orderBy]: order } : undefined,
      }),
      this.model.count({ where: filters }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
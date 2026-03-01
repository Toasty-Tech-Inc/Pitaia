import { Injectable } from '@nestjs/common';
import { Establishment } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { IEstablishmentRepository } from '../contracts/establishment-repository.interface';

@Injectable()
export class EstablishmentRepository
  extends BaseRepository<Establishment>
  implements IEstablishmentRepository
{
  constructor(prisma: PrismaService) {
    super(prisma, 'establishment');
  }

  async findByCnpj(cnpj: string): Promise<Establishment | null> {
    return this.prisma.establishment.findUnique({
      where: { cnpj },
    });
  }

  async findBySlug(slug: string): Promise<Establishment | null> {
    return this.prisma.establishment.findUnique({
      where: { slug },
      include: {
        categories: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        products: {
          where: { isActive: true, isAvailable: true },
          include: {
            category: true,
          },
        },
        paymentMethods: {
          where: { isActive: true },
        },
      },
    });
  }

  async findByUserId(userId: string): Promise<Establishment[]> {
    return this.prisma.establishment.findMany({
      where: {
        users: {
          some: {
            userId,
          },
        },
      },
      include: {
        users: {
          where: { userId },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });
  }

  async findWithUsers(id: string): Promise<Establishment | null> {
    return this.prisma.establishment.findUnique({
      where: { id },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
  }

  async activateEstablishment(id: string): Promise<Establishment> {
    return this.prisma.establishment.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async deactivateEstablishment(id: string): Promise<Establishment> {
    return this.prisma.establishment.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
import { Injectable } from '@nestjs/common';
import { Table } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { ITableRepository } from '../contracts/table-repository.interface';

@Injectable()
export class TableRepository
  extends BaseRepository<Table>
  implements ITableRepository
{
  constructor(prisma: PrismaService) {
    super(prisma, 'table');
  }

  async findByEstablishment(establishmentId: string): Promise<Table[]> {
    return this.prisma.table.findMany({
      where: { establishmentId },
      orderBy: [{ number: 'asc' }],
    });
  }

  async findByNumber(
    establishmentId: string,
    number: string,
  ): Promise<Table | null> {
    return this.prisma.table.findUnique({
      where: {
        establishmentId_number: {
          establishmentId,
          number,
        },
      },
    });
  }

  async findByQrCode(qrCode: string): Promise<Table | null> {
    return this.prisma.table.findUnique({
      where: { qrCode },
      include: {
        establishment: {
          select: {
            id: true,
            name: true,
            tradeName: true,
          },
        },
      },
    });
  }

  async findByStatus(
    establishmentId: string,
    status: string,
  ): Promise<Table[]> {
    return this.prisma.table.findMany({
      where: {
        establishmentId,
        status: status as any,
      },
      orderBy: [{ number: 'asc' }],
    });
  }

  async updateStatus(id: string, status: string): Promise<Table> {
    return this.prisma.table.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async toggleActive(id: string): Promise<Table> {
    const table = await this.findById(id);
    return this.prisma.table.update({
      where: { id },
      data: { isActive: !table?.isActive },
    });
  }

  // Override findById to include relations
  async findById(id: string): Promise<Table | null> {
    return this.prisma.table.findUnique({
      where: { id },
      include: {
        establishment: {
          select: {
            id: true,
            name: true,
            tradeName: true,
          },
        },
      },
    });
  }

  // Override findAll to include relations
  async findAll(params?: any): Promise<Table[]> {
    return this.prisma.table.findMany({
      ...params,
      include: {
        establishment: {
          select: {
            id: true,
            name: true,
            tradeName: true,
          },
        },
      },
    });
  }
}


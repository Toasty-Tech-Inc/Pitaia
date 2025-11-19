import { Table } from '@prisma/client';
import { IBaseRepository } from '../../../common/contracts/base-repository.interface';

export interface ITableRepository extends IBaseRepository<Table> {
  findByEstablishment(establishmentId: string): Promise<Table[]>;
  findByNumber(establishmentId: string, number: string): Promise<Table | null>;
  findByQrCode(qrCode: string): Promise<Table | null>;
  findByStatus(establishmentId: string, status: string): Promise<Table[]>;
  updateStatus(id: string, status: string): Promise<Table>;
  toggleActive(id: string): Promise<Table>;
}


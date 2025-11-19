import { Table } from '@prisma/client';
import { CreateTableDto } from '../dto/create-table.dto';
import { UpdateTableDto } from '../dto/update-table.dto';
import { FilterTableDto } from '../dto/filter-table.dto';
import { IPaginatedResult } from '../../../common/contracts/base-repository.interface';

export interface ITableService {
  create(createTableDto: CreateTableDto): Promise<Table>;
  findAll(filters: FilterTableDto): Promise<IPaginatedResult<Table>>;
  findOne(id: string): Promise<Table>;
  update(id: string, updateTableDto: UpdateTableDto): Promise<Table>;
  remove(id: string): Promise<void>;
  updateStatus(id: string, status: string): Promise<Table>;
  toggleActive(id: string): Promise<Table>;
  findByEstablishment(establishmentId: string): Promise<Table[]>;
  findByQrCode(qrCode: string): Promise<Table>;
}


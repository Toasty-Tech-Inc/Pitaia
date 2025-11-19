import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Table, TableStatus } from '@prisma/client';
import { TableRepository } from '../repositories/table.repository';
import { ITableService } from '../contracts/table-service.interface';
import { CreateTableDto } from '../dto/create-table.dto';
import { UpdateTableDto } from '../dto/update-table.dto';
import { FilterTableDto } from '../dto/filter-table.dto';
import { IPaginatedResult } from '../../../common/contracts/base-repository.interface';

@Injectable()
export class TableService implements ITableService {
  constructor(private readonly tableRepository: TableRepository) {}

  async create(createTableDto: CreateTableDto): Promise<Table> {
    // Verificar se já existe uma mesa com o mesmo número no estabelecimento
    const existingTable = await this.tableRepository.findByNumber(
      createTableDto.establishmentId,
      createTableDto.number,
    );

    if (existingTable) {
      throw new ConflictException(
        'Já existe uma mesa com este número neste estabelecimento',
      );
    }

    // Verificar se QR Code já existe (se fornecido)
    if (createTableDto.qrCode) {
      const existingQrCode = await this.tableRepository.findByQrCode(
        createTableDto.qrCode,
      );
      if (existingQrCode) {
        throw new ConflictException('QR Code já está em uso');
      }
    }

    return this.tableRepository.create(createTableDto);
  }

  async findAll(filters: FilterTableDto): Promise<IPaginatedResult<Table>> {
    const {
      search,
      establishmentId,
      status,
      location,
      isActive,
      ...pagination
    } = filters;

    const where: any = {};

    if (establishmentId) {
      where.establishmentId = establishmentId;
    }

    if (status) {
      where.status = status;
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { number: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    const result = await this.tableRepository.paginate({
      ...pagination,
      ...where,
    });

    return result;
  }

  async findOne(id: string): Promise<Table> {
    const table = await this.tableRepository.findById(id);
    if (!table) {
      throw new NotFoundException('Mesa não encontrada');
    }
    return table;
  }

  async update(id: string, updateTableDto: UpdateTableDto): Promise<Table> {
    const table = await this.findOne(id);

    // Verificar se número está sendo alterado e se já existe
    if (updateTableDto.number && updateTableDto.number !== table.number) {
      const existingTable = await this.tableRepository.findByNumber(
        table.establishmentId,
        updateTableDto.number,
      );
      if (existingTable) {
        throw new ConflictException(
          'Já existe uma mesa com este número neste estabelecimento',
        );
      }
    }

    // Verificar se QR Code está sendo alterado e se já existe
    if (updateTableDto.qrCode && updateTableDto.qrCode !== table.qrCode) {
      const existingQrCode = await this.tableRepository.findByQrCode(
        updateTableDto.qrCode,
      );
      if (existingQrCode && existingQrCode.id !== id) {
        throw new ConflictException('QR Code já está em uso');
      }
    }

    return this.tableRepository.update(id, updateTableDto);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.tableRepository.delete(id);
  }

  async updateStatus(id: string, status: string): Promise<Table> {
    await this.findOne(id);

    // Validar status
    if (!Object.values(TableStatus).includes(status as TableStatus)) {
      throw new BadRequestException('Status inválido');
    }

    return this.tableRepository.updateStatus(id, status);
  }

  async toggleActive(id: string): Promise<Table> {
    await this.findOne(id);
    return this.tableRepository.toggleActive(id);
  }

  async findByEstablishment(establishmentId: string): Promise<Table[]> {
    return this.tableRepository.findByEstablishment(establishmentId);
  }

  async findByQrCode(qrCode: string): Promise<Table> {
    const table = await this.tableRepository.findByQrCode(qrCode);
    if (!table) {
      throw new NotFoundException('Mesa não encontrada');
    }
    return table;
  }
}


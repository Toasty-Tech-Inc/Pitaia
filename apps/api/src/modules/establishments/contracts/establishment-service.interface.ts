import { Establishment } from '@prisma/client';
import { CreateEstablishmentDto } from '../dto/create-establishment.dto';
import { UpdateEstablishmentDto } from '../dto/update-establishment.dto';
import { FilterEstablishmentDto } from '../dto/filter-establishment.dto';
import { IPaginatedResult } from '../../../common/contracts/base-repository.interface';

export interface IEstablishmentService {
  create(createEstablishmentDto: CreateEstablishmentDto, userId: string): Promise<Establishment>;
  findAll(filters: FilterEstablishmentDto): Promise<IPaginatedResult<Establishment>>;
  findOne(id: string): Promise<Establishment>;
  findBySlug(slug: string): Promise<Establishment>;
  update(id: string, updateEstablishmentDto: UpdateEstablishmentDto): Promise<Establishment>;
  remove(id: string): Promise<void>;
  addUser(establishmentId: string, userId: string, role: string): Promise<void>;
  removeUser(establishmentId: string, userId: string): Promise<void>;
}
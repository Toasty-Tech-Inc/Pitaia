import { Establishment } from '@prisma/client';
import { IBaseRepository } from '../../../common/contracts/base-repository.interface';

export interface IEstablishmentRepository extends IBaseRepository<Establishment> {
  findByCnpj(cnpj: string): Promise<Establishment | null>;
  findByUserId(userId: string): Promise<Establishment[]>;
  findWithUsers(id: string): Promise<Establishment | null>;
  activateEstablishment(id: string): Promise<Establishment>;
  deactivateEstablishment(id: string): Promise<Establishment>;
}
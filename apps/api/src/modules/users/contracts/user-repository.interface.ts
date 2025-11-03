import { User } from '@prisma/client';
import { IBaseRepository } from '../../../common/contracts/base-repository.interface';

export interface IUserRepository extends IBaseRepository<User> {
  findByEmail(email: string): Promise<User | null>;
  findByCpf(cpf: string): Promise<User | null>;
  findByEstablishment(establishmentId: string): Promise<User[]>;
  updateLastLogin(id: string): Promise<User>;
  activateUser(id: string): Promise<User>;
  deactivateUser(id: string): Promise<User>;
}
import { User } from '@prisma/client';
import { FilterUserDto } from './../dto/filter-user.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { IPaginatedResult } from '../../../common/contracts/base-repository.interface';

export interface IUserService {
  create(createUserDto: CreateUserDto): Promise<User>;
  findAll(filters: FilterUserDto): Promise<IPaginatedResult<User>>;
  findOne(id: string): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
  remove(id: string): Promise<void>;
  activate(id: string): Promise<User>;
  deactivate(id: string): Promise<User>;
}
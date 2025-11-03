import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import * as argon2 from 'argon2';
import { UserRepository } from '../repositories/user.repository';
import { IUserService } from '../contracts/user-service.interface';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { FilterUserDto } from '../dto/filter-user.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { IPaginatedResult } from '../../../common/contracts/base-repository.interface';

@Injectable()
export class UserService implements IUserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Verificar se email já existe
    const existingUser = await this.userRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email já cadastrado');
    }

    // Verificar CPF se fornecido
    if (createUserDto.cpf) {
      const existingCpf = await this.userRepository.findByCpf(createUserDto.cpf);
      if (existingCpf) {
        throw new ConflictException('CPF já cadastrado');
      }
    }    

    // Hash da senha
    const hashedPassword = await argon2.hash(createUserDto.password);

    // Criar usuário
    const user = await this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // Remover senha do retorno
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  async findAll(filters: FilterUserDto): Promise<IPaginatedResult<User>> {
    const { search, role, isActive, ...pagination } = filters;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { cpf: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    return this.userRepository.paginate({
      ...pagination,
      ...where,
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Verificar CPF se alterado
    if (updateUserDto.cpf && updateUserDto.cpf !== user.cpf) {
      const existingCpf = await this.userRepository.findByCpf(updateUserDto.cpf);
      if (existingCpf) {
        throw new ConflictException('CPF já cadastrado');
      }
    }

  
    const updatedUser = await this.userRepository.update(id, updateUserDto);
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword as User;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.userRepository.delete(id);
  }

  async activate(id: string): Promise<User> {
    await this.findOne(id);
    return this.userRepository.activateUser(id);
  }

  async deactivate(id: string): Promise<User> {
    await this.findOne(id);
    return this.userRepository.deactivateUser(id);
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verificar senha atual
    const isPasswordValid = await argon2.verify(
      user.password,
      changePasswordDto.currentPassword,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Senha atual incorreta');
    }

    // Hash da nova senha
    const hashedPassword = await argon2.hash(changePasswordDto.newPassword);

    // Atualizar senha
    await this.userRepository.update(id, { password: hashedPassword });
  }
}
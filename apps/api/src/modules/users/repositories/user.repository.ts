import { Injectable } from '@nestjs/common';
import { User, Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { IUserRepository } from '../contracts/user-repository.interface';

@Injectable()
export class UserRepository extends BaseRepository<User> implements IUserRepository {
  constructor(prisma: PrismaService) {
    super(prisma, 'user');
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        establishments: {
          include: {
            establishment: true,
          },
        },
      },
    });
  }


  async findByCpf(cpf: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { cpf },
    });
  }

  async findByEstablishment(establishmentId: string): Promise<User[]> {
    return this.prisma.user.findMany({
      where: {
        establishments: {
          some: {
            establishmentId,
          },
        },
      },
      include: {
        establishments: {
          where: {
            establishmentId,
          },
        },
      },
    });
  }

  async updateLastLogin(id: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { lastLogin: new Date() },
    });
  }

  async activateUser(id: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async deactivateUser(id: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async findAll(params?: any): Promise<User[]> {
    const users = await super.findAll(params);
    return users.map(user => this.excludePassword(user));
  }

  async findById(id: string): Promise<User | null> {
    const user = await super.findById(id);
    return user ? this.excludePassword(user) : null;
  }

  private excludePassword(user: User): User {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }
}
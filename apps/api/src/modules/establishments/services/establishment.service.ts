import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Establishment, UserRole } from '@prisma/client';
import { EstablishmentRepository } from '../repositories/establishment.repository';
import { IEstablishmentService } from '../contracts/establishment-service.interface';
import { CreateEstablishmentDto } from '../dto/create-establishment.dto';
import { UpdateEstablishmentDto } from '../dto/update-establishment.dto';
import { FilterEstablishmentDto } from '../dto/filter-establishment.dto';
import { IPaginatedResult } from '../../../common/contracts/base-repository.interface';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class EstablishmentService implements IEstablishmentService {
  constructor(
    private readonly establishmentRepository: EstablishmentRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(
    createEstablishmentDto: CreateEstablishmentDto,
    userId: string,
  ): Promise<Establishment> {
    // Verificar se slug já existe
    const existingSlug = await this.establishmentRepository.findBySlug(
      createEstablishmentDto.slug,
    );
    if (existingSlug) {
      throw new ConflictException('Slug já está em uso');
    }

    // Verificar se CNPJ já existe
    if (createEstablishmentDto.cnpj) {
      const existingCnpj = await this.establishmentRepository.findByCnpj(
        createEstablishmentDto.cnpj,
      );
      if (existingCnpj) {
        throw new ConflictException('CNPJ já cadastrado');
      }
    }

    // Criar estabelecimento e associar usuário como OWNER
    const establishment = await this.prisma.establishment.create({
      data: {
        ...createEstablishmentDto,
        users: {
          create: {
            userId,
            role: UserRole.OWNER,
          },
        },
      },
      include: {
        users: {
          include: {
            user: true,
          },
        },
      },
    });

    return establishment;
  }

  async findAll(
    filters: FilterEstablishmentDto,
  ): Promise<IPaginatedResult<Establishment>> {
    const { search, city, state, isActive, ...pagination } = filters;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { tradeName: { contains: search, mode: 'insensitive' } },
        { cnpj: { contains: search } },
      ];
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (state) {
      where.state = state;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    return this.establishmentRepository.paginate({
      ...pagination,
      ...where,
    });
  }

  async findOne(id: string): Promise<Establishment> {
    const establishment = await this.establishmentRepository.findWithUsers(id);
    if (!establishment) {
      throw new NotFoundException('Estabelecimento não encontrado');
    }
    return establishment;
  }

  async findBySlug(slug: string): Promise<Establishment> {
    const establishment = await this.establishmentRepository.findBySlug(slug);
    if (!establishment) {
      throw new NotFoundException('Estabelecimento não encontrado');
    }
    return establishment;
  }

  async findByUser(userId: string): Promise<Establishment[]> {
    return this.establishmentRepository.findByUserId(userId);
  }

  async update(
    id: string,
    updateEstablishmentDto: UpdateEstablishmentDto,
  ): Promise<Establishment> {
    const establishment = await this.findOne(id);
    const currentSlug = (establishment as Establishment & { slug: string }).slug;

    // Verificar slug se alterado
    if (updateEstablishmentDto.slug && updateEstablishmentDto.slug !== currentSlug) {
      const existingSlug = await this.establishmentRepository.findBySlug(
        updateEstablishmentDto.slug,
      );
      if (existingSlug) {
        throw new ConflictException('Slug já está em uso');
      }
    }

    // Verificar CNPJ se alterado
    if (
      updateEstablishmentDto.cnpj &&
      updateEstablishmentDto.cnpj !== establishment.cnpj
    ) {
      const existingCnpj = await this.establishmentRepository.findByCnpj(
        updateEstablishmentDto.cnpj,
      );
      if (existingCnpj) {
        throw new ConflictException('CNPJ já cadastrado');
      }
    }

    return this.establishmentRepository.update(id, updateEstablishmentDto);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.establishmentRepository.delete(id);
  }

  async addUser(
    establishmentId: string,
    userId: string,
    role: UserRole,
  ): Promise<void> {
    await this.findOne(establishmentId);

    // Verificar se usuário já está associado
    const existingAssociation = await this.prisma.establishmentUser.findUnique({
      where: {
        establishmentId_userId: {
          establishmentId,
          userId,
        },
      },
    });

    if (existingAssociation) {
      throw new ConflictException('Usuário já associado a este estabelecimento');
    }

    await this.prisma.establishmentUser.create({
      data: {
        establishmentId,
        userId,
        role,
      },
    });
  }

  async removeUser(establishmentId: string, userId: string): Promise<void> {
    await this.findOne(establishmentId);

    const association = await this.prisma.establishmentUser.findUnique({
      where: {
        establishmentId_userId: {
          establishmentId,
          userId,
        },
      },
    });

    if (!association) {
      throw new NotFoundException('Associação não encontrada');
    }

    // Não permitir remover o último OWNER
    if (association.role === UserRole.OWNER) {
      const ownerCount = await this.prisma.establishmentUser.count({
        where: {
          establishmentId,
          role: UserRole.OWNER,
        },
      });

      if (ownerCount === 1) {
        throw new BadRequestException(
          'Não é possível remover o único proprietário do estabelecimento',
        );
      }
    }

    await this.prisma.establishmentUser.delete({
      where: {
        establishmentId_userId: {
          establishmentId,
          userId,
        },
      },
    });
  }

  async activate(id: string): Promise<Establishment> {
    await this.findOne(id);
    return this.establishmentRepository.activateEstablishment(id);
  }

  async deactivate(id: string): Promise<Establishment> {
    await this.findOne(id);
    return this.establishmentRepository.deactivateEstablishment(id);
  }
}
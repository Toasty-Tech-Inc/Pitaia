import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Customer, LoyaltyTransactionType, Prisma } from '@prisma/client';
import { CustomerRepository } from '../repositories/customer.repository';
import { ICustomerService } from '../contracts/customer-service.interface';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { FilterCustomerDto } from '../dto/filter-customer.dto';
import { AddLoyaltyPointsDto } from '../dto/add-loyalty-points.dto';
import { IPaginatedResult } from '../../../common/contracts/base-repository.interface';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class CustomerService implements ICustomerService {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    // Verificar se telefone já existe
    const existingPhone = await this.customerRepository.findByPhone(
      createCustomerDto.phone,
    );
    if (existingPhone) {
      throw new ConflictException('Telefone já cadastrado');
    }

    // Verificar se email já existe (se fornecido)
    if (createCustomerDto.email) {
      const existingEmail = await this.customerRepository.findByEmail(
        createCustomerDto.email,
      );
      if (existingEmail) {
        throw new ConflictException('Email já cadastrado');
      }
    }

    // Verificar se CPF já existe (se fornecido)
    if (createCustomerDto.cpf) {
      const existingCpf = await this.customerRepository.findByCpf(
        createCustomerDto.cpf,
      );
      if (existingCpf) {
        throw new ConflictException('CPF já cadastrado');
      }
    }

    // Preparar dados
    const data: any = {
      ...createCustomerDto,
      loyaltyPoints: 0,
    };

    if (createCustomerDto.birthDate) {
      data.birthDate = new Date(createCustomerDto.birthDate);
    }

    return this.customerRepository.create(data);
  }

  async findAll(filters: FilterCustomerDto): Promise<IPaginatedResult<Customer>> {
    const {
      search,
      email,
      phone,
      cpf,
      isActive,
      hasLoyaltyPoints,
      ...pagination
    } = filters;

    const where: any = {};

    if (email) {
      where.email = email;
    }

    if (phone) {
      where.phone = phone;
    }

    if (cpf) {
      where.cpf = cpf;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (hasLoyaltyPoints) {
      where.loyaltyPoints = { gt: 0 };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { cpf: { contains: search } },
      ];
    }

    const result = await this.customerRepository.paginate({
      ...pagination,
      ...where,
    });

    return result;
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }
    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);

    // Verificar se telefone está sendo alterado e se já existe
    if (updateCustomerDto.phone && updateCustomerDto.phone !== customer.phone) {
      const existingPhone = await this.customerRepository.findByPhone(
        updateCustomerDto.phone,
      );
      if (existingPhone) {
        throw new ConflictException('Telefone já cadastrado');
      }
    }

    // Verificar se email está sendo alterado e se já existe
    if (
      updateCustomerDto.email &&
      updateCustomerDto.email !== customer.email
    ) {
      const existingEmail = await this.customerRepository.findByEmail(
        updateCustomerDto.email,
      );
      if (existingEmail && existingEmail.id !== id) {
        throw new ConflictException('Email já cadastrado');
      }
    }

    // Verificar se CPF está sendo alterado e se já existe
    if (updateCustomerDto.cpf && updateCustomerDto.cpf !== customer.cpf) {
      const existingCpf = await this.customerRepository.findByCpf(
        updateCustomerDto.cpf,
      );
      if (existingCpf && existingCpf.id !== id) {
        throw new ConflictException('CPF já cadastrado');
      }
    }

    // Preparar dados
    const data: any = { ...updateCustomerDto };

    if (updateCustomerDto.birthDate) {
      data.birthDate = new Date(updateCustomerDto.birthDate);
    }

    return this.customerRepository.update(id, data);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.customerRepository.delete(id);
  }

  async findByPhone(phone: string): Promise<Customer> {
    const customer = await this.customerRepository.findByPhone(phone);
    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }
    return customer;
  }

  async findByCpf(cpf: string): Promise<Customer> {
    const customer = await this.customerRepository.findByCpf(cpf);
    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }
    return customer;
  }

  async toggleActive(id: string): Promise<Customer> {
    await this.findOne(id);
    return this.customerRepository.toggleActive(id);
  }

  async addLoyaltyPoints(
    id: string,
    addLoyaltyPointsDto: AddLoyaltyPointsDto,
  ): Promise<Customer> {
    const customer = await this.findOne(id);

    // Verificar se pontos resultariam em valor negativo
    const newPoints = customer.loyaltyPoints + addLoyaltyPointsDto.points;
    if (newPoints < 0) {
      throw new BadRequestException(
        'Pontos insuficientes. Cliente possui apenas ' +
          customer.loyaltyPoints +
          ' pontos.',
      );
    }

    // Atualizar pontos
    const updatedCustomer = await this.customerRepository.updateLoyaltyPoints(
      id,
      addLoyaltyPointsDto.points,
    );

    // Registrar transação de fidelidade
    await this.prisma.loyaltyTransaction.create({
      data: {
        customerId: id,
        type:
          addLoyaltyPointsDto.type || LoyaltyTransactionType.ADJUSTED,
        points: addLoyaltyPointsDto.points,
        description:
          addLoyaltyPointsDto.description ||
          `Ajuste manual de ${addLoyaltyPointsDto.points > 0 ? '+' : ''}${addLoyaltyPointsDto.points} pontos`,
      },
    });

    return updatedCustomer;
  }

  async getLoyaltyHistory(customerId: string): Promise<any[]> {
    await this.findOne(customerId);

    return this.prisma.loyaltyTransaction.findMany({
      where: { customerId },
      include: {
        sale: {
          select: {
            id: true,
            total: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}


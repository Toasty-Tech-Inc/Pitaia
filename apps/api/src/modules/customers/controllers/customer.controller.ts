import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CustomerService } from '../services/customer.service';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { FilterCustomerDto } from '../dto/filter-customer.dto';
import { AddLoyaltyPointsDto } from '../dto/add-loyalty-points.dto';
import { CreateCustomerAddressDto } from '../dto/create-customer-address.dto';
import { UpdateCustomerAddressDto } from '../dto/update-customer-address.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { Public } from '../../../common/decorators/public.decorator';
import { PrismaService } from '../../../database/prisma.service';

@ApiTags('Customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('customers')
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Criar novo cliente' })
  @ApiResponse({ status: 201, description: 'Cliente criado com sucesso' })
  @ApiResponse({
    status: 409,
    description: 'Telefone, email ou CPF já cadastrado',
  })
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.create(createCustomerDto);
  }

  @Get()
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER)
  @ApiOperation({ summary: 'Listar clientes com filtros e paginação' })
  @ApiResponse({
    status: 200,
    description: 'Lista de clientes retornada com sucesso',
  })
  findAll(@Query() filters: FilterCustomerDto) {
    return this.customerService.findAll(filters);
  }

  @Get('phone/:phone')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER)
  @ApiOperation({ summary: 'Buscar cliente por telefone' })
  @ApiParam({ name: 'phone', description: 'Telefone do cliente' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  findByPhone(@Param('phone') phone: string) {
    return this.customerService.findByPhone(phone);
  }

  @Get('cpf/:cpf')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER)
  @ApiOperation({ summary: 'Buscar cliente por CPF' })
  @ApiParam({ name: 'cpf', description: 'CPF do cliente' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  findByCpf(@Param('cpf') cpf: string) {
    return this.customerService.findByCpf(cpf);
  }

  @Get(':id')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER)
  @ApiOperation({ summary: 'Buscar cliente por ID' })
  @ApiParam({ name: 'id', description: 'ID do cliente' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Atualizar cliente' })
  @ApiParam({ name: 'id', description: 'ID do cliente' })
  @ApiResponse({ status: 200, description: 'Cliente atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    return this.customerService.update(id, updateCustomerDto);
  }

  @Patch(':id/toggle-active')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Alternar status ativo do cliente' })
  @ApiParam({ name: 'id', description: 'ID do cliente' })
  @ApiResponse({
    status: 200,
    description: 'Status ativo alterado com sucesso',
  })
  toggleActive(@Param('id') id: string) {
    return this.customerService.toggleActive(id);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar cliente' })
  @ApiParam({ name: 'id', description: 'ID do cliente' })
  @ApiResponse({ status: 204, description: 'Cliente deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  remove(@Param('id') id: string) {
    return this.customerService.remove(id);
  }

  // Endereços
  @Post(':id/addresses')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Adicionar endereço ao cliente' })
  @ApiParam({ name: 'id', description: 'ID do cliente' })
  @ApiResponse({ status: 201, description: 'Endereço adicionado com sucesso' })
  async addAddress(
    @Param('id') id: string,
    @Body() createAddressDto: CreateCustomerAddressDto,
  ) {
    await this.customerService.findOne(id);

    // Se for marcado como padrão, remover padrão dos outros
    if (createAddressDto.isDefault) {
      await this.prisma.customerAddress.updateMany({
        where: { customerId: id, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.customerAddress.create({
      data: {
        ...createAddressDto,
        customerId: id,
      },
    });
  }

  @Get(':id/addresses')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER)
  @ApiOperation({ summary: 'Listar endereços do cliente' })
  @ApiParam({ name: 'id', description: 'ID do cliente' })
  @ApiResponse({ status: 200, description: 'Lista de endereços' })
  async getAddresses(@Param('id') id: string) {
    await this.customerService.findOne(id);
    return this.prisma.customerAddress.findMany({
      where: { customerId: id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
  }

  @Patch(':id/addresses/:addressId')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Atualizar endereço do cliente' })
  @ApiParam({ name: 'id', description: 'ID do cliente' })
  @ApiParam({ name: 'addressId', description: 'ID do endereço' })
  @ApiResponse({ status: 200, description: 'Endereço atualizado com sucesso' })
  async updateAddress(
    @Param('id') id: string,
    @Param('addressId') addressId: string,
    @Body() updateAddressDto: UpdateCustomerAddressDto,
  ) {
    await this.customerService.findOne(id);

    const address = await this.prisma.customerAddress.findFirst({
      where: { id: addressId, customerId: id },
    });

    if (!address) {
      throw new NotFoundException('Endereço não encontrado');
    }

    // Se for marcado como padrão, remover padrão dos outros
    if (updateAddressDto.isDefault) {
      await this.prisma.customerAddress.updateMany({
        where: { customerId: id, isDefault: true, id: { not: addressId } },
        data: { isDefault: false },
      });
    }

    return this.prisma.customerAddress.update({
      where: { id: addressId },
      data: updateAddressDto,
    });
  }

  @Delete(':id/addresses/:addressId')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover endereço do cliente' })
  @ApiParam({ name: 'id', description: 'ID do cliente' })
  @ApiParam({ name: 'addressId', description: 'ID do endereço' })
  @ApiResponse({ status: 204, description: 'Endereço removido com sucesso' })
  async removeAddress(
    @Param('id') id: string,
    @Param('addressId') addressId: string,
  ) {
    await this.customerService.findOne(id);

    const address = await this.prisma.customerAddress.findFirst({
      where: { id: addressId, customerId: id },
    });

    if (!address) {
      throw new NotFoundException('Endereço não encontrado');
    }

    await this.prisma.customerAddress.delete({
      where: { id: addressId },
    });
  }

  // Fidelidade
  @Post(':id/loyalty-points')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Adicionar ou remover pontos de fidelidade' })
  @ApiParam({ name: 'id', description: 'ID do cliente' })
  @ApiResponse({ status: 200, description: 'Pontos atualizados com sucesso' })
  @ApiResponse({ status: 400, description: 'Pontos insuficientes' })
  addLoyaltyPoints(
    @Param('id') id: string,
    @Body() addLoyaltyPointsDto: AddLoyaltyPointsDto,
  ) {
    return this.customerService.addLoyaltyPoints(id, addLoyaltyPointsDto);
  }

  @Get(':id/loyalty-history')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER)
  @ApiOperation({ summary: 'Obter histórico de fidelidade do cliente' })
  @ApiParam({ name: 'id', description: 'ID do cliente' })
  @ApiResponse({ status: 200, description: 'Histórico de fidelidade' })
  getLoyaltyHistory(@Param('id') id: string) {
    return this.customerService.getLoyaltyHistory(id);
  }
}


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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { EstablishmentService } from '../services/establishment.service';
import { CreateEstablishmentDto } from '../dto/create-establishment.dto';
import { UpdateEstablishmentDto } from '../dto/update-establishment.dto';
import { FilterEstablishmentDto } from '../dto/filter-establishment.dto';
import { AddUserDto } from '../dto/add-user.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Establishments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('establishments')
export class EstablishmentController {
  constructor(private readonly establishmentService: EstablishmentService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo estabelecimento' })
  @ApiResponse({ status: 201, description: 'Estabelecimento criado com sucesso' })
  @ApiResponse({ status: 409, description: 'CNPJ já cadastrado' })
  create(
    @Body() createEstablishmentDto: CreateEstablishmentDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.establishmentService.create(createEstablishmentDto, userId);
  }

  @Get()
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Listar estabelecimentos' })
  @ApiResponse({ status: 200, description: 'Lista de estabelecimentos' })
  findAll(@Query() filters: FilterEstablishmentDto) {
    return this.establishmentService.findAll(filters);
  }

  @Get('my')
  @ApiOperation({ summary: 'Listar meus estabelecimentos' })
  @ApiResponse({ status: 200, description: 'Lista de estabelecimentos do usuário' })
  findMyEstablishments(@CurrentUser('id') userId: string) {
    return this.establishmentService.findByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar estabelecimento por ID' })
  @ApiParam({ name: 'id', description: 'ID do estabelecimento' })
  @ApiResponse({ status: 200, description: 'Estabelecimento encontrado' })
  @ApiResponse({ status: 404, description: 'Estabelecimento não encontrado' })
  findOne(@Param('id') id: string) {
    return this.establishmentService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Atualizar estabelecimento' })
  @ApiParam({ name: 'id', description: 'ID do estabelecimento' })
  @ApiResponse({ status: 200, description: 'Estabelecimento atualizado' })
  update(
    @Param('id') id: string,
    @Body() updateEstablishmentDto: UpdateEstablishmentDto,
  ) {
    return this.establishmentService.update(id, updateEstablishmentDto);
  }

  @Post(':id/users')
  @Roles(UserRole.OWNER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Adicionar usuário ao estabelecimento' })
  @ApiParam({ name: 'id', description: 'ID do estabelecimento' })
  @ApiResponse({ status: 204, description: 'Usuário adicionado com sucesso' })
  async addUser(@Param('id') id: string, @Body() addUserDto: AddUserDto) {
    await this.establishmentService.addUser(
      id,
      addUserDto.userId,
      addUserDto.role,
    );
  }

  @Delete(':id/users/:userId')
  @Roles(UserRole.OWNER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover usuário do estabelecimento' })
  @ApiParam({ name: 'id', description: 'ID do estabelecimento' })
  @ApiParam({ name: 'userId', description: 'ID do usuário' })
  @ApiResponse({ status: 204, description: 'Usuário removido com sucesso' })
  async removeUser(@Param('id') id: string, @Param('userId') userId: string) {
    await this.establishmentService.removeUser(id, userId);
  }

  @Patch(':id/activate')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Ativar estabelecimento' })
  activate(@Param('id') id: string) {
    return this.establishmentService.activate(id);
  }

  @Patch(':id/deactivate')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Desativar estabelecimento' })
  deactivate(@Param('id') id: string) {
    return this.establishmentService.deactivate(id);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar estabelecimento' })
  @ApiParam({ name: 'id', description: 'ID do estabelecimento' })
  remove(@Param('id') id: string) {
    return this.establishmentService.remove(id);
  }
}
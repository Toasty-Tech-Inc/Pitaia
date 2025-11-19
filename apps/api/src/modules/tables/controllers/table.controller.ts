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
import { TableService } from '../services/table.service';
import { CreateTableDto } from '../dto/create-table.dto';
import { UpdateTableDto } from '../dto/update-table.dto';
import { FilterTableDto } from '../dto/filter-table.dto';
import { UpdateTableStatusDto } from '../dto/update-table-status.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('Tables')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tables')
export class TableController {
  constructor(private readonly tableService: TableService) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Criar nova mesa' })
  @ApiResponse({ status: 201, description: 'Mesa criada com sucesso' })
  @ApiResponse({
    status: 409,
    description: 'Número de mesa ou QR Code já cadastrado',
  })
  create(@Body() createTableDto: CreateTableDto) {
    return this.tableService.create(createTableDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Listar mesas com filtros e paginação' })
  @ApiResponse({ status: 200, description: 'Lista de mesas retornada com sucesso' })
  findAll(@Query() filters: FilterTableDto) {
    return this.tableService.findAll(filters);
  }

  @Get('establishment/:establishmentId')
  @Public()
  @ApiOperation({ summary: 'Listar mesas por estabelecimento' })
  @ApiParam({ name: 'establishmentId', description: 'ID do estabelecimento' })
  @ApiResponse({
    status: 200,
    description: 'Lista de mesas do estabelecimento',
  })
  findByEstablishment(@Param('establishmentId') establishmentId: string) {
    return this.tableService.findByEstablishment(establishmentId);
  }

  @Get('qr-code/:qrCode')
  @Public()
  @ApiOperation({ summary: 'Buscar mesa por QR Code' })
  @ApiParam({ name: 'qrCode', description: 'Código QR da mesa' })
  @ApiResponse({ status: 200, description: 'Mesa encontrada' })
  @ApiResponse({ status: 404, description: 'Mesa não encontrada' })
  findByQrCode(@Param('qrCode') qrCode: string) {
    return this.tableService.findByQrCode(qrCode);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Buscar mesa por ID' })
  @ApiParam({ name: 'id', description: 'ID da mesa' })
  @ApiResponse({ status: 200, description: 'Mesa encontrada' })
  @ApiResponse({ status: 404, description: 'Mesa não encontrada' })
  findOne(@Param('id') id: string) {
    return this.tableService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Atualizar mesa' })
  @ApiParam({ name: 'id', description: 'ID da mesa' })
  @ApiResponse({ status: 200, description: 'Mesa atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Mesa não encontrada' })
  update(@Param('id') id: string, @Body() updateTableDto: UpdateTableDto) {
    return this.tableService.update(id, updateTableDto);
  }

  @Patch(':id/status')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER)
  @ApiOperation({ summary: 'Atualizar status da mesa' })
  @ApiParam({ name: 'id', description: 'ID da mesa' })
  @ApiResponse({ status: 200, description: 'Status atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Status inválido' })
  @ApiResponse({ status: 404, description: 'Mesa não encontrada' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateTableStatusDto: UpdateTableStatusDto,
  ) {
    return this.tableService.updateStatus(id, updateTableStatusDto.status);
  }

  @Patch(':id/toggle-active')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Alternar status ativo da mesa' })
  @ApiParam({ name: 'id', description: 'ID da mesa' })
  @ApiResponse({ status: 200, description: 'Status ativo alterado com sucesso' })
  toggleActive(@Param('id') id: string) {
    return this.tableService.toggleActive(id);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar mesa' })
  @ApiParam({ name: 'id', description: 'ID da mesa' })
  @ApiResponse({ status: 204, description: 'Mesa deletada com sucesso' })
  @ApiResponse({ status: 404, description: 'Mesa não encontrada' })
  remove(@Param('id') id: string) {
    return this.tableService.remove(id);
  }
}


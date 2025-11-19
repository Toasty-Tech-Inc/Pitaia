import {
  Controller,
  Get,
  Post,
  Body,
  Param,
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
  ApiQuery,
} from '@nestjs/swagger';
import { CashierService } from '../services/cashier.service';
import { OpenCashierSessionDto } from '../dto/open-cashier-session.dto';
import { CloseCashierSessionDto } from '../dto/close-cashier-session.dto';
import { CreateCashMovementDto } from '../dto/create-cash-movement.dto';
import { FilterCashierSessionDto } from '../dto/filter-cashier-session.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Cashier Sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cashier-sessions')
export class CashierController {
  constructor(private readonly cashierService: CashierService) {}

  @Post('open')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER)
  @ApiOperation({ summary: 'Abrir sessão de caixa' })
  @ApiResponse({ status: 201, description: 'Sessão aberta com sucesso' })
  @ApiResponse({ status: 409, description: 'Usuário já possui sessão aberta' })
  openSession(@Body() openDto: OpenCashierSessionDto) {
    return this.cashierService.openSession(openDto);
  }

  @Post(':id/close')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fechar sessão de caixa' })
  @ApiParam({ name: 'id', description: 'ID da sessão' })
  @ApiResponse({ status: 200, description: 'Sessão fechada com sucesso' })
  @ApiResponse({ status: 400, description: 'Sessão já está fechada' })
  closeSession(@Param('id') id: string, @Body() closeDto: CloseCashierSessionDto) {
    return this.cashierService.closeSession(id, closeDto);
  }

  @Get()
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Listar sessões de caixa' })
  @ApiResponse({ status: 200, description: 'Lista de sessões' })
  findAll(@Query() filters: FilterCashierSessionDto) {
    return this.cashierService.findAll(filters);
  }

  @Get('active')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER)
  @ApiOperation({ summary: 'Obter sessão ativa do usuário' })
  @ApiResponse({ status: 200, description: 'Sessão ativa' })
  @ApiResponse({ status: 404, description: 'Nenhuma sessão ativa encontrada' })
  getActiveSession(@CurrentUser('id') userId: string) {
    return this.cashierService.getActiveSession(userId);
  }

  @Get(':id')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER)
  @ApiOperation({ summary: 'Buscar sessão por ID' })
  @ApiParam({ name: 'id', description: 'ID da sessão' })
  @ApiResponse({ status: 200, description: 'Sessão encontrada' })
  @ApiResponse({ status: 404, description: 'Sessão não encontrada' })
  findOne(@Param('id') id: string) {
    return this.cashierService.findOne(id);
  }

  @Get(':id/report')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER)
  @ApiOperation({ summary: 'Gerar relatório da sessão' })
  @ApiParam({ name: 'id', description: 'ID da sessão' })
  @ApiResponse({ status: 200, description: 'Relatório gerado' })
  getSessionReport(@Param('id') id: string) {
    return this.cashierService.getSessionReport(id);
  }

  @Get('report/daily/:establishmentId')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Relatório diário de caixas' })
  @ApiParam({ name: 'establishmentId', description: 'ID do estabelecimento' })
  @ApiQuery({
    name: 'date',
    required: false,
    type: String,
    description: 'Data (ISO). Padrão: hoje',
  })
  @ApiResponse({ status: 200, description: 'Relatório gerado' })
  getDailyReport(
    @Param('establishmentId') establishmentId: string,
    @Query('date') date?: string,
  ) {
    const reportDate = date ? new Date(date) : new Date();
    return this.cashierService.getDailyReport(establishmentId, reportDate);
  }

  // ============================================
  // CASH MOVEMENTS
  // ============================================

  @Post('movements')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER)
  @ApiOperation({ summary: 'Criar movimento de caixa' })
  @ApiResponse({ status: 201, description: 'Movimento criado' })
  @ApiResponse({ status: 400, description: 'Sessão fechada' })
  createMovement(@Body() createDto: CreateCashMovementDto) {
    return this.cashierService.createMovement(createDto);
  }

  @Get(':id/movements')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER)
  @ApiOperation({ summary: 'Listar movimentos da sessão' })
  @ApiParam({ name: 'id', description: 'ID da sessão' })
  @ApiResponse({ status: 200, description: 'Lista de movimentos' })
  getMovements(@Param('id') id: string) {
    return this.cashierService.getMovementsBySession(id);
  }
}

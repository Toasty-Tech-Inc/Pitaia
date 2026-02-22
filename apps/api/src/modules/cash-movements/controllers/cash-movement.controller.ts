import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CashMovementService } from '../services/cash-movement.service';
import { CreateCashMovementDto } from '../dto/create-cash-movement.dto';
import { FilterCashMovementDto } from '../dto/filter-cash-movement.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Cash Movements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cash-movements')
export class CashMovementController {
  constructor(private readonly cashMovementService: CashMovementService) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER)
  @ApiOperation({ summary: 'Criar movimentação de caixa' })
  @ApiResponse({ status: 201, description: 'Movimentação criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Sessão fechada ou dados inválidos' })
  @ApiResponse({ status: 404, description: 'Sessão não encontrada' })
  create(@Body() dto: CreateCashMovementDto) {
    return this.cashMovementService.create(dto);
  }

  @Get()
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Listar movimentações de caixa' })
  @ApiResponse({ status: 200, description: 'Lista de movimentações' })
  findAll(@Query() filters: FilterCashMovementDto) {
    return this.cashMovementService.findAll(filters);
  }

  @Get(':id')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER)
  @ApiOperation({ summary: 'Buscar movimentação por ID' })
  @ApiParam({ name: 'id', description: 'ID da movimentação' })
  @ApiResponse({ status: 200, description: 'Movimentação encontrada' })
  @ApiResponse({ status: 404, description: 'Movimentação não encontrada' })
  findOne(@Param('id') id: string) {
    return this.cashMovementService.findOne(id);
  }

  @Get('session/:sessionId')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER)
  @ApiOperation({ summary: 'Listar movimentações de uma sessão' })
  @ApiParam({ name: 'sessionId', description: 'ID da sessão de caixa' })
  @ApiResponse({ status: 200, description: 'Movimentações da sessão' })
  @ApiResponse({ status: 404, description: 'Sessão não encontrada' })
  findBySession(@Param('sessionId') sessionId: string) {
    return this.cashMovementService.findBySession(sessionId);
  }

  @Get('session/:sessionId/summary')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER)
  @ApiOperation({ summary: 'Resumo da sessão de caixa' })
  @ApiParam({ name: 'sessionId', description: 'ID da sessão de caixa' })
  @ApiResponse({ status: 200, description: 'Resumo da sessão' })
  @ApiResponse({ status: 404, description: 'Sessão não encontrada' })
  getSessionSummary(@Param('sessionId') sessionId: string) {
    return this.cashMovementService.getSessionSummary(sessionId);
  }

  @Get('report/daily/:establishmentId')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Relatório diário de movimentações' })
  @ApiParam({ name: 'establishmentId', description: 'ID do estabelecimento' })
  @ApiQuery({ name: 'date', description: 'Data do relatório (YYYY-MM-DD)', required: true })
  @ApiResponse({ status: 200, description: 'Relatório diário' })
  getDailyReport(
    @Param('establishmentId') establishmentId: string,
    @Query('date') date: string,
  ) {
    return this.cashMovementService.getDailyReport(establishmentId, date);
  }
}

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
} from '@nestjs/swagger';
import { LoyaltyService } from '../services/loyalty.service';
import { CreateLoyaltyTransactionDto } from '../dto/create-loyalty-transaction.dto';
import { FilterLoyaltyTransactionDto } from '../dto/filter-loyalty-transaction.dto';
import { RedeemPointsDto } from '../dto/redeem-points.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Loyalty')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('loyalty')
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Post('earn')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER)
  @ApiOperation({ summary: 'Adicionar pontos de fidelidade' })
  @ApiResponse({ status: 201, description: 'Pontos adicionados com sucesso' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  earnPoints(@Body() dto: CreateLoyaltyTransactionDto) {
    return this.loyaltyService.earnPoints(dto);
  }

  @Post('redeem/:customerId')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER)
  @ApiOperation({ summary: 'Resgatar pontos de fidelidade' })
  @ApiParam({ name: 'customerId', description: 'ID do cliente' })
  @ApiResponse({ status: 201, description: 'Pontos resgatados com sucesso' })
  @ApiResponse({ status: 400, description: 'Saldo insuficiente' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  redeemPoints(
    @Param('customerId') customerId: string,
    @Body() dto: RedeemPointsDto,
  ) {
    return this.loyaltyService.redeemPoints(customerId, dto);
  }

  @Post('adjust')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Ajustar pontos de fidelidade manualmente' })
  @ApiResponse({ status: 201, description: 'Pontos ajustados com sucesso' })
  @ApiResponse({ status: 400, description: 'Ajuste inválido' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  adjustPoints(@Body() dto: CreateLoyaltyTransactionDto) {
    return this.loyaltyService.adjustPoints(dto);
  }

  @Get('transactions')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Listar transações de fidelidade' })
  @ApiResponse({ status: 200, description: 'Lista de transações' })
  findAll(@Query() filters: FilterLoyaltyTransactionDto) {
    return this.loyaltyService.findAll(filters);
  }

  @Get('customer/:customerId')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER)
  @ApiOperation({ summary: 'Buscar transações de um cliente' })
  @ApiParam({ name: 'customerId', description: 'ID do cliente' })
  @ApiResponse({ status: 200, description: 'Transações do cliente' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  findByCustomer(@Param('customerId') customerId: string) {
    return this.loyaltyService.findByCustomer(customerId);
  }

  @Get('balance/:customerId')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER)
  @ApiOperation({ summary: 'Consultar saldo de pontos do cliente' })
  @ApiParam({ name: 'customerId', description: 'ID do cliente' })
  @ApiResponse({ status: 200, description: 'Saldo de pontos' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  getBalance(@Param('customerId') customerId: string) {
    return this.loyaltyService.getCustomerBalance(customerId);
  }

  @Get('summary/:customerId')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER)
  @ApiOperation({ summary: 'Resumo de fidelidade do cliente' })
  @ApiParam({ name: 'customerId', description: 'ID do cliente' })
  @ApiResponse({ status: 200, description: 'Resumo de fidelidade' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  getCustomerSummary(@Param('customerId') customerId: string) {
    return this.loyaltyService.getCustomerLoyaltySummary(customerId);
  }

  @Post('process-expired')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Processar pontos expirados' })
  @ApiResponse({ status: 200, description: 'Pontos expirados processados' })
  processExpired() {
    return this.loyaltyService.processExpiredPoints();
  }
}

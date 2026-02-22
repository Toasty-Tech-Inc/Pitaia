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
import { StockService } from '../services/stock.service';
import { CreateStockMovementDto } from '../dto/create-stock-movement.dto';
import { FilterStockMovementDto } from '../dto/filter-stock-movement.dto';
import { AdjustStockDto } from '../dto/adjust-stock.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Stock')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post('movement')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Criar movimentação de estoque' })
  @ApiResponse({ status: 201, description: 'Movimentação criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Operação inválida ou estoque insuficiente' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  createMovement(@Body() dto: CreateStockMovementDto) {
    return this.stockService.createMovement(dto);
  }

  @Get('movements')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Listar movimentações de estoque' })
  @ApiResponse({ status: 200, description: 'Lista de movimentações retornada com sucesso' })
  findAll(@Query() filters: FilterStockMovementDto) {
    return this.stockService.findAll(filters);
  }

  @Get('movements/:id')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Buscar movimentação por ID' })
  @ApiParam({ name: 'id', description: 'ID da movimentação' })
  @ApiResponse({ status: 200, description: 'Movimentação encontrada' })
  @ApiResponse({ status: 404, description: 'Movimentação não encontrada' })
  findOne(@Param('id') id: string) {
    return this.stockService.findOne(id);
  }

  @Get('product/:productId')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Buscar movimentações por produto' })
  @ApiParam({ name: 'productId', description: 'ID do produto' })
  @ApiResponse({ status: 200, description: 'Movimentações do produto' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  findByProduct(@Param('productId') productId: string) {
    return this.stockService.findByProduct(productId);
  }

  @Post('product/:productId/adjust')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Ajustar estoque de um produto' })
  @ApiParam({ name: 'productId', description: 'ID do produto' })
  @ApiResponse({ status: 200, description: 'Estoque ajustado com sucesso' })
  @ApiResponse({ status: 400, description: 'Operação inválida' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  adjustStock(
    @Param('productId') productId: string,
    @Body() dto: AdjustStockDto,
  ) {
    return this.stockService.adjustStock(productId, dto);
  }

  @Get('report/:establishmentId')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Relatório de estoque do estabelecimento' })
  @ApiParam({ name: 'establishmentId', description: 'ID do estabelecimento' })
  @ApiResponse({ status: 200, description: 'Relatório de estoque' })
  getStockReport(@Param('establishmentId') establishmentId: string) {
    return this.stockService.getStockReport(establishmentId);
  }
}

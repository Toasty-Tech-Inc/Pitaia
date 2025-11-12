import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { SaleService } from '../services/sale.service';
import { CreateSaleDto } from '../dto/create-sale.dto';
import { FilterSaleDto } from '../dto/filter-sale.dto';
import { SaleReportDto } from '../dto/sale-report.dto';

@ApiTags('sales')
@ApiBearerAuth()
@Controller('sales')
// @UseGuards(JwtAuthGuard) // Descomente quando implementar autenticação
export class SaleController {
  constructor(private readonly saleService: SaleService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar uma nova venda' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Venda criada com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos ou venda já existe para o pedido',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Pedido não encontrado',
  })
  async create(@Body() createSaleDto: CreateSaleDto) {
    return this.saleService.create(createSaleDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar vendas com filtros e paginação' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de vendas retornada com sucesso',
  })
  async findAll(@Query() filters: FilterSaleDto) {
    return this.saleService.findAll(filters);
  }

  @Get('report')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gerar relatório de vendas' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Relatório gerado com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Tipo de relatório inválido ou parâmetros faltando',
  })
  async getSalesReport(@Query() reportDto: SaleReportDto) {
    return this.saleService.getSalesReport(reportDto);
  }

  @Get('establishment/:establishmentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Buscar vendas por estabelecimento' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vendas do estabelecimento retornadas com sucesso',
  })
  async getSalesByEstablishment(
    @Param('establishmentId') establishmentId: string,
  ) {
    return this.saleService.getSalesByEstablishment(establishmentId);
  }

  @Get('cashier-session/:cashierSessionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Buscar vendas por sessão de caixa' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vendas da sessão retornadas com sucesso',
  })
  async getSalesByCashierSession(
    @Param('cashierSessionId') cashierSessionId: string,
  ) {
    return this.saleService.getSalesByCashierSession(cashierSessionId);
  }

  @Get('report/daily/:establishmentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gerar relatório diário de vendas' })
  @ApiQuery({
    name: 'date',
    required: false,
    type: String,
    description: 'Data para o relatório (formato ISO). Padrão: hoje',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Relatório diário gerado com sucesso',
  })
  async getDailyReport(
    @Param('establishmentId') establishmentId: string,
    @Query('date') date?: string,
  ) {
    const reportDate = date ? new Date(date) : new Date();
    return this.saleService.getDailyReport(establishmentId, reportDate);
  }

  @Get('report/products/:establishmentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gerar relatório de vendas por produto' })
  @ApiQuery({
    name: 'startDate',
    required: true,
    type: String,
    description: 'Data inicial (formato ISO)',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    type: String,
    description: 'Data final (formato ISO)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Relatório de produtos gerado com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datas inválidas',
  })
  async getProductSalesReport(
    @Param('establishmentId') establishmentId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.saleService.getProductSalesReport(
      establishmentId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('report/customer/:customerId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gerar relatório de vendas por cliente' })
  @ApiQuery({
    name: 'startDate',
    required: true,
    type: String,
    description: 'Data inicial (formato ISO)',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    type: String,
    description: 'Data final (formato ISO)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Relatório do cliente gerado com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datas inválidas',
  })
  async getCustomerSalesReport(
    @Param('customerId') customerId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.saleService.getCustomerSalesReport(
      customerId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Buscar venda por ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Venda encontrada com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Venda não encontrada',
  })
  async findOne(@Param('id') id: string) {
    return this.saleService.findOne(id);
  }
}
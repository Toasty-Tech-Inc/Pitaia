import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SaleService } from '../services/sale.service';
import { CreateSaleDto } from '../dto/create-sale.dto';
import { FilterSaleDto } from '../dto/filter-sale.dto';
import { SaleReportDto } from '../dto/sale-report.dto';
import { Sale } from '@prisma/client';

@ApiTags('sales')
@ApiBearerAuth()
@Controller('sales')
export class SaleController {
  constructor(private readonly saleService: SaleService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova venda' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Venda criada com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Já existe venda para este pedido',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Pedido não encontrado',
  })
  async create(@Body() createSaleDto: CreateSaleDto): Promise<Sale> {
    return this.saleService.create(createSaleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar vendas com filtros e paginação' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de vendas retornada com sucesso',
  })
  async findAll(@Query() filters: FilterSaleDto) {
    return this.saleService.findAll(filters);
  }

  @Get('reports')
  @ApiOperation({ summary: 'Obter relatório de vendas' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Relatório gerado com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parâmetros inválidos para o relatório',
  })
  async getSalesReport(@Query() reportDto: SaleReportDto) {
    return this.saleService.getSalesReport(reportDto);
  }

  @Get('reports/daily/:establishmentId')
  @ApiOperation({ summary: 'Obter relatório diário de vendas' })
  @ApiParam({
    name: 'establishmentId',
    description: 'ID do estabelecimento',
    type: String,
  })
  @ApiQuery({
    name: 'date',
    description: 'Data do relatório (ISO 8601)',
    required: false,
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Relatório diário retornado com sucesso',
  })
  async getDailyReport(
    @Param('establishmentId') establishmentId: string,
    @Query('date') date?: string,
  ) {
    const reportDate = date ? new Date(date) : new Date();
    return this.saleService.getDailyReport(establishmentId, reportDate);
  }

  @Get('reports/products/:establishmentId')
  @ApiOperation({ summary: 'Obter relatório de vendas por produto' })
  @ApiParam({
    name: 'establishmentId',
    description: 'ID do estabelecimento',
    type: String,
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Data inicial (ISO 8601)',
    required: true,
    type: String,
  })
  @ApiQuery({
    name: 'endDate',
    description: 'Data final (ISO 8601)',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Relatório de produtos retornado com sucesso',
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

  @Get('reports/customers/:customerId')
  @ApiOperation({ summary: 'Obter relatório de vendas por cliente' })
  @ApiParam({
    name: 'customerId',
    description: 'ID do cliente',
    type: String,
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Data inicial (ISO 8601)',
    required: true,
    type: String,
  })
  @ApiQuery({
    name: 'endDate',
    description: 'Data final (ISO 8601)',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Relatório do cliente retornado com sucesso',
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

  @Get('establishment/:establishmentId')
  @ApiOperation({ summary: 'Listar vendas por estabelecimento' })
  @ApiParam({
    name: 'establishmentId',
    description: 'ID do estabelecimento',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de vendas retornada com sucesso',
  })
  async getSalesByEstablishment(
    @Param('establishmentId') establishmentId: string,
  ): Promise<Sale[]> {
    return this.saleService.getSalesByEstablishment(establishmentId);
  }

  @Get('cashier-session/:cashierSessionId')
  @ApiOperation({ summary: 'Listar vendas por sessão de caixa' })
  @ApiParam({
    name: 'cashierSessionId',
    description: 'ID da sessão de caixa',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de vendas retornada com sucesso',
  })
  async getSalesByCashierSession(
    @Param('cashierSessionId') cashierSessionId: string,
  ): Promise<Sale[]> {
    return this.saleService.getSalesByCashierSession(cashierSessionId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar venda por ID' })
  @ApiParam({ name: 'id', description: 'ID da venda', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Venda encontrada',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Venda não encontrada',
  })
  async findOne(@Param('id') id: string): Promise<Sale> {
    return this.saleService.findOne(id);
  }
}

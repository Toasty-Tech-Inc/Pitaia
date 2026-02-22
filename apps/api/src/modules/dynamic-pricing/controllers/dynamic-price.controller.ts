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
import { DynamicPriceService } from '../services/dynamic-price.service';
import { CreateDynamicPriceDto } from '../dto/create-dynamic-price.dto';
import { UpdateDynamicPriceDto } from '../dto/update-dynamic-price.dto';
import { FilterDynamicPriceDto } from '../dto/filter-dynamic-price.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Dynamic Pricing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dynamic-pricing')
export class DynamicPriceController {
  constructor(private readonly dynamicPriceService: DynamicPriceService) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Criar preço dinâmico' })
  @ApiResponse({ status: 201, description: 'Preço dinâmico criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  create(@Body() dto: CreateDynamicPriceDto) {
    return this.dynamicPriceService.create(dto);
  }

  @Get()
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Listar preços dinâmicos' })
  @ApiResponse({ status: 200, description: 'Lista de preços dinâmicos' })
  findAll(@Query() filters: FilterDynamicPriceDto) {
    return this.dynamicPriceService.findAll(filters);
  }

  @Get(':id')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Buscar preço dinâmico por ID' })
  @ApiParam({ name: 'id', description: 'ID do preço dinâmico' })
  @ApiResponse({ status: 200, description: 'Preço dinâmico encontrado' })
  @ApiResponse({ status: 404, description: 'Preço dinâmico não encontrado' })
  findOne(@Param('id') id: string) {
    return this.dynamicPriceService.findOne(id);
  }

  @Get('product/:productId')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Listar preços dinâmicos de um produto' })
  @ApiParam({ name: 'productId', description: 'ID do produto' })
  @ApiResponse({ status: 200, description: 'Preços dinâmicos do produto' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  findByProduct(@Param('productId') productId: string) {
    return this.dynamicPriceService.findByProduct(productId);
  }

  @Get('product/:productId/current')
  @ApiOperation({ summary: 'Obter preço atual do produto (considerando regras dinâmicas)' })
  @ApiParam({ name: 'productId', description: 'ID do produto' })
  @ApiResponse({ status: 200, description: 'Preço atual do produto' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  getCurrentPrice(@Param('productId') productId: string) {
    return this.dynamicPriceService.getCurrentPrice(productId);
  }

  @Get('product/:productId/analysis')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Análise de preços do produto com sugestões' })
  @ApiParam({ name: 'productId', description: 'ID do produto' })
  @ApiResponse({ status: 200, description: 'Análise de preços' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  getProductAnalysis(@Param('productId') productId: string) {
    return this.dynamicPriceService.getProductPricingAnalysis(productId);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Atualizar preço dinâmico' })
  @ApiParam({ name: 'id', description: 'ID do preço dinâmico' })
  @ApiResponse({ status: 200, description: 'Preço dinâmico atualizado' })
  @ApiResponse({ status: 404, description: 'Preço dinâmico não encontrado' })
  update(@Param('id') id: string, @Body() dto: UpdateDynamicPriceDto) {
    return this.dynamicPriceService.update(id, dto);
  }

  @Patch(':id/toggle')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Ativar/desativar preço dinâmico' })
  @ApiParam({ name: 'id', description: 'ID do preço dinâmico' })
  @ApiResponse({ status: 200, description: 'Status alterado com sucesso' })
  @ApiResponse({ status: 404, description: 'Preço dinâmico não encontrado' })
  toggleActive(@Param('id') id: string) {
    return this.dynamicPriceService.toggleActive(id);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover preço dinâmico' })
  @ApiParam({ name: 'id', description: 'ID do preço dinâmico' })
  @ApiResponse({ status: 204, description: 'Preço dinâmico removido' })
  @ApiResponse({ status: 404, description: 'Preço dinâmico não encontrado' })
  remove(@Param('id') id: string) {
    return this.dynamicPriceService.remove(id);
  }
}

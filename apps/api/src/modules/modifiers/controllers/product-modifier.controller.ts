import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
import { ModifierService } from '../services/modifier.service';
import { CreateProductModifierDto } from '../dto/create-product-modifier.dto';
import { UpdateProductModifierDto } from '../dto/update-product-modifier.dto';
import { BulkCreateModifierDto } from '../dto/bulk-create-modifier.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Product Modifiers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('product-modifiers')
export class ProductModifierController {
  constructor(private readonly modifierService: ModifierService) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Criar novo modificador de produto' })
  @ApiResponse({ status: 201, description: 'Modificador criado com sucesso' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  create(@Body() createDto: CreateProductModifierDto) {
    return this.modifierService.createModifier(createDto);
  }

  @Post('bulk')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Criar múltiplos modificadores com opções',
    description: 'Cria vários modificadores e suas opções de uma vez',
  })
  @ApiResponse({ status: 201, description: 'Modificadores criados com sucesso' })
  bulkCreate(@Body() bulkDto: BulkCreateModifierDto) {
    return this.modifierService.bulkCreateModifiers(
      bulkDto.productId,
      bulkDto.modifiers,
    );
  }

  @Get('product/:productId')
  @Public()
  @ApiOperation({ summary: 'Listar modificadores de um produto' })
  @ApiParam({ name: 'productId', description: 'ID do produto' })
  @ApiResponse({ status: 200, description: 'Lista de modificadores' })
  findByProduct(@Param('productId') productId: string) {
    return this.modifierService.findModifiersByProduct(productId);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Buscar modificador por ID' })
  @ApiParam({ name: 'id', description: 'ID do modificador' })
  @ApiResponse({ status: 200, description: 'Modificador encontrado' })
  @ApiResponse({ status: 404, description: 'Modificador não encontrado' })
  findOne(@Param('id') id: string) {
    return this.modifierService.findOneModifier(id);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Atualizar modificador' })
  @ApiParam({ name: 'id', description: 'ID do modificador' })
  @ApiResponse({ status: 200, description: 'Modificador atualizado' })
  update(@Param('id') id: string, @Body() updateDto: UpdateProductModifierDto) {
    return this.modifierService.updateModifier(id, updateDto);
  }

  @Patch(':id/toggle-required')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Alternar obrigatoriedade do modificador' })
  @ApiParam({ name: 'id', description: 'ID do modificador' })
  @ApiResponse({ status: 200, description: 'Status alterado com sucesso' })
  toggleRequired(@Param('id') id: string) {
    return this.modifierService.toggleRequired(id);
  }

  @Post('duplicate/:sourceProductId/:targetProductId')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Duplicar modificadores de um produto para outro',
    description: 'Copia todos os modificadores e opções do produto origem para o produto destino',
  })
  @ApiParam({ name: 'sourceProductId', description: 'ID do produto origem' })
  @ApiParam({ name: 'targetProductId', description: 'ID do produto destino' })
  @ApiResponse({ status: 200, description: 'Modificadores duplicados com sucesso' })
  duplicate(
    @Param('sourceProductId') sourceProductId: string,
    @Param('targetProductId') targetProductId: string,
  ) {
    return this.modifierService.duplicateModifiers(
      sourceProductId,
      targetProductId,
    );
  }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar modificador' })
  @ApiParam({ name: 'id', description: 'ID do modificador' })
  @ApiResponse({ status: 204, description: 'Modificador deletado' })
  @ApiResponse({
    status: 400,
    description: 'Modificador tem opções vinculadas',
  })
  remove(@Param('id') id: string) {
    return this.modifierService.removeModifier(id);
  }
}
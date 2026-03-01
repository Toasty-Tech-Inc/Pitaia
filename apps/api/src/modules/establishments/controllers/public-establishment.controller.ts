import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { EstablishmentService } from '../services/establishment.service';

@ApiTags('Public - Establishments')
@Controller('public/establishments')
export class PublicEstablishmentController {
  constructor(private readonly establishmentService: EstablishmentService) {}

  @Get('slug/:slug')
  @ApiOperation({ 
    summary: 'Buscar estabelecimento por slug (público)',
    description: 'Retorna o estabelecimento com suas categorias, produtos e métodos de pagamento ativos'
  })
  @ApiParam({ 
    name: 'slug', 
    description: 'Slug único do estabelecimento',
    example: 'restaurante-pitaia'
  })
  @ApiResponse({ status: 200, description: 'Estabelecimento encontrado com categorias e produtos' })
  @ApiResponse({ status: 404, description: 'Estabelecimento não encontrado' })
  findBySlug(@Param('slug') slug: string) {
    return this.establishmentService.findBySlug(slug);
  }
}

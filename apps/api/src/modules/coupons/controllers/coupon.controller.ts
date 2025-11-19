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
import { CouponService } from '../services/coupon.service';
import { CreateCouponDto } from '../dto/create-coupon.dto';
import { UpdateCouponDto } from '../dto/update-coupon.dto';
import { FilterCouponDto } from '../dto/filter-coupon.dto';
import { ValidateCouponDto } from '../dto/validate-coupon.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('Coupons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Criar novo cupom' })
  @ApiResponse({ status: 201, description: 'Cupom criado com sucesso' })
  @ApiResponse({ status: 409, description: 'Código de cupom já cadastrado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(@Body() createCouponDto: CreateCouponDto) {
    return this.couponService.create(createCouponDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Listar cupons com filtros e paginação' })
  @ApiResponse({
    status: 200,
    description: 'Lista de cupons retornada com sucesso',
  })
  findAll(@Query() filters: FilterCouponDto) {
    return this.couponService.findAll(filters);
  }

  @Get('public')
  @Public()
  @ApiOperation({ summary: 'Listar cupons públicos disponíveis' })
  @ApiResponse({
    status: 200,
    description: 'Lista de cupons públicos',
  })
  findPublicCoupons() {
    return this.couponService.findPublicCoupons();
  }

  @Post('validate')
  @Public()
  @ApiOperation({ summary: 'Validar cupom' })
  @ApiResponse({ status: 200, description: 'Cupom válido' })
  @ApiResponse({ status: 400, description: 'Cupom inválido ou expirado' })
  @ApiResponse({ status: 404, description: 'Cupom não encontrado' })
  validateCoupon(@Body() validateCouponDto: ValidateCouponDto) {
    return this.couponService.validateCoupon(validateCouponDto);
  }

  @Get('code/:code')
  @Public()
  @ApiOperation({ summary: 'Buscar cupom por código' })
  @ApiParam({ name: 'code', description: 'Código do cupom' })
  @ApiResponse({ status: 200, description: 'Cupom encontrado' })
  @ApiResponse({ status: 404, description: 'Cupom não encontrado' })
  findByCode(@Param('code') code: string) {
    return this.couponService.findByCode(code);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Buscar cupom por ID' })
  @ApiParam({ name: 'id', description: 'ID do cupom' })
  @ApiResponse({ status: 200, description: 'Cupom encontrado' })
  @ApiResponse({ status: 404, description: 'Cupom não encontrado' })
  findOne(@Param('id') id: string) {
    return this.couponService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Atualizar cupom' })
  @ApiParam({ name: 'id', description: 'ID do cupom' })
  @ApiResponse({ status: 200, description: 'Cupom atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Cupom não encontrado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  update(@Param('id') id: string, @Body() updateCouponDto: UpdateCouponDto) {
    return this.couponService.update(id, updateCouponDto);
  }

  @Patch(':id/toggle-active')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Alternar status ativo do cupom' })
  @ApiParam({ name: 'id', description: 'ID do cupom' })
  @ApiResponse({
    status: 200,
    description: 'Status ativo alterado com sucesso',
  })
  toggleActive(@Param('id') id: string) {
    return this.couponService.toggleActive(id);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar cupom' })
  @ApiParam({ name: 'id', description: 'ID do cupom' })
  @ApiResponse({ status: 204, description: 'Cupom deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Cupom não encontrado' })
  remove(@Param('id') id: string) {
    return this.couponService.remove(id);
  }
}


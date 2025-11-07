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
import { PaymentService } from '../services/payment.service';
import { CreatePaymentMethodDto } from '../dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from '../dto/update-payment-method.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Payment Methods')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payment-methods')
export class PaymentMethodController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Criar nova forma de pagamento' })
  @ApiResponse({ status: 201, description: 'Forma de pagamento criada com sucesso' })
  create(@Body() createDto: CreatePaymentMethodDto) {
    return this.paymentService.createPaymentMethod(createDto);
  }

  @Get('establishment/:establishmentId')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER)
  @ApiOperation({ summary: 'Listar formas de pagamento do estabelecimento' })
  @ApiParam({ name: 'establishmentId', description: 'ID do estabelecimento' })
  @ApiResponse({ status: 200, description: 'Lista de formas de pagamento' })
  findAll(@Param('establishmentId') establishmentId: string) {
    return this.paymentService.findAllPaymentMethods(establishmentId);
  }

  @Get('establishment/:establishmentId/active')
  @Public()
  @ApiOperation({ summary: 'Listar formas de pagamento ativas (público)' })
  @ApiParam({ name: 'establishmentId', description: 'ID do estabelecimento' })
  @ApiResponse({ status: 200, description: 'Lista de formas de pagamento ativas' })
  findActive(@Param('establishmentId') establishmentId: string) {
    return this.paymentService.findActivePaymentMethods(establishmentId);
  }

  @Get(':id')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Buscar forma de pagamento por ID' })
  @ApiParam({ name: 'id', description: 'ID da forma de pagamento' })
  @ApiResponse({ status: 200, description: 'Forma de pagamento encontrada' })
  @ApiResponse({ status: 404, description: 'Forma de pagamento não encontrada' })
  findOne(@Param('id') id: string) {
    return this.paymentService.findOnePaymentMethod(id);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Atualizar forma de pagamento' })
  @ApiParam({ name: 'id', description: 'ID da forma de pagamento' })
  @ApiResponse({ status: 200, description: 'Forma de pagamento atualizada' })
  update(@Param('id') id: string, @Body() updateDto: UpdatePaymentMethodDto) {
    return this.paymentService.updatePaymentMethod(id, updateDto);
  }

  @Patch(':id/toggle')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Ativar/Desativar forma de pagamento' })
  @ApiParam({ name: 'id', description: 'ID da forma de pagamento' })
  @ApiResponse({ status: 200, description: 'Status alterado com sucesso' })
  toggle(@Param('id') id: string) {
    return this.paymentService.togglePaymentMethod(id);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar forma de pagamento' })
  @ApiParam({ name: 'id', description: 'ID da forma de pagamento' })
  @ApiResponse({ status: 204, description: 'Forma de pagamento deletada' })
  @ApiResponse({ status: 400, description: 'Forma de pagamento tem pagamentos vinculados' })
  remove(@Param('id') id: string) {
    return this.paymentService.removePaymentMethod(id);
  }
}
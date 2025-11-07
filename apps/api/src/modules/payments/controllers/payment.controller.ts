import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { PaymentService } from '../services/payment.service';
import { CreatePaymentMethodDto } from '../dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from '../dto/update-payment-method.dto';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { ProcessPaymentDto } from '../dto/process-payment.dto';
import { PaymentMethod, Payment } from '@prisma/client';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // ============================================
  // PAYMENT METHODS ROUTES
  // ============================================

  @Post('methods')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar nova forma de pagamento',
    description: 'Cria uma nova forma de pagamento para o estabelecimento',
  })
  @ApiResponse({
    status: 201,
    description: 'Forma de pagamento criada com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  @ApiBody({ type: CreatePaymentMethodDto })
  async createPaymentMethod(
    @Body() createPaymentMethodDto: CreatePaymentMethodDto,
  ): Promise<PaymentMethod> {
    return this.paymentService.createPaymentMethod(createPaymentMethodDto);
  }

  @Get('methods')
  @ApiOperation({
    summary: 'Listar todas as formas de pagamento',
    description: 'Retorna todas as formas de pagamento de um estabelecimento',
  })
  @ApiQuery({
    name: 'establishmentId',
    required: true,
    description: 'ID do estabelecimento',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de formas de pagamento retornada com sucesso',
    type: [Object],
  })
  async findAllPaymentMethods(
    @Query('establishmentId') establishmentId: string,
  ): Promise<PaymentMethod[]> {
    return this.paymentService.findAllPaymentMethods(establishmentId);
  }

  @Get('methods/active')
  @ApiOperation({
    summary: 'Listar formas de pagamento ativas',
    description: 'Retorna apenas as formas de pagamento ativas de um estabelecimento',
  })
  @ApiQuery({
    name: 'establishmentId',
    required: true,
    description: 'ID do estabelecimento',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de formas de pagamento ativas retornada com sucesso',
  })
  async findActivePaymentMethods(
    @Query('establishmentId') establishmentId: string,
  ): Promise<PaymentMethod[]> {
    return this.paymentService.findActivePaymentMethods(establishmentId);
  }

  @Get('methods/:id')
  @ApiOperation({
    summary: 'Buscar forma de pagamento por ID',
    description: 'Retorna os detalhes de uma forma de pagamento específica',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da forma de pagamento',
  })
  @ApiResponse({
    status: 200,
    description: 'Forma de pagamento encontrada',
  })
  @ApiResponse({
    status: 404,
    description: 'Forma de pagamento não encontrada',
  })
  async findOnePaymentMethod(@Param('id') id: string): Promise<PaymentMethod> {
    return this.paymentService.findOnePaymentMethod(id);
  }

  @Put('methods/:id')
  @ApiOperation({
    summary: 'Atualizar forma de pagamento',
    description: 'Atualiza os dados de uma forma de pagamento existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da forma de pagamento',
    type: String,
  })
  @ApiBody({ type: UpdatePaymentMethodDto })
  @ApiResponse({
    status: 200,
    description: 'Forma de pagamento atualizada com sucesso',
    type: Object,
  })
  @ApiResponse({
    status: 404,
    description: 'Forma de pagamento não encontrada',
  })
  async updatePaymentMethod(
    @Param('id') id: string,
    @Body() updatePaymentMethodDto: UpdatePaymentMethodDto,
  ): Promise<PaymentMethod> {
    return this.paymentService.updatePaymentMethod(id, updatePaymentMethodDto);
  }

  @Patch('methods/:id/toggle')
  @ApiOperation({
    summary: 'Ativar/Desativar forma de pagamento',
    description: 'Alterna o status ativo/inativo de uma forma de pagamento',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da forma de pagamento',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Status alterado com sucesso',
    type: Object,
  })
  @ApiResponse({
    status: 404,
    description: 'Forma de pagamento não encontrada',
  })
  async togglePaymentMethod(@Param('id') id: string): Promise<PaymentMethod> {
    return this.paymentService.togglePaymentMethod(id);
  }

  @Delete('methods/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remover forma de pagamento',
    description: 'Remove uma forma de pagamento do sistema',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da forma de pagamento',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'Forma de pagamento removida com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Forma de pagamento não encontrada',
  })
  @ApiResponse({
    status: 400,
    description: 'Não é possível excluir forma de pagamento com pagamentos vinculados',
  })
  async removePaymentMethod(@Param('id') id: string): Promise<void> {
    return this.paymentService.removePaymentMethod(id);
  }

  // ============================================
  // PAYMENTS ROUTES
  // ============================================

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar novo pagamento',
    description: 'Registra um novo pagamento para uma venda',
  })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({
    status: 201,
    description: 'Pagamento criado com sucesso',
    type: Object,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou valor ultrapassa o total da venda',
  })
  @ApiResponse({
    status: 404,
    description: 'Venda ou forma de pagamento não encontrada',
  })
  async createPayment(
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<Payment> {
    return this.paymentService.createPayment(createPaymentDto);
  }

  @Post('process/:orderId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Processar pagamento de pedido',
    description: 'Processa múltiplos pagamentos para um pedido e cria/atualiza a venda correspondente',
  })
  @ApiParam({
    name: 'orderId',
    description: 'ID do pedido',
    type: String,
  })
  @ApiBody({ type: ProcessPaymentDto })
  @ApiResponse({
    status: 201,
    description: 'Pagamentos processados com sucesso',
    type: [Object],
  })
  @ApiResponse({
    status: 400,
    description: 'Total dos pagamentos não corresponde ao total do pedido',
  })
  @ApiResponse({
    status: 404,
    description: 'Pedido não encontrado',
  })
  async processPayment(
    @Param('orderId') orderId: string,
    @Body() processPaymentDto: ProcessPaymentDto,
  ): Promise<Payment[]> {
    return this.paymentService.processPayment(orderId, processPaymentDto);
  }

  @Get('sale/:saleId')
  @ApiOperation({
    summary: 'Listar pagamentos de uma venda',
    description: 'Retorna todos os pagamentos relacionados a uma venda específica',
  })
  @ApiParam({
    name: 'saleId',
    description: 'ID da venda',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de pagamentos retornada com sucesso',
    type: [Object],
  })
  async findPaymentsBySale(@Param('saleId') saleId: string): Promise<Payment[]> {
    return this.paymentService.findPaymentsBySale(saleId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar pagamento por ID',
    description: 'Retorna os detalhes de um pagamento específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do pagamento',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Pagamento encontrado',
    type: Object,
  })
  @ApiResponse({
    status: 404,
    description: 'Pagamento não encontrado',
  })
  async findOnePayment(@Param('id') id: string): Promise<Payment> {
    return this.paymentService.findOnePayment(id);
  }

  @Post(':id/refund')
  @ApiOperation({
    summary: 'Estornar pagamento',
    description: 'Realiza o estorno de um pagamento confirmado',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do pagamento',
    type: String,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          description: 'Motivo do estorno',
          example: 'Produto com defeito',
        },
      },
      required: ['reason'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Pagamento estornado com sucesso',
    type: Object,
  })
  @ApiResponse({
    status: 400,
    description: 'Apenas pagamentos confirmados podem ser estornados',
  })
  @ApiResponse({
    status: 404,
    description: 'Pagamento não encontrado',
  })
  async refundPayment(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ): Promise<Payment> {
    return this.paymentService.refundPayment(id, reason);
  }
}

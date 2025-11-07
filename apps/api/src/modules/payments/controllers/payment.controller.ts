import {
  Controller,
  Get,
  Post,
  Body,
  Param,
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
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { ProcessPaymentDto } from '../dto/process-payment.dto';
import { RefundPaymentDto } from '../dto/refund-payment.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER)
  @ApiOperation({ summary: 'Criar pagamento individual' })
  @ApiResponse({ status: 201, description: 'Pagamento criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Valor excede total da venda' })
  create(@Body() createDto: CreatePaymentDto) {
    return this.paymentService.createPayment(createDto);
  }

  @Post('process/:orderId')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER)
  @ApiOperation({ summary: 'Processar pagamento completo do pedido' })
  @ApiParam({ name: 'orderId', description: 'ID do pedido' })
  @ApiResponse({
    status: 201,
    description: 'Pagamentos processados com sucesso',
    schema: {
      example: [
        {
          id: 'uuid',
          saleId: 'uuid',
          paymentMethodId: 'uuid',
          amount: 50.00,
          status: 'PAID',
        },
      ],
    },
  })
  @ApiResponse({ status: 400, description: 'Total dos pagamentos não corresponde ao pedido' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  processPayment(
    @Param('orderId') orderId: string,
    @Body() processDto: ProcessPaymentDto,
  ) {
    return this.paymentService.processPayment(orderId, processDto);
  }

  @Get('sale/:saleId')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER)
  @ApiOperation({ summary: 'Listar pagamentos de uma venda' })
  @ApiParam({ name: 'saleId', description: 'ID da venda' })
  @ApiResponse({ status: 200, description: 'Lista de pagamentos da venda' })
  findBySale(@Param('saleId') saleId: string) {
    return this.paymentService.findPaymentsBySale(saleId);
  }

  @Get(':id')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER)
  @ApiOperation({ summary: 'Buscar pagamento por ID' })
  @ApiParam({ name: 'id', description: 'ID do pagamento' })
  @ApiResponse({ status: 200, description: 'Pagamento encontrado' })
  @ApiResponse({ status: 404, description: 'Pagamento não encontrado' })
  findOne(@Param('id') id: string) {
    return this.paymentService.findOnePayment(id);
  }

  @Post(':id/refund')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Estornar pagamento' })
  @ApiParam({ name: 'id', description: 'ID do pagamento' })
  @ApiResponse({ status: 200, description: 'Pagamento estornado com sucesso' })
  @ApiResponse({ status: 400, description: 'Apenas pagamentos confirmados podem ser estornados' })
  refund(@Param('id') id: string, @Body() refundDto: RefundPaymentDto) {
    return this.paymentService.refundPayment(id, refundDto.reason);
  }
}
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
  ApiQuery,
} from '@nestjs/swagger';
import { OrderService } from '../services/order.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { FilterOrderDto } from '../dto/filter-order.dto';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { CancelOrderDto } from '../dto/cancel-order.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { UserRole, OrderStatus } from '@prisma/client';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER, UserRole.CASHIER)
  @ApiOperation({ summary: 'Criar novo pedido' })
  @ApiResponse({ status: 201, description: 'Pedido criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'Pedido externo já cadastrado' })
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @Get()
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER, UserRole.CASHIER)
  @ApiOperation({ summary: 'Listar pedidos com filtros e paginação' })
  @ApiResponse({ status: 200, description: 'Lista de pedidos retornada com sucesso' })
  findAll(@Query() filters: FilterOrderDto) {
    return this.orderService.findAll(filters);
  }

  @Get('status/:establishmentId/:status')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER, UserRole.KITCHEN)
  @ApiOperation({ summary: 'Listar pedidos por status' })
  @ApiParam({ name: 'establishmentId', description: 'ID do estabelecimento' })
  @ApiParam({ name: 'status', enum: OrderStatus, description: 'Status do pedido' })
  @ApiResponse({ status: 200, description: 'Lista de pedidos por status' })
  findByStatus(
    @Param('establishmentId') establishmentId: string,
    @Param('status') status: OrderStatus,
  ) {
    return this.orderService.getOrdersByStatus(establishmentId, status);
  }

  @Get('table/:tableId')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER)
  @ApiOperation({ summary: 'Listar pedidos de uma mesa' })
  @ApiParam({ name: 'tableId', description: 'ID da mesa' })
  @ApiResponse({ status: 200, description: 'Lista de pedidos da mesa' })
  findByTable(@Param('tableId') tableId: string) {
    return this.orderService.getOrdersByTable(tableId);
  }

  @Get('my-orders')
  @ApiOperation({ summary: 'Listar meus pedidos (cliente)' })
  @ApiResponse({ status: 200, description: 'Lista de pedidos do cliente' })
  findMyOrders(@CurrentUser('id') userId: string) {
    // Assumindo que o customer está vinculado ao user
    return this.orderService.findAll({ customerId: userId } as any);
  }

  @Get(':id')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER, UserRole.CASHIER, UserRole.KITCHEN)
  @ApiOperation({ summary: 'Buscar pedido por ID' })
  @ApiParam({ name: 'id', description: 'ID do pedido' })
  @ApiResponse({ status: 200, description: 'Pedido encontrado' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER)
  @ApiOperation({ summary: 'Atualizar pedido' })
  @ApiParam({ name: 'id', description: 'ID do pedido' })
  @ApiResponse({ status: 200, description: 'Pedido atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(id, updateOrderDto);
  }

  @Patch(':id/status')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER, UserRole.KITCHEN)
  @ApiOperation({ summary: 'Atualizar status do pedido' })
  @ApiParam({ name: 'id', description: 'ID do pedido' })
  @ApiResponse({ status: 200, description: 'Status atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Transição de status inválida' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateStatus(id, updateStatusDto);
  }

  @Post(':id/confirm')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER, UserRole.CASHIER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirmar pedido' })
  @ApiParam({ name: 'id', description: 'ID do pedido' })
  @ApiResponse({ status: 200, description: 'Pedido confirmado com sucesso' })
  confirmOrder(@Param('id') id: string) {
    return this.orderService.updateStatus(id, {
      status: OrderStatus.CONFIRMED,
      notes: 'Pedido confirmado',
    });
  }

  @Post(':id/prepare')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.KITCHEN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar preparo do pedido' })
  @ApiParam({ name: 'id', description: 'ID do pedido' })
  @ApiResponse({ status: 200, description: 'Preparo iniciado' })
  startPreparing(@Param('id') id: string) {
    return this.orderService.updateStatus(id, {
      status: OrderStatus.PREPARING,
      notes: 'Pedido em preparo',
    });
  }

  @Post(':id/ready')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.KITCHEN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marcar pedido como pronto' })
  @ApiParam({ name: 'id', description: 'ID do pedido' })
  @ApiResponse({ status: 200, description: 'Pedido pronto' })
  markAsReady(@Param('id') id: string) {
    return this.orderService.updateStatus(id, {
      status: OrderStatus.READY,
      notes: 'Pedido pronto',
    });
  }

  @Post(':id/deliver')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER, UserRole.DELIVERY)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marcar pedido como em entrega' })
  @ApiParam({ name: 'id', description: 'ID do pedido' })
  @ApiResponse({ status: 200, description: 'Pedido saiu para entrega' })
  startDelivery(@Param('id') id: string) {
    return this.orderService.updateStatus(id, {
      status: OrderStatus.DELIVERING,
      notes: 'Pedido saiu para entrega',
    });
  }

  @Post(':id/complete')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER, UserRole.DELIVERY)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Completar pedido' })
  @ApiParam({ name: 'id', description: 'ID do pedido' })
  @ApiResponse({ status: 200, description: 'Pedido completado' })
  completeOrder(@Param('id') id: string) {
    return this.orderService.updateStatus(id, {
      status: OrderStatus.COMPLETED,
      notes: 'Pedido completado',
    });
  }

  @Post(':id/cancel')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancelar pedido' })
  @ApiParam({ name: 'id', description: 'ID do pedido' })
  @ApiResponse({ status: 200, description: 'Pedido cancelado com sucesso' })
  @ApiResponse({ status: 400, description: 'Não é possível cancelar pedido completado' })
  cancelOrder(@Param('id') id: string, @Body() cancelDto: CancelOrderDto) {
    return this.orderService.cancel(id, cancelDto.reason);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar pedido' })
  @ApiParam({ name: 'id', description: 'ID do pedido' })
  @ApiResponse({ status: 204, description: 'Pedido deletado com sucesso' })
  @ApiResponse({ status: 400, description: 'Apenas pedidos cancelados podem ser deletados' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  remove(@Param('id') id: string) {
    return this.orderService.remove(id);
  }

  // ============================================
  // ROTAS PÚBLICAS (para cardápio online)
  // ============================================

  @Public()
  @Post('public/create')
  @ApiOperation({ summary: 'Criar pedido público (cardápio online)' })
  @ApiResponse({ status: 201, description: 'Pedido criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  createPublicOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @Public()
  @Get('public/track/:id')
  @ApiOperation({ summary: 'Rastrear pedido público' })
  @ApiParam({ name: 'id', description: 'ID do pedido' })
  @ApiResponse({ status: 200, description: 'Informações do pedido' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  trackOrder(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  // ============================================
  // WEBHOOKS (integrações externas)
  // ============================================

  @Public()
  @Post('webhook/ifood')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook iFood' })
  @ApiResponse({ status: 200, description: 'Webhook processado' })
  async ifoodWebhook(@Body() data: any) {
    // TODO: Processar webhook do iFood
    // Criar pedido automaticamente ou atualizar status
    console.log('iFood webhook received:', data);
    return { success: true, message: 'Webhook processado' };
  }

  @Public()
  @Post('webhook/rappi')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook Rappi' })
  @ApiResponse({ status: 200, description: 'Webhook processado' })
  async rappiWebhook(@Body() data: any) {
    // TODO: Processar webhook do Rappi
    console.log('Rappi webhook received:', data);
    return { success: true, message: 'Webhook processado' };
  }
}
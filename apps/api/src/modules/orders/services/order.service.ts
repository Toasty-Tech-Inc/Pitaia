import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Order, OrderStatus, Prisma } from '@prisma/client';
import { OrderRepository } from '../repositories/order.repository';
import { IOrderService } from '../contracts/order-service.interface';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { FilterOrderDto } from '../dto/filter-order.dto';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { IPaginatedResult } from '../../../common/contracts/base-repository.interface';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class OrderService implements IOrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const { items, ...orderData } = createOrderDto;

    // Validar se há itens
    if (!items || items.length === 0) {
      throw new BadRequestException('Pedido deve conter ao menos um item');
    }

    // Verificar se external ID já existe
    if (createOrderDto.externalId) {
      const existingOrder = await this.orderRepository.findByExternalId(
        createOrderDto.externalId,
      );
      if (existingOrder) {
        throw new ConflictException('Pedido externo já cadastrado');
      }
    }

    // Obter próximo número do pedido
    const orderNumber = await this.orderRepository.getNextOrderNumber(
      createOrderDto.establishmentId,
      new Date(),
    );

    // Calcular valores
    let subtotal = new Prisma.Decimal(0);
    const orderItems = items.map((item) => {
      const itemSubtotal = new Prisma.Decimal(item.unitPrice).mul(
        item.quantity,
      );
      const itemDiscount = new Prisma.Decimal(item.discount || 0);
      const itemTotal = itemSubtotal.sub(itemDiscount);

      subtotal = subtotal.add(itemSubtotal);

      return {
        productId: item.productId,
        quantity: new Prisma.Decimal(item.quantity),
        unitPrice: new Prisma.Decimal(item.unitPrice),
        subtotal: itemSubtotal,
        discount: itemDiscount,
        total: itemTotal,
        modifiers: item.modifiers || null,
        notes: item.notes,
      };
    });

    const discount = new Prisma.Decimal(orderData.discount || 0);
    const deliveryFee = new Prisma.Decimal(orderData.deliveryFee || 0);
    const serviceFee = new Prisma.Decimal(orderData.serviceFee || 0);
    const total = subtotal.sub(discount).add(deliveryFee).add(serviceFee);

    // Criar pedido com itens
    const order = await this.prisma.order.create({
      data: {
        ...orderData,
        orderNumber,
        subtotal,
        discount,
        deliveryFee,
        serviceFee,
        total,
        status: OrderStatus.PENDING,
        items: {
          create: orderItems,
        },
        statusHistory: {
          create: {
            status: OrderStatus.PENDING,
            notes: 'Pedido criado',
          },
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return order;
  }

  async findAll(filters: FilterOrderDto): Promise<IPaginatedResult<Order>> {
    const {
      establishmentId,
      customerId,
      waiterId,
      tableId,
      status,
      type,
      source,
      startDate,
      endDate,
      search,
      ...pagination
    } = filters;

    const where: any = {};

    if (establishmentId) {
      where.establishmentId = establishmentId;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (waiterId) {
      where.waiterId = waiterId;
    }

    if (tableId) {
      where.tableId = tableId;
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (source) {
      where.source = source;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    if (search) {
      where.OR = [
        { orderNumber: { equals: parseInt(search) || 0 } },
        { externalId: { contains: search } },
        { notes: { contains: search, mode: 'insensitive' } },
        {
          customer: {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search } },
            ],
          },
        },
      ];
    }

    return this.orderRepository.paginate({
      ...pagination,
      ...where,
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    await this.findOne(id);
    return this.orderRepository.update(id, updateOrderDto);
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const order = await this.findOne(id);

    // Validar transições de status
    this.validateStatusTransition(order.status, updateStatusDto.status);

    // Atualizar status
    const updatedOrder = await this.orderRepository.updateStatus(
      id,
      updateStatusDto.status,
      updateStatusDto.notes,
    );

    // Se completado, atualizar deliveryTime
    if (updateStatusDto.status === OrderStatus.COMPLETED) {
      await this.orderRepository.update(id, {
        deliveryTime: new Date(),
      });
    }

    return updatedOrder;
  }

  async cancel(id: string, reason: string): Promise<Order> {
    const order = await this.findOne(id);

    if (order.status === OrderStatus.COMPLETED) {
      throw new BadRequestException('Não é possível cancelar pedido já completado');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Pedido já está cancelado');
    }

    return this.orderRepository.updateStatus(id, OrderStatus.CANCELLED, reason);
  }

  async remove(id: string): Promise<void> {
    const order = await this.findOne(id);

    if (order.status !== OrderStatus.CANCELLED) {
      throw new BadRequestException(
        'Apenas pedidos cancelados podem ser deletados',
      );
    }

    await this.orderRepository.delete(id);
  }

  async getOrdersByStatus(
    establishmentId: string,
    status: OrderStatus,
  ): Promise<Order[]> {
    return this.orderRepository.findByStatus(establishmentId, status);
  }

  async getOrdersByTable(tableId: string): Promise<Order[]> {
    return this.orderRepository.findByTable(tableId);
  }

  private validateStatusTransition(
    currentStatus: OrderStatus,
    newStatus: OrderStatus,
  ): void {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [
        OrderStatus.CONFIRMED,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.CONFIRMED]: [
        OrderStatus.PREPARING,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.PREPARING]: [
        OrderStatus.READY,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.READY]: [
        OrderStatus.DELIVERING,
        OrderStatus.COMPLETED,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.DELIVERING]: [
        OrderStatus.COMPLETED,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.COMPLETED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Transição de status inválida: ${currentStatus} -> ${newStatus}`,
      );
    }
  }
}
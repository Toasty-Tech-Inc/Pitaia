import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { OrderService } from "../services/order.service";
import { CreateOrderDto } from "../dto/create-order.dto";

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
    constructor(
        private readonly orderService: OrderService
    ) {}

    @Post()
    @ApiOperation({ summary: 'Create a new order'})
    @ApiResponse({ status: 201, description: 'Order created successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 409, description: 'Conflict' })
    create(@Body() CreateOrderDto: CreateOrderDto) {
        return this.orderService.create(CreateOrderDto);
    }
}
import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(
    @Body()
    body: {
      gameId: string;
      productId: string;
      paymentMethodCode: string;
      playerData: Record<string, string>;
    },
    @Headers('x-idempotency-key') idempotencyKey?: string,
  ) {
    return this.ordersService.createOrder({
      ...body,
      idempotencyKey,
    });
  }

  @Get('admin/stats')
  async getStats() {
    return this.ordersService.getAdminStats();
  }

  @Get('admin/all')
  async getAll() {
    return this.ordersService.getAllOrders();
  }

  @Get('tracking/:orderNumber')
  async findByOrderNumber(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.getOrderByNumber(orderNumber);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ordersService.getOrderById(id);
  }
}
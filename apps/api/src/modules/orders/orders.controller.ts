import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  createOrderSchema,
  orderListQuerySchema,
  updateOrderStatusSchema,
  type CreateOrder,
  type OrderListQuery,
  type UpdateOrderStatus,
} from '@rocket/shared';
import { ParseObjectIdPipe, ZodValidationPipe } from '../../common';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@ApiCookieAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List orders (paginated, filtered, searchable)' })
  list(
    @Query(new ZodValidationPipe(orderListQuerySchema)) query: OrderListQuery,
  ) {
    return this.orders.list(query);
  }

  @Get('counts')
  @ApiOperation({ summary: 'Order counts per status' })
  counts() {
    return this.orders.counts();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an order by id' })
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.orders.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create an order' })
  create(@Body(new ZodValidationPipe(createOrderSchema)) dto: CreateOrder) {
    return this.orders.create(dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update an order status' })
  updateStatus(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body(new ZodValidationPipe(updateOrderStatusSchema)) dto: UpdateOrderStatus,
  ) {
    return this.orders.updateStatus(id, dto);
  }
}

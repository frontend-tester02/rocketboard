import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  OrderStatus,
  type CreateOrder,
  type OrderCounts,
  type OrderListQuery,
  type UpdateOrderStatus,
} from '@rocket/shared';
import { FilterQuery, Model } from 'mongoose';
import { paginate } from '../../common';
import { Order } from './schemas/order.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
  ) {}

  list(query: OrderListQuery) {
    const filter: FilterQuery<Order> = {};
    if (query.status) filter.status = query.status;
    if (query.paymentType) filter.paymentType = query.paymentType;
    if (query.dateFrom || query.dateTo) {
      const createdAt: Record<string, Date> = {};
      if (query.dateFrom) createdAt.$gte = query.dateFrom;
      if (query.dateTo) createdAt.$lte = query.dateTo;
      filter.createdAt = createdAt;
    }
    return paginate(this.orderModel, query, filter, {
      searchFields: ['orderNo', 'customerName'],
    });
  }

  async counts(): Promise<OrderCounts> {
    const statuses = Object.values(OrderStatus);
    const [all, ...perStatus] = await Promise.all([
      this.orderModel.countDocuments().exec(),
      ...statuses.map((s) => this.orderModel.countDocuments({ status: s }).exec()),
    ]);
    const counts = { all } as OrderCounts;
    statuses.forEach((s, i) => {
      counts[s] = perStatus[i] ?? 0;
    });
    return counts;
  }

  async findById(id: string) {
    const order = await this.orderModel.findById(id).exec();
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async create(data: CreateOrder) {
    const subtotal = data.items.reduce(
      (sum, item) => sum + item.price * item.qty,
      0,
    );
    const tax = data.tax ?? 0;
    const total = subtotal + tax;
    const now = new Date();

    return this.orderModel.create({
      orderNo: await this.generateOrderNo(),
      customer: data.customer,
      customerName: data.customerName,
      items: data.items,
      subtotal,
      tax,
      total,
      paymentType: data.paymentType,
      status: data.status,
      history: [{ status: data.status, at: now }],
    });
  }

  async updateStatus(id: string, data: UpdateOrderStatus) {
    const order = await this.orderModel
      .findByIdAndUpdate(
        id,
        {
          $set: { status: data.status },
          $push: {
            history: { status: data.status, at: new Date(), note: data.note },
          },
        },
        { new: true },
      )
      .exec();
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  /** Generate a unique, human-friendly order number (retries on collision). */
  private async generateOrderNo(): Promise<string> {
    for (let i = 0; i < 5; i++) {
      const candidate = `#${100000 + Math.floor(Math.random() * 899999)}`;
      const exists = await this.orderModel
        .exists({ orderNo: candidate })
        .exec();
      if (!exists) return candidate;
    }
    return `#${Date.now().toString().slice(-6)}`;
  }
}

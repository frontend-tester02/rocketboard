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
import PDFDocument from 'pdfkit';
import { paginate } from '../../common';
import { Order, type OrderDocument } from './schemas/order.schema';

const money = (n: number) => `$${n.toFixed(2)}`;

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

  /** Build an invoice PDF document for an order (caller pipes + ends it). */
  async buildInvoice(id: string): Promise<PDFKit.PDFDocument> {
    const order = await this.findById(id);
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Header
    doc.fontSize(22).fillColor('#3E4DF5').text('Rocket Inc.', { continued: false });
    doc.fontSize(10).fillColor('#9AA3B2').text('123 Market Street, San Francisco, CA');
    doc.moveDown(0.5);
    doc
      .fontSize(26)
      .fillColor('#111827')
      .text('INVOICE', { align: 'right' });
    doc
      .fontSize(10)
      .fillColor('#6B7280')
      .text(`Order ${order.orderNo}`, { align: 'right' })
      .text(
        `Date: ${new Date((order as OrderDocument & { createdAt?: Date }).createdAt ?? Date.now()).toLocaleDateString()}`,
        { align: 'right' },
      )
      .text(`Status: ${order.status}`, { align: 'right' });

    doc.moveDown(1.5);

    // Bill to
    doc.fontSize(11).fillColor('#111827').text('Bill To:');
    doc.fontSize(11).fillColor('#374151').text(order.customerName);
    doc.moveDown(1);

    // Table header
    const top = doc.y;
    const cols = { name: 50, qty: 320, price: 390, total: 480 };
    doc.fontSize(10).fillColor('#6B7280');
    doc.text('Product', cols.name, top);
    doc.text('Qty', cols.qty, top);
    doc.text('Price', cols.price, top);
    doc.text('Total', cols.total, top);
    doc
      .moveTo(50, top + 15)
      .lineTo(545, top + 15)
      .strokeColor('#E5E7EB')
      .stroke();

    let y = top + 25;
    doc.fillColor('#111827');
    for (const item of order.items) {
      doc.fontSize(10).text(item.name, cols.name, y, { width: 250 });
      doc.text(String(item.qty), cols.qty, y);
      doc.text(money(item.price), cols.price, y);
      doc.text(money(item.price * item.qty), cols.total, y);
      y += 22;
    }

    doc.moveTo(50, y + 5).lineTo(545, y + 5).strokeColor('#E5E7EB').stroke();
    y += 15;

    // Totals
    doc.fontSize(10).fillColor('#6B7280');
    doc.text('Subtotal', cols.price, y);
    doc.fillColor('#111827').text(money(order.subtotal), cols.total, y);
    y += 18;
    doc.fillColor('#6B7280').text('Tax', cols.price, y);
    doc.fillColor('#111827').text(money(order.tax), cols.total, y);
    y += 20;
    doc.fontSize(12).fillColor('#111827').text('Total', cols.price, y);
    doc.fontSize(12).fillColor('#3E4DF5').text(money(order.total), cols.total, y);

    doc.moveDown(4);
    doc
      .fontSize(9)
      .fillColor('#9AA3B2')
      .text('Thank you for your business.', 50, 760, { align: 'center', width: 495 });

    return doc;
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

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ExportFormat } from '@rocket/shared';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { FilterQuery, Model } from 'mongoose';
import { Contact } from '../contacts/schemas/contact.schema';
import { Customer } from '../customers/schemas/customer.schema';
import { Order } from '../orders/schemas/order.schema';
import { Product } from '../products/schemas/product.schema';

type Row = Record<string, unknown>;

interface Column {
  header: string;
  key: string;
  width?: number;
}

export interface ExportQuery {
  search?: string;
  status?: string;
  favorite?: boolean;
}

export interface ExportFile {
  buffer: Buffer;
  filename: string;
  contentType: string;
}

/** Hard cap; beyond this the roadmap offloads to a BullMQ job + notification. */
const MAX_SYNC_ROWS = 5000;

@Injectable()
export class ExportService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    @InjectModel(Customer.name) private readonly customerModel: Model<Customer>,
    @InjectModel(Contact.name) private readonly contactModel: Model<Contact>,
  ) {}

  async export(resource: string, format: ExportFormat, query: ExportQuery): Promise<ExportFile> {
    const { columns, rows } = await this.collect(resource, query);
    const base = `${resource}-${new Date().toISOString().slice(0, 10)}`;

    if (format === ExportFormat.Csv) {
      return { buffer: this.toCsv(columns, rows), filename: `${base}.csv`, contentType: 'text/csv' };
    }
    if (format === ExportFormat.Xlsx) {
      return {
        buffer: await this.toXlsx(resource, columns, rows),
        filename: `${base}.xlsx`,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };
    }
    return {
      buffer: await this.toPdf(resource, columns, rows),
      filename: `${base}.pdf`,
      contentType: 'application/pdf',
    };
  }

  private async collect(resource: string, q: ExportQuery): Promise<{ columns: Column[]; rows: Row[] }> {
    const rx = q.search
      ? new RegExp(q.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      : undefined;

    switch (resource) {
      case 'products': {
        const filter: FilterQuery<Product> = {};
        if (rx) filter.$or = [{ name: rx }, { sku: rx }];
        if (q.status) filter.status = q.status;
        const docs = await this.productModel.find(filter).limit(MAX_SYNC_ROWS).lean().exec();
        return {
          columns: [
            { header: 'Name', key: 'name', width: 32 },
            { header: 'SKU', key: 'sku', width: 18 },
            { header: 'Price', key: 'price', width: 12 },
            { header: 'Stock', key: 'stock', width: 10 },
            { header: 'Status', key: 'status', width: 14 },
          ],
          rows: docs as Row[],
        };
      }
      case 'orders': {
        const filter: FilterQuery<Order> = {};
        if (rx) filter.$or = [{ orderNo: rx }, { customerName: rx }];
        if (q.status) filter.status = q.status;
        const docs = await this.orderModel.find(filter).limit(MAX_SYNC_ROWS).lean().exec();
        return {
          columns: [
            { header: 'Order No', key: 'orderNo', width: 16 },
            { header: 'Customer', key: 'customerName', width: 28 },
            { header: 'Total', key: 'total', width: 12 },
            { header: 'Payment', key: 'paymentType', width: 16 },
            { header: 'Status', key: 'status', width: 14 },
          ],
          rows: docs as Row[],
        };
      }
      case 'customers': {
        const filter: FilterQuery<Customer> = {};
        if (rx) filter.$or = [{ firstName: rx }, { lastName: rx }, { email: rx }];
        const docs = await this.customerModel.find(filter).limit(MAX_SYNC_ROWS).lean().exec();
        return {
          columns: [
            { header: 'First Name', key: 'firstName', width: 20 },
            { header: 'Last Name', key: 'lastName', width: 20 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Phone', key: 'phone', width: 18 },
            { header: 'Orders', key: 'ordersCount', width: 10 },
            { header: 'Total Spent', key: 'totalSpent', width: 14 },
          ],
          rows: docs as Row[],
        };
      }
      case 'contacts': {
        const filter: FilterQuery<Contact> = {};
        if (rx) filter.$or = [{ firstName: rx }, { lastName: rx }, { email: rx }, { company: rx }];
        if (q.favorite) filter.isFavorite = true;
        const docs = await this.contactModel.find(filter).limit(MAX_SYNC_ROWS).lean().exec();
        return {
          columns: [
            { header: 'First Name', key: 'firstName', width: 20 },
            { header: 'Last Name', key: 'lastName', width: 20 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Phone', key: 'phone', width: 18 },
            { header: 'Company', key: 'company', width: 24 },
            { header: 'Job Title', key: 'jobTitle', width: 22 },
          ],
          rows: docs as Row[],
        };
      }
      default:
        throw new BadRequestException(`Unknown export resource: ${resource}`);
    }
  }

  private cell(row: Row, key: string): string {
    const v = row[key];
    if (v === undefined || v === null) return '';
    return String(v);
  }

  private toCsv(columns: Column[], rows: Row[]): Buffer {
    const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const head = columns.map((c) => esc(c.header)).join(',');
    const body = rows.map((r) => columns.map((c) => esc(this.cell(r, c.key))).join(',')).join('\n');
    return Buffer.from(`${head}\n${body}`, 'utf8');
  }

  private async toXlsx(resource: string, columns: Column[], rows: Row[]): Promise<Buffer> {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet(resource);
    ws.columns = columns.map((c) => ({ header: c.header, key: c.key, width: c.width ?? 18 }));
    ws.getRow(1).font = { bold: true };
    for (const r of rows) {
      ws.addRow(Object.fromEntries(columns.map((c) => [c.key, r[c.key] ?? ''])));
    }
    const out = await wb.xlsx.writeBuffer();
    return Buffer.from(out);
  }

  private toPdf(resource: string, columns: Column[], rows: Row[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 36, size: 'A4', layout: 'landscape' });
      const chunks: Buffer[] = [];
      doc.on('data', (c: Buffer) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const title = resource.charAt(0).toUpperCase() + resource.slice(1);
      doc.fontSize(16).text(title, { align: 'left' });
      doc.moveDown(0.5);
      doc.fontSize(9).fillColor('#666').text(`Generated ${new Date().toLocaleString()}`);
      doc.moveDown(0.8).fillColor('#000');

      const totalWidth = columns.reduce((s, c) => s + (c.width ?? 18), 0);
      const pageWidth = doc.page.width - 72;
      const colX: number[] = [];
      let x = 36;
      for (const c of columns) {
        colX.push(x);
        x += ((c.width ?? 18) / totalWidth) * pageWidth;
      }
      const colW = columns.map((c, i) =>
        (i < columns.length - 1 ? colX[i + 1]! : 36 + pageWidth) - colX[i]!,
      );

      const drawRow = (values: string[], bold: boolean) => {
        const y = doc.y;
        doc.fontSize(9).font(bold ? 'Helvetica-Bold' : 'Helvetica');
        values.forEach((v, i) => {
          doc.text(v, colX[i]! + 2, y, { width: colW[i]! - 4, ellipsis: true });
        });
        doc.moveDown(0.4);
      };

      drawRow(columns.map((c) => c.header), true);
      doc.moveTo(36, doc.y).lineTo(36 + pageWidth, doc.y).strokeColor('#ccc').stroke();
      doc.moveDown(0.3);

      for (const r of rows) {
        if (doc.y > doc.page.height - 48) doc.addPage();
        drawRow(columns.map((c) => this.cell(r, c.key)), false);
      }

      doc.end();
    });
  }
}

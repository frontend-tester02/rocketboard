/**
 * Seed script for the E-Commerce catalog: a handful of categories and ~100
 * products. Run with `pnpm --filter @rocket/api seed`.
 *
 * It boots a standalone Nest application context (so it reuses the configured
 * Mongoose connection and env validation), wipes the products + categories
 * collections, then inserts fresh data.
 */
import { getModelToken } from '@nestjs/mongoose';
import { NestFactory } from '@nestjs/core';
import { OrderStatus, PaymentType, ProductStatus } from '@rocket/shared';
import type { Model } from 'mongoose';
import { AppModule } from './app.module';
import { Category } from './modules/categories/schemas/category.schema';
import { Order } from './modules/orders/schemas/order.schema';
import { Product } from './modules/products/schemas/product.schema';

const CATEGORIES = [
  'Electronics',
  'Fashion',
  'Home & Living',
  'Beauty',
  'Sports',
  'Toys',
];

const ADJECTIVES = [
  'Premium', 'Classic', 'Modern', 'Wireless', 'Smart', 'Eco', 'Deluxe',
  'Compact', 'Pro', 'Ultra', 'Vintage', 'Portable',
];
const NOUNS = [
  'Headphones', 'Backpack', 'Sneakers', 'Watch', 'Lamp', 'Blender',
  'Keyboard', 'Jacket', 'Bottle', 'Camera', 'Speaker', 'Chair',
  'Sunglasses', 'Wallet', 'Mug', 'Drone',
];
const TAG_POOL = ['new', 'sale', 'popular', 'limited', 'eco', 'bestseller'];
const CUSTOMER_NAMES = [
  'Regina Cooper', 'Robert Edwards', 'Gloria Mckinney', 'Randall Fisher',
  'Judith Black', 'Philip Henry', 'Devon Williamson', 'Debra Wilson',
  'Mitchel Cooper', 'Felecia Brown', 'Marcus Reid', 'Hilda Barnes',
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[rand(0, arr.length - 1)]!;
}

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  const categoryModel = app.get<Model<Category>>(getModelToken(Category.name));
  const productModel = app.get<Model<Product>>(getModelToken(Product.name));
  const orderModel = app.get<Model<Order>>(getModelToken(Order.name));

  await Promise.all([
    productModel.deleteMany({}).exec(),
    categoryModel.deleteMany({}).exec(),
    orderModel.deleteMany({}).exec(),
  ]);

  const categories = await categoryModel.insertMany(
    CATEGORIES.map((name) => ({ name, slug: slugify(name) })),
  );
  const categoryIds = categories.map((c) => c._id);

  const now = Date.now();
  const products = Array.from({ length: 100 }, (_, i) => {
    const name = `${pick(ADJECTIVES)} ${pick(NOUNS)}`;
    const price = rand(1000, 50000) / 100; // 10.00 – 500.00
    const tags = Array.from(new Set(Array.from({ length: rand(1, 3) }, () => pick(TAG_POOL))));
    const createdAt = new Date(now - rand(0, 120) * 24 * 60 * 60 * 1000);
    return {
      name,
      sku: `SKU-${1000 + i}`,
      description: `${name} — high quality product for everyday use.`,
      category: pick(categoryIds),
      tags,
      images: [`https://picsum.photos/seed/rocket-${i}/400/400`],
      price,
      taxIncludedPrice: Math.round(price * 1.2 * 100) / 100,
      taxRule: 'Standard 20%',
      unitPrice: price,
      stock: rand(0, 200),
      status: rand(1, 10) > 2 ? ProductStatus.Available : ProductStatus.Disabled,
      shipping: {
        weight: rand(100, 5000) / 100,
        width: rand(5, 60),
        height: rand(5, 60),
        length: rand(5, 60),
      },
      createdAt,
      updatedAt: createdAt,
    };
  });

  // `timestamps: false` keeps our varied createdAt values (supported at
  // runtime; cast because it is absent from InsertManyOptions typings).
  await productModel.insertMany(products, { timestamps: false } as never);

  // ── Orders ────────────────────────────────────────────────────────────
  const statuses = Object.values(OrderStatus);
  const payments = Object.values(PaymentType);
  const usedOrderNos = new Set<string>();
  const nextOrderNo = () => {
    let no = '';
    do {
      no = `#${100000 + rand(0, 899999)}`;
    } while (usedOrderNos.has(no));
    usedOrderNos.add(no);
    return no;
  };

  const orders = Array.from({ length: 40 }, () => {
    const lineItems = Array.from({ length: rand(1, 3) }, () => {
      const p = pick(products);
      return { name: p.name, price: p.price, qty: rand(1, 4) };
    });
    const subtotal = lineItems.reduce((s, it) => s + it.price * it.qty, 0);
    const tax = Math.round(subtotal * 0.1 * 100) / 100;
    const status = pick(statuses);
    const createdAt = new Date(now - rand(0, 90) * 24 * 60 * 60 * 1000);
    return {
      orderNo: nextOrderNo(),
      customerName: pick(CUSTOMER_NAMES),
      items: lineItems,
      subtotal: Math.round(subtotal * 100) / 100,
      tax,
      total: Math.round((subtotal + tax) * 100) / 100,
      paymentType: pick(payments),
      status,
      history: [{ status, at: createdAt }],
      createdAt,
      updatedAt: createdAt,
    };
  });

  await orderModel.insertMany(orders, { timestamps: false } as never);

  // eslint-disable-next-line no-console
  console.log(
    `Seeded ${categories.length} categories, ${products.length} products and ${orders.length} orders.`,
  );

  await app.close();
  process.exit(0);
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed:', err);
  process.exit(1);
});

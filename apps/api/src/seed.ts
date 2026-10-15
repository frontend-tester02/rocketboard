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
import { ProductStatus } from '@rocket/shared';
import type { Model } from 'mongoose';
import { AppModule } from './app.module';
import { Category } from './modules/categories/schemas/category.schema';
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

  await Promise.all([
    productModel.deleteMany({}).exec(),
    categoryModel.deleteMany({}).exec(),
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

  // eslint-disable-next-line no-console
  console.log(
    `Seeded ${categories.length} categories and ${products.length} products.`,
  );

  await app.close();
  process.exit(0);
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed:', err);
  process.exit(1);
});

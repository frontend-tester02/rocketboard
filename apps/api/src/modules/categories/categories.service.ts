import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { CreateCategory, UpdateCategory } from '@rocket/shared';
import { Model } from 'mongoose';
import { Category, type CategoryDocument } from './schemas/category.schema';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  findAll() {
    return this.categoryModel.find().sort({ name: 1 }).exec();
  }

  async findById(id: string) {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  create(data: CreateCategory) {
    return this.categoryModel.create({
      name: data.name,
      slug: data.slug ? slugify(data.slug) : slugify(data.name),
      parent: data.parent,
    });
  }

  async update(id: string, data: UpdateCategory) {
    const update: Record<string, unknown> = { ...data };
    if (data.slug) update.slug = slugify(data.slug);
    else if (data.name && !data.slug) update.slug = slugify(data.name);
    const category = await this.categoryModel
      .findByIdAndUpdate(id, update, { new: true })
      .exec();
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async remove(id: string): Promise<void> {
    const res = await this.categoryModel.deleteOne({ _id: id }).exec();
    if (res.deletedCount === 0) throw new NotFoundException('Category not found');
  }
}

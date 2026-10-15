import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ProductStatus,
  type CreateProduct,
  type ProductCounts,
  type ProductListQuery,
  type UpdateProduct,
} from '@rocket/shared';
import { FilterQuery, Model } from 'mongoose';
import { paginate } from '../../common';
import { Product } from './schemas/product.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<Product>,
  ) {}

  list(query: ProductListQuery) {
    const filter: FilterQuery<Product> = {};

    if (query.status) filter.status = query.status;
    if (query.category) filter.category = query.category;

    if (query.priceMin != null || query.priceMax != null) {
      const price: Record<string, number> = {};
      if (query.priceMin != null) price.$gte = query.priceMin;
      if (query.priceMax != null) price.$lte = query.priceMax;
      filter.price = price;
    }

    if (query.dateFrom || query.dateTo) {
      const createdAt: Record<string, Date> = {};
      if (query.dateFrom) createdAt.$gte = query.dateFrom;
      if (query.dateTo) createdAt.$lte = query.dateTo;
      filter.createdAt = createdAt;
    }

    return paginate(this.productModel, query, filter, {
      searchFields: ['name', 'sku'],
    });
  }

  async counts(): Promise<ProductCounts> {
    const [all, available, disabled] = await Promise.all([
      this.productModel.countDocuments().exec(),
      this.productModel
        .countDocuments({ status: ProductStatus.Available })
        .exec(),
      this.productModel
        .countDocuments({ status: ProductStatus.Disabled })
        .exec(),
    ]);
    return { all, available, disabled };
  }

  async findById(id: string) {
    const product = await this.productModel.findById(id).exec();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  create(data: CreateProduct) {
    return this.productModel.create(data);
  }

  async update(id: string, data: UpdateProduct) {
    const product = await this.productModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async remove(id: string): Promise<void> {
    const res = await this.productModel.deleteOne({ _id: id }).exec();
    if (res.deletedCount === 0) throw new NotFoundException('Product not found');
  }

  async bulkRemove(ids: string[]): Promise<{ deleted: number }> {
    const res = await this.productModel
      .deleteMany({ _id: { $in: ids } })
      .exec();
    return { deleted: res.deletedCount ?? 0 };
  }
}

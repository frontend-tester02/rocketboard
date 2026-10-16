import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type {
  CreateCustomer,
  CustomerListQuery,
  UpdateCustomer,
} from '@rocket/shared';
import { Model } from 'mongoose';
import { paginate } from '../../common';
import { Customer } from './schemas/customer.schema';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer.name) private readonly customerModel: Model<Customer>,
  ) {}

  list(query: CustomerListQuery) {
    return paginate(this.customerModel, query, {}, {
      searchFields: ['firstName', 'lastName', 'email'],
      defaultSort: { createdAt: -1 },
    });
  }

  async findById(id: string) {
    const customer = await this.customerModel.findById(id).exec();
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async create(data: CreateCustomer) {
    await this.ensureEmailUnique(data.email);
    return this.customerModel.create(data);
  }

  async update(id: string, data: UpdateCustomer) {
    if (data.email) await this.ensureEmailUnique(data.email, id);
    const customer = await this.customerModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async remove(id: string): Promise<void> {
    const res = await this.customerModel.deleteOne({ _id: id }).exec();
    if (res.deletedCount === 0) throw new NotFoundException('Customer not found');
  }

  private async ensureEmailUnique(email: string, excludeId?: string): Promise<void> {
    const existing = await this.customerModel
      .findOne({ email: email.toLowerCase() })
      .select('_id')
      .exec();
    if (existing && existing.id !== excludeId) {
      throw new ConflictException('A customer with this email already exists');
    }
  }
}

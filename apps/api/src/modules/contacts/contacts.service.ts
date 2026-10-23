import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { CreateContact, ContactListQuery, UpdateContact } from '@rocket/shared';
import { FilterQuery, Model, Types } from 'mongoose';
import { Contact } from './schemas/contact.schema';

@Injectable()
export class ContactsService {
  constructor(@InjectModel(Contact.name) private readonly contactModel: Model<Contact>) {}

  async list(userId: string, query: ContactListQuery) {
    const owner = new Types.ObjectId(userId);
    const filter: FilterQuery<Contact> = { owner };
    if (query.favorite) filter.isFavorite = true;
    if (query.search) {
      const rx = new RegExp(query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ firstName: rx }, { lastName: rx }, { email: rx }, { company: rx }];
    }
    // A–Z by name.
    const contacts = await this.contactModel
      .find(filter)
      .collation({ locale: 'en', strength: 2 })
      .sort({ firstName: 1, lastName: 1 })
      .exec();
    return contacts.map((c) => c.toJSON());
  }

  async getById(userId: string, id: string) {
    const contact = await this.ensureContact(userId, id);
    return contact.toJSON();
  }

  async create(userId: string, dto: CreateContact) {
    const contact = await this.contactModel.create({
      owner: new Types.ObjectId(userId),
      ...dto,
    });
    return contact.toJSON();
  }

  async update(userId: string, id: string, dto: UpdateContact) {
    await this.ensureContact(userId, id);
    const contact = await this.contactModel.findByIdAndUpdate(id, { ...dto }, { new: true }).exec();
    if (!contact) throw new NotFoundException('Contact not found');
    return contact.toJSON();
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.ensureContact(userId, id);
    await this.contactModel.deleteOne({ _id: id }).exec();
  }

  private async ensureContact(userId: string, id: string) {
    const contact = await this.contactModel.findById(id).exec();
    if (!contact) throw new NotFoundException('Contact not found');
    if (String(contact.owner) !== userId) throw new ForbiddenException('Not your contact');
    return contact;
  }
}

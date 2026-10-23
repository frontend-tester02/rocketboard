import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  TransactionType,
  type CardDto,
  type CreateCard,
  type CreateTransaction,
  type TransactionDto,
  type TransactionListQuery,
  type UpdateCard,
  type WalletSummary,
} from '@rocket/shared';
import { FilterQuery, Model, Types } from 'mongoose';
import { Card } from './schemas/card.schema';
import { Transaction } from './schemas/transaction.schema';

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(Card.name) private readonly cardModel: Model<Card>,
    @InjectModel(Transaction.name) private readonly txModel: Model<Transaction>,
  ) {}

  // ── Cards ────────────────────────────────────────────────────────────────
  async listCards(userId: string): Promise<CardDto[]> {
    const cards = await this.cardModel
      .find({ owner: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
    return cards.map((c) => this.toCardDto(c));
  }

  async createCard(userId: string, dto: CreateCard): Promise<CardDto> {
    const card = await this.cardModel.create({ owner: new Types.ObjectId(userId), ...dto });
    return this.toCardDto(card);
  }

  async updateCard(userId: string, id: string, dto: UpdateCard): Promise<CardDto> {
    await this.ensureCard(userId, id);
    const card = await this.cardModel.findByIdAndUpdate(id, { ...dto }, { new: true }).exec();
    if (!card) throw new NotFoundException('Card not found');
    return this.toCardDto(card);
  }

  async removeCard(userId: string, id: string): Promise<void> {
    await this.ensureCard(userId, id);
    await this.cardModel.deleteOne({ _id: id }).exec();
  }

  // ── Transactions ───────────────────────────────────────────────────────────
  async listTransactions(userId: string, query: TransactionListQuery): Promise<TransactionDto[]> {
    const filter: FilterQuery<Transaction> = { owner: new Types.ObjectId(userId) };
    if (query.type) filter.type = query.type;
    const txs = await this.txModel.find(filter).sort({ date: -1 }).limit(query.limit).exec();
    return txs.map((t) => this.toTxDto(t));
  }

  async createTransaction(userId: string, dto: CreateTransaction): Promise<TransactionDto> {
    const tx = await this.txModel.create({
      owner: new Types.ObjectId(userId),
      type: dto.type,
      category: dto.category ?? 'other',
      amount: dto.amount,
      title: dto.title,
      date: dto.date ?? new Date(),
      card: dto.cardId ? new Types.ObjectId(dto.cardId) : undefined,
    });

    // Keep the linked card balance in sync.
    if (dto.cardId && Types.ObjectId.isValid(dto.cardId)) {
      const delta = dto.type === TransactionType.Income ? dto.amount : -dto.amount;
      await this.cardModel
        .updateOne({ _id: dto.cardId, owner: new Types.ObjectId(userId) }, { $inc: { balance: delta } })
        .exec();
    }

    return this.toTxDto(tx);
  }

  async removeTransaction(userId: string, id: string): Promise<void> {
    const owner = new Types.ObjectId(userId);
    const tx = await this.txModel.findOne({ _id: id, owner }).exec();
    if (!tx) throw new NotFoundException('Transaction not found');
    await this.txModel.deleteOne({ _id: id }).exec();
  }

  async summary(userId: string): Promise<WalletSummary> {
    const owner = new Types.ObjectId(userId);
    const rows = await this.txModel.aggregate<{ _id: string; total: number }>([
      { $match: { owner } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } },
    ]);
    const income = rows.find((r) => r._id === TransactionType.Income)?.total ?? 0;
    const expense = rows.find((r) => r._id === TransactionType.Expense)?.total ?? 0;
    return { balance: income - expense, income, expense };
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  private async ensureCard(userId: string, id: string) {
    const card = await this.cardModel.findById(id).exec();
    if (!card) throw new NotFoundException('Card not found');
    if (String(card.owner) !== userId) throw new ForbiddenException('Not your card');
    return card;
  }

  private toCardDto(c: Card & { _id: Types.ObjectId; createdAt?: Date; updatedAt?: Date }): CardDto {
    return {
      id: String(c._id),
      owner: String(c.owner),
      brand: c.brand,
      last4: c.last4,
      holder: c.holder,
      expMonth: c.expMonth,
      expYear: c.expYear,
      balance: c.balance,
      createdAt: c.createdAt?.toISOString(),
      updatedAt: c.updatedAt?.toISOString(),
    };
  }

  private toTxDto(t: Transaction & { _id: Types.ObjectId; createdAt?: Date }): TransactionDto {
    return {
      id: String(t._id),
      owner: String(t.owner),
      type: t.type as TransactionDto['type'],
      category: t.category,
      amount: t.amount,
      title: t.title,
      date: t.date.toISOString(),
      cardId: t.card ? String(t.card) : undefined,
      createdAt: t.createdAt?.toISOString(),
    };
  }
}

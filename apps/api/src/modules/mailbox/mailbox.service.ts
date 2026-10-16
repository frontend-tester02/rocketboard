import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  MailFolder,
  type ComposeMail,
  type CreateMailLabel,
  type DraftMail,
  type MailCounts,
  type MailListQuery,
  type PatchMail,
  type UpdateMailLabel,
} from '@rocket/shared';
import { FilterQuery, Model, Types } from 'mongoose';
import { paginate } from '../../common';
import { UsersService } from '../users/users.service';
import { Mail } from './schemas/mail.schema';
import { MailLabel } from './schemas/mail-label.schema';

@Injectable()
export class MailboxService {
  constructor(
    @InjectModel(Mail.name) private readonly mailModel: Model<Mail>,
    @InjectModel(MailLabel.name) private readonly labelModel: Model<MailLabel>,
    private readonly users: UsersService,
  ) {}

  // ── Mails ──────────────────────────────────────────────────────────────

  async list(userId: string, query: MailListQuery) {
    await this.bootstrap(userId);
    const owner = new Types.ObjectId(userId);
    const filter: FilterQuery<Mail> = { owner };
    filter.folder = query.folder ?? MailFolder.Inbox;
    if (query.label) filter.labels = query.label;
    return paginate(this.mailModel, query, filter, {
      searchFields: ['subject', 'body', 'from.email', 'from.name'],
      defaultSort: { createdAt: -1 },
    });
  }

  async findById(userId: string, id: string) {
    const mail = await this.ownMail(userId, id);
    if (!mail.isRead) {
      mail.isRead = true;
      await mail.save();
    }
    return mail;
  }

  async counts(userId: string): Promise<MailCounts> {
    await this.bootstrap(userId);
    const owner = new Types.ObjectId(userId);
    const folders = Object.values(MailFolder);
    const [unread, ...perFolder] = await Promise.all([
      this.mailModel
        .countDocuments({ owner, folder: MailFolder.Inbox, isRead: false })
        .exec(),
      ...folders.map((f) =>
        this.mailModel.countDocuments({ owner, folder: f }).exec(),
      ),
    ]);
    const counts = { unread } as MailCounts;
    folders.forEach((f, i) => {
      counts[f] = perFolder[i] ?? 0;
    });
    return counts;
  }

  async send(userId: string, dto: ComposeMail) {
    const sender = await this.users.findById(userId);
    if (!sender) throw new NotFoundException('Sender not found');
    const from = {
      name: `${sender.firstName} ${sender.lastName}`,
      email: sender.email,
    };
    const threadId = new Types.ObjectId().toString();
    const shared = {
      from,
      fromUser: new Types.ObjectId(userId),
      to: dto.to,
      cc: dto.cc,
      subject: dto.subject,
      body: dto.body,
      attachments: dto.attachments,
      threadId,
    };

    const sent = await this.mailModel.create({
      ...shared,
      owner: new Types.ObjectId(userId),
      folder: MailFolder.Sent,
      isRead: true,
    });

    // Deliver an inbox copy to every recipient that is a registered user.
    const recipients = [...new Set([...dto.to, ...dto.cc])];
    for (const email of recipients) {
      const user = await this.users.findByEmail(email);
      if (!user || user.id === userId) continue;
      await this.mailModel.create({
        ...shared,
        owner: user._id,
        folder: MailFolder.Inbox,
        isRead: false,
      });
    }

    return sent;
  }

  async saveDraft(userId: string, dto: DraftMail) {
    const sender = await this.users.findById(userId);
    const from = sender
      ? { name: `${sender.firstName} ${sender.lastName}`, email: sender.email }
      : { name: 'Me', email: '' };
    return this.mailModel.create({
      owner: new Types.ObjectId(userId),
      folder: MailFolder.Draft,
      from,
      fromUser: new Types.ObjectId(userId),
      to: dto.to,
      cc: dto.cc,
      subject: dto.subject,
      body: dto.body,
      attachments: dto.attachments,
      isRead: true,
    });
  }

  async patch(userId: string, id: string, dto: PatchMail) {
    await this.ownMail(userId, id);
    const mail = await this.mailModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!mail) throw new NotFoundException('Mail not found');
    return mail;
  }

  async remove(userId: string, id: string): Promise<void> {
    const mail = await this.ownMail(userId, id);
    if (mail.folder === MailFolder.Trash) {
      await this.mailModel.deleteOne({ _id: id }).exec();
    } else {
      mail.folder = MailFolder.Trash;
      await mail.save();
    }
  }

  private async ownMail(userId: string, id: string) {
    const mail = await this.mailModel.findById(id).exec();
    if (!mail || String(mail.owner) !== userId) {
      throw new NotFoundException('Mail not found');
    }
    return mail;
  }

  /** Seed a couple of welcome mails on first use so the inbox is not empty. */
  private async bootstrap(userId: string): Promise<void> {
    const owner = new Types.ObjectId(userId);
    const existing = await this.mailModel.countDocuments({ owner }).exec();
    if (existing > 0) return;
    const sender = await this.users.findById(userId);
    const toEmail = sender?.email ?? 'me@rocket.io';
    const now = Date.now();
    await this.mailModel.insertMany([
      {
        owner,
        folder: MailFolder.Inbox,
        from: { name: 'Rocket Team', email: 'team@rocket.io' },
        to: [toEmail],
        cc: [],
        subject: 'Welcome to Rocket Mail 🚀',
        body: '<p>Hi there! This is your internal mailbox. Compose a message to get started.</p>',
        attachments: [],
        labels: [],
        isRead: false,
        isStarred: true,
        createdAt: new Date(now - 60 * 60 * 1000),
      },
      {
        owner,
        folder: MailFolder.Inbox,
        from: { name: 'Regina Cooper', email: 'regina.cooper@example.com' },
        to: [toEmail],
        cc: [],
        subject: 'Project kickoff notes',
        body: '<p>Sharing the notes from our kickoff. Let me know your thoughts.</p>',
        attachments: [],
        labels: [],
        isRead: false,
        isStarred: false,
        createdAt: new Date(now - 3 * 60 * 60 * 1000),
      },
    ] as never);
  }

  // ── Labels ─────────────────────────────────────────────────────────────

  listLabels(userId: string) {
    return this.labelModel
      .find({ owner: new Types.ObjectId(userId) })
      .sort({ name: 1 })
      .exec();
  }

  createLabel(userId: string, dto: CreateMailLabel) {
    return this.labelModel.create({
      ...dto,
      owner: new Types.ObjectId(userId),
    });
  }

  async updateLabel(userId: string, id: string, dto: UpdateMailLabel) {
    const label = await this.labelModel.findById(id).select('owner').exec();
    if (!label || String(label.owner) !== userId) {
      throw new NotFoundException('Label not found');
    }
    return this.labelModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  async removeLabel(userId: string, id: string): Promise<void> {
    const label = await this.labelModel.findById(id).select('owner name').exec();
    if (!label || String(label.owner) !== userId) {
      throw new NotFoundException('Label not found');
    }
    // Detach the label from any mails that carry it.
    await this.mailModel
      .updateMany(
        { owner: new Types.ObjectId(userId), labels: label.name },
        { $pull: { labels: label.name } },
      )
      .exec();
    await this.labelModel.deleteOne({ _id: id }).exec();
  }
}

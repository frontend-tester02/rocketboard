import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ConversationType,
  type CreateConversation,
  type MessageListQuery,
  type SendMessage,
} from '@rocket/shared';
import { FilterQuery, Model, Types } from 'mongoose';
import { Conversation } from './schemas/conversation.schema';
import { Message } from './schemas/message.schema';

const MEMBER_FIELDS = 'firstName lastName email avatar';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<Conversation>,
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
  ) {}

  async listConversations(userId: string) {
    const owner = new Types.ObjectId(userId);
    const conversations = await this.conversationModel
      .find({ members: owner })
      .populate('members', MEMBER_FIELDS)
      .sort({ updatedAt: -1 })
      .exec();

    // Attach unread counts per conversation.
    return Promise.all(
      conversations.map(async (c) => {
        const unread = await this.messageModel
          .countDocuments({
            conversation: c._id,
            sender: { $ne: owner },
            readBy: { $ne: owner },
          })
          .exec();
        const obj = c.toJSON() as Record<string, unknown>;
        obj.unread = unread;
        return obj;
      }),
    );
  }

  async createConversation(userId: string, dto: CreateConversation) {
    const owner = new Types.ObjectId(userId);
    const memberIds = [
      ...new Set([userId, ...dto.members]),
    ].map((id) => new Types.ObjectId(id));

    // Private: reuse an existing 1:1 conversation if present.
    if (dto.type === ConversationType.Private && memberIds.length === 2) {
      const existing = await this.conversationModel
        .findOne({
          type: ConversationType.Private,
          members: { $all: memberIds, $size: 2 },
        })
        .populate('members', MEMBER_FIELDS)
        .exec();
      if (existing) return existing;
    }

    const created = await this.conversationModel.create({
      type: dto.type,
      name: dto.name,
      avatar: dto.avatar,
      members: memberIds,
      admins: [owner],
    });
    return created.populate('members', MEMBER_FIELDS);
  }

  async getConversation(userId: string, id: string) {
    const conv = await this.conversationModel
      .findById(id)
      .populate('members', MEMBER_FIELDS)
      .exec();
    if (!conv) throw new NotFoundException('Conversation not found');
    this.ensureMember(conv, userId);
    return conv;
  }

  async getMessages(userId: string, convId: string, query: MessageListQuery) {
    await this.assertMember(userId, convId);
    const filter: FilterQuery<Message> = {
      conversation: new Types.ObjectId(convId),
    };
    if (query.cursor && Types.ObjectId.isValid(query.cursor)) {
      filter._id = { $lt: new Types.ObjectId(query.cursor) };
    }
    const messages = await this.messageModel
      .find(filter)
      .populate('sender', MEMBER_FIELDS)
      .sort({ _id: -1 })
      .limit(query.limit)
      .exec();
    // Return in chronological (ascending) order.
    return messages.reverse();
  }

  async sendMessage(userId: string, convId: string, dto: SendMessage) {
    await this.assertMember(userId, convId);
    const sender = new Types.ObjectId(userId);
    const message = await this.messageModel.create({
      conversation: new Types.ObjectId(convId),
      sender,
      text: dto.text ?? '',
      attachments: dto.attachments ?? [],
      readBy: [sender],
    });
    await this.conversationModel
      .updateOne(
        { _id: convId },
        {
          $set: {
            lastMessage: {
              text: dto.text ?? '(attachment)',
              sender,
              createdAt: new Date(),
            },
          },
        },
      )
      .exec();
    return message.populate('sender', MEMBER_FIELDS);
  }

  async addMembers(userId: string, convId: string, members: string[]) {
    const conv = await this.conversationModel.findById(convId).exec();
    if (!conv) throw new NotFoundException('Conversation not found');
    this.ensureMember(conv, userId);
    const ids = members.map((m) => new Types.ObjectId(m));
    await this.conversationModel
      .updateOne({ _id: convId }, { $addToSet: { members: { $each: ids } } })
      .exec();
    return this.getConversation(userId, convId);
  }

  async markRead(userId: string, convId: string): Promise<void> {
    await this.assertMember(userId, convId);
    const reader = new Types.ObjectId(userId);
    await this.messageModel
      .updateMany(
        { conversation: new Types.ObjectId(convId), readBy: { $ne: reader } },
        { $addToSet: { readBy: reader } },
      )
      .exec();
  }

  /** Member user ids of a conversation (for socket fan-out). */
  async getMemberIds(convId: string): Promise<string[]> {
    const conv = await this.conversationModel
      .findById(convId)
      .select('members')
      .exec();
    return conv ? conv.members.map((m) => String(m)) : [];
  }

  private ensureMember(conv: Conversation, userId: string): void {
    const ok = conv.members.some((m) => String(m._id ?? m) === userId);
    if (!ok) throw new ForbiddenException('Not a member of this conversation');
  }

  private async assertMember(userId: string, convId: string): Promise<void> {
    const conv = await this.conversationModel
      .findById(convId)
      .select('members')
      .exec();
    if (!conv) throw new NotFoundException('Conversation not found');
    const ok = conv.members.some((m) => String(m) === userId);
    if (!ok) throw new ForbiddenException('Not a member of this conversation');
  }
}

import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  addMembersSchema,
  createConversationSchema,
  messageListQuerySchema,
  sendMessageSchema,
  updateConversationSchema,
  type AddMembers,
  type CreateConversation,
  type MessageListQuery,
  type SendMessage,
  type UpdateConversation,
} from '@rocket/shared';
import { CurrentUser, ParseObjectIdPipe, ZodValidationPipe } from '../../common';
import { ChatService } from './chat.service';

@ApiTags('Chat')
@ApiCookieAuth()
@Controller('conversations')
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @Get()
  @ApiOperation({ summary: 'List my conversations' })
  list(@CurrentUser('id') userId: string) {
    return this.chat.listConversations(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create (or reuse) a conversation' })
  create(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(createConversationSchema)) dto: CreateConversation,
  ) {
    return this.chat.createConversation(userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a conversation' })
  getOne(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    return this.chat.getConversation(userId, id);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'List messages (cursor pagination)' })
  messages(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
    @Query(new ZodValidationPipe(messageListQuerySchema)) query: MessageListQuery,
  ) {
    return this.chat.getMessages(userId, id, query);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Send a message' })
  send(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body(new ZodValidationPipe(sendMessageSchema)) dto: SendMessage,
  ) {
    return this.chat.sendMessage(userId, id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a conversation (name / avatar)' })
  update(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body(new ZodValidationPipe(updateConversationSchema)) dto: UpdateConversation,
  ) {
    return this.chat.updateConversation(userId, id, dto);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add members to a conversation' })
  addMembers(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body(new ZodValidationPipe(addMembersSchema)) dto: AddMembers,
  ) {
    return this.chat.addMembers(userId, id, dto.members);
  }

  @Post(':id/read')
  @HttpCode(204)
  @ApiOperation({ summary: 'Mark a conversation as read' })
  async read(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<void> {
    await this.chat.markRead(userId, id);
  }
}

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { ChatAttachment } from '@rocket/shared';
import type { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

interface SocketData {
  userId?: string;
}

function tokenFromCookie(cookie?: string): string | null {
  if (!cookie) return null;
  const match = cookie.match(/(?:^|;\s*)access_token=([^;]+)/);
  return match?.[1] ?? null;
}

@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: process.env.WEB_URL ?? 'http://localhost:3000', credentials: true },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;

  /** userId → active socket count (for presence). */
  private readonly online = new Map<string, number>();

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly chat: ChatService,
  ) {}

  handleConnection(client: Socket) {
    const userId = this.authenticate(client);
    if (!userId) {
      client.disconnect();
      return;
    }
    (client.data as SocketData).userId = userId;
    void client.join(`user:${userId}`);

    const prev = this.online.get(userId) ?? 0;
    this.online.set(userId, prev + 1);
    if (prev === 0) {
      this.server.emit('presence', { user: userId, online: true });
    }
    client.emit('presence:list', [...this.online.keys()]);
  }

  handleDisconnect(client: Socket) {
    const userId = (client.data as SocketData).userId;
    if (!userId) return;
    const count = (this.online.get(userId) ?? 1) - 1;
    if (count <= 0) {
      this.online.delete(userId);
      this.server.emit('presence', { user: userId, online: false });
    } else {
      this.online.set(userId, count);
    }
  }

  @SubscribeMessage('conversation:join')
  joinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string,
  ) {
    void client.join(`conversation:${conversationId}`);
  }

  @SubscribeMessage('conversation:leave')
  leaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string,
  ) {
    void client.leave(`conversation:${conversationId}`);
  }

  @SubscribeMessage('message:send')
  async onMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { conversation: string; text?: string; attachments?: ChatAttachment[] },
  ) {
    const userId = (client.data as SocketData).userId;
    if (!userId) return;
    const message = await this.chat.sendMessage(userId, payload.conversation, {
      text: payload.text ?? '',
      attachments: payload.attachments ?? [],
    });
    const event = {
      message: message.toJSON(),
      conversation: payload.conversation,
    };
    const members = await this.chat.getMemberIds(payload.conversation);
    for (const m of members) {
      this.server.to(`user:${m}`).emit('message:new', event);
    }
  }

  @SubscribeMessage('message:read')
  async onRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string,
  ) {
    const userId = (client.data as SocketData).userId;
    if (!userId) return;
    await this.chat.markRead(userId, conversationId);
    const members = await this.chat.getMemberIds(conversationId);
    for (const m of members) {
      this.server
        .to(`user:${m}`)
        .emit('message:read', { conversation: conversationId, user: userId });
    }
  }

  @SubscribeMessage('typing:start')
  typingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string,
  ) {
    this.emitTyping(client, conversationId, 'typing:start');
  }

  @SubscribeMessage('typing:stop')
  typingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string,
  ) {
    this.emitTyping(client, conversationId, 'typing:stop');
  }

  private emitTyping(client: Socket, conversationId: string, event: string) {
    const userId = (client.data as SocketData).userId;
    client
      .to(`conversation:${conversationId}`)
      .emit(event, { conversation: conversationId, user: userId });
  }

  private authenticate(client: Socket): string | null {
    const token = tokenFromCookie(client.handshake.headers.cookie);
    if (!token) return null;
    try {
      const payload = this.jwt.verify<{ sub: string }>(token, {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      });
      return payload.sub;
    } catch {
      return null;
    }
  }
}

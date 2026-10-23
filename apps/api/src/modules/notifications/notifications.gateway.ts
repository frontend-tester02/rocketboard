import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  type OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { NotificationDto } from '@rocket/shared';
import type { Server, Socket } from 'socket.io';

function tokenFromCookie(cookie?: string): string | null {
  if (!cookie) return null;
  const match = cookie.match(/(?:^|;\s*)access_token=([^;]+)/);
  return match?.[1] ?? null;
}

@WebSocketGateway({
  namespace: '/notifications',
  cors: { origin: process.env.WEB_URL ?? 'http://localhost:3000', credentials: true },
})
export class NotificationsGateway implements OnGatewayConnection {
  @WebSocketServer() server!: Server;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  handleConnection(client: Socket) {
    const userId = this.authenticate(client);
    if (!userId) {
      client.disconnect();
      return;
    }
    void client.join(`user:${userId}`);
  }

  /** Push a new notification to a specific user's sockets. */
  pushToUser(userId: string, notification: NotificationDto) {
    this.server.to(`user:${userId}`).emit('notification:new', notification);
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

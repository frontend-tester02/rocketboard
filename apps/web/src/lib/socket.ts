import { io, type Socket } from 'socket.io-client';

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:4000';

let socket: Socket | null = null;

/**
 * Singleton Socket.IO client for the `/chat` namespace. Cookies (the httpOnly
 * access token) travel with the handshake via `withCredentials`, so the server
 * authenticates the connection. Auto-reconnects on drop.
 */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(`${SOCKET_URL}/chat`, {
      withCredentials: true,
      autoConnect: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}

'use client';

import { useEffect, useRef } from 'react';
import { getSocket } from '@/lib/socket';

/** Subscribe to a socket event for the lifetime of the component. */
export function useSocketEvent<T = unknown>(
  event: string,
  handler: (data: T) => void,
) {
  const ref = useRef(handler);
  ref.current = handler;

  useEffect(() => {
    const socket = getSocket();
    const listener = (data: T) => ref.current(data);
    socket.on(event, listener);
    return () => {
      socket.off(event, listener);
    };
  }, [event]);
}

/** Ensure the socket is connected while the component is mounted. */
export function useSocketConnection() {
  useEffect(() => {
    const socket = getSocket();
    if (!socket.connected) socket.connect();
  }, []);
}

/** Emit a socket event. */
export function emitSocket(event: string, payload?: unknown) {
  getSocket().emit(event, payload);
}

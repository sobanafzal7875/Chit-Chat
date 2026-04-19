import type { Server } from 'socket.io';

export function getIo(): Server | undefined {
  return typeof globalThis !== 'undefined'
    ? (globalThis as typeof globalThis & { io?: Server }).io
    : undefined;
}

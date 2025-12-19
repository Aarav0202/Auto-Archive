import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function initializeSocket() {
  if (socket) return socket;

  socket = io('http://localhost:8080', {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ['websocket', 'polling']
  });

  socket.once('connect', () => {
    console.log('✅ Connected to WebSocket server');
  });

  socket.on('disconnect', () => {
    console.log('❌ Disconnected from WebSocket server');
  });

  socket.on('error', (error: any) => {
    console.error('Socket error:', error);
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

// Chat Functions

export function joinChatRoom(companyName: string, vehicleName: string): void {
  if (!socket) {
    console.error('Socket not initialized');
    return;
  }

  const roomId = `chat:${companyName.toLowerCase()}:${vehicleName.toLowerCase()}`;
  socket.emit('chat:join-room', { roomId, companyName, vehicleName });
  console.log(`📱 Joined chat room: ${roomId}`);
}

export function leaveChatRoom(companyName: string, vehicleName: string): void {
  if (!socket) {
    console.error('Socket not initialized');
    return;
  }

  const roomId = `chat:${companyName.toLowerCase()}:${vehicleName.toLowerCase()}`;
  socket.emit('chat:leave-room', { roomId });
  console.log(`👋 Left chat room: ${roomId}`);
}

export function sendChatMessage(
  companyName: string,
  vehicleName: string,
  message: string,
  issueType: string = 'general'
): void {
  if (!socket) {
    console.error('Socket not initialized');
    return;
  }

  socket.emit('chat:send-message', {
    companyName,
    vehicleName,
    message,
    issueType
  });
}

export function onChatMessage(
  callback: (messageData: {
    socketId: string;
    message: string;
    issueType: string;
    carModel: { companyName: string; vehicleName: string };
    timestamp: string;
  }) => void
): () => void {
  if (!socket) {
    console.error('Socket not initialized');
    return () => {};
  }

  socket.on('chat:message', callback);

  return () => {
    socket?.off('chat:message', callback);
  };
}

export function onChatUserJoined(
  callback: (data: { userId: string; message: string }) => void
): () => void {
  if (!socket) {
    console.error('Socket not initialized');
    return () => {};
  }

  socket.on('chat:user-joined', callback);

  return () => {
    socket?.off('chat:user-joined', callback);
  };
}

export function onUserTyping(
  callback: (data: { userId: string; isTyping: boolean }) => void
): () => void {
  if (!socket) {
    console.error('Socket not initialized');
    return () => {};
  }

  socket.on('chat:user-typing', callback);

  return () => {
    socket?.off('chat:user-typing', callback);
  };
}

export function emitTypingIndicator(
  companyName: string,
  vehicleName: string,
  isTyping: boolean
): void {
  if (!socket) {
    console.error('Socket not initialized');
    return;
  }

  const roomId = `chat:${companyName.toLowerCase()}:${vehicleName.toLowerCase()}`;
  socket.emit('chat:typing', { roomId, isTyping });
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

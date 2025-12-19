import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
let isConnected = false;
let connectionPromise: Promise<Socket | null> | null = null;

export function initializeSocket(): Promise<Socket | null> {
  // If already connected, return resolved promise
  if (socket && isConnected) {
    return Promise.resolve(socket);
  }

  // If already connecting, return existing promise
  if (connectionPromise) {
    return connectionPromise;
  }

  // Create new connection promise
  connectionPromise = new Promise<Socket | null>((resolve, reject) => {
    try {
      socket = io('http://localhost:8080', {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling']
      });

      socket.once('connect', () => {
        isConnected = true;
        console.log('✅ Connected to WebSocket server');
        resolve(socket);
      });

      socket.on('disconnect', () => {
        isConnected = false;
        console.log('❌ Disconnected from WebSocket server');
      });

      socket.on('error', (error: any) => {
        console.error('Socket error:', error);
        reject(error);
      });

      socket.on('connect_error', (error: any) => {
        console.error('Socket connection error:', error);
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });

  return connectionPromise;
}

export function getSocket(): Socket | null {
  return socket;
}

export function isSocketConnected(): boolean {
  return isConnected;
}

// Chat Functions

export function joinChatRoom(companyName: string, vehicleName: string): void {
  if (!socket || !isConnected) {
    return;
  }

  const roomId = `chat:${companyName.toLowerCase()}:${vehicleName.toLowerCase()}`;
  socket.emit('chat:join-room', { roomId, companyName, vehicleName });
  console.log(`📱 Joined chat room: ${roomId}`);
}

export function leaveChatRoom(companyName: string, vehicleName: string): void {
  if (!socket || !isConnected) {
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
  if (!socket || !isConnected) {
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

export function onMessageDeleted(
  callback: (data: { messageId: string }) => void
): () => void {
  if (!socket) {
    console.error('Socket not initialized');
    return () => {};
  }

  socket.on('chat:message-deleted', callback);

  return () => {
    socket?.off('chat:message-deleted', callback);
  };
}

export function emitTypingIndicator(
  companyName: string,
  vehicleName: string,
  isTyping: boolean
): void {
  if (!socket || !isConnected) {
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

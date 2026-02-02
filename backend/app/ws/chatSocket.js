/**
 * Chat WebSocket Handler
 * Handles realtime chat messaging via Socket.IO
 * 
 * Events:
 * - chat:join - User joins a chat room
 * - chat:leave - User leaves a chat room
 * - chat:send - User sends a message
 * - chat:typing - User is typing
 * - chat:stop-typing - User stopped typing
 * - chat:message (broadcast) - New message received
 * - chat:typing-indicator (broadcast) - Someone is typing
 * 
 * Usage:
 *   io.of('/chat').on('connection', (socket) => {
 *     initChatSocket(socket);
 *   });
 */

import ChatLog from '../models/chatLog.model.js';

export const initChatSocket = (io, socket) => {
  const userId = socket.handshake.auth.userId;
  const userRole = socket.handshake.auth.userRole; // 'patient', 'doctor', 'bot'

  console.log(`User ${userId} (${userRole}) connected to chat namespace`);

  // Store user info in socket data
  socket.data.userId = userId;
  socket.data.userRole = userRole;
  socket.data.rooms = new Set();

  /**
   * chat:join
   * User joins a specific chat room
   */
  socket.on('chat:join', ({ roomId }) => {
    if (!roomId) return;

    socket.join(roomId);
    socket.data.rooms.add(roomId);

    console.log(`${userId} joined room: ${roomId}`);

    // Notify others in the room
    io.to(roomId).emit('chat:user-joined', {
      userId,
      userRole,
      timestamp: new Date().toISOString()
    });
  });

  /**
   * chat:leave
   * User leaves a chat room
   */
  socket.on('chat:leave', ({ roomId }) => {
    if (!roomId) return;

    socket.leave(roomId);
    socket.data.rooms.delete(roomId);

    console.log(`${userId} left room: ${roomId}`);

    // Notify others in the room
    io.to(roomId).emit('chat:user-left', {
      userId,
      userRole,
      timestamp: new Date().toISOString()
    });
  });

  /**
   * chat:send
   * User sends a message
   * 
   * Payload:
   * {
   *   roomId: string,
   *   message: {
   *     messageId: string,
   *     senderId: string,
   *     senderRole: string,
   *     type: "text" | "audio",
   *     text: string,
   *     audioUrl?: string,
   *     language: "en" | "kn",
   *     createdAt: ISO timestamp
   *   }
   * }
   */
  socket.on('chat:send', async ({ roomId, message }) => {
    try {
      if (!roomId || !message) {
        console.error('Invalid chat:send payload');
        return;
      }

      // Validate message structure
      if (!message.messageId || !message.senderId || !message.text) {
        console.error('Message missing required fields');
        return;
      }

      // Save message to database
      let chatLog = await ChatLog.findOne({ roomId });

      if (!chatLog) {
        chatLog = new ChatLog({
          roomId,
          participants: [message.senderId],
          messages: []
        });
      }

      chatLog.messages.push(message);
      await chatLog.save();

      // Broadcast message to all users in the room
      io.to(roomId).emit('chat:message', message);

      // Emit typing stop
      io.to(roomId).emit('chat:stop-typing', { userId });

      console.log(`Message sent in room ${roomId} by ${userId}`);
    } catch (error) {
      console.error('Error handling chat:send:', error);
      socket.emit('chat:error', {
        error: 'Failed to send message',
        details: error.message
      });
    }
  });

  /**
   * chat:typing
   * User is typing
   */
  socket.on('chat:typing', ({ roomId }) => {
    if (!roomId) return;

    socket.to(roomId).emit('chat:typing-indicator', {
      userId,
      userRole,
      timestamp: new Date().toISOString()
    });
  });

  /**
   * chat:stop-typing
   * User stopped typing
   */
  socket.on('chat:stop-typing', ({ roomId }) => {
    if (!roomId) return;

    socket.to(roomId).emit('chat:stop-typing', {
      userId,
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Disconnect
   * Clean up when user disconnects
   */
  socket.on('disconnect', () => {
    // Notify all rooms the user was in
    socket.data.rooms.forEach((roomId) => {
      io.to(roomId).emit('chat:user-left', {
        userId,
        userRole,
        timestamp: new Date().toISOString()
      });
    });

    console.log(`User ${userId} disconnected from chat`);
  });
};

/**
 * Setup chat namespace
 * Call this in your main server initialization
 * 
 * Example:
 *   setupChatNamespace(io);
 */
export const setupChatNamespace = (io) => {
  const chatNamespace = io.of('/chat');

  chatNamespace.use((socket, next) => {
    // Authenticate using token or session
    const token = socket.handshake.auth.token;
    // TODO: Verify token and extract userId, userRole

    socket.handshake.auth.userId = socket.handshake.auth.userId || 'anonymous';
    socket.handshake.auth.userRole = socket.handshake.auth.userRole || 'patient';

    next();
  });

  chatNamespace.on('connection', (socket) => {
    initChatSocket(chatNamespace, socket);
  });

  console.log('Chat namespace initialized');
};

export default { initChatSocket, setupChatNamespace };

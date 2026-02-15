import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import { User, Conversation, Message } from '../models';
import { Op } from 'sequelize';

// Track online users: userId -> Set<socketId>
const onlineUsers = new Map<string, Set<string>>();

export function setupChatSocket(io: Server) {
  // Auth middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token as string, config.jwt.secret) as { userId: string };
      const user = await User.findByPk(decoded.userId, {
        attributes: ['id', 'name', 'email'],
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      (socket as any).userId = user.id;
      (socket as any).userName = user.name;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId as string;
    const userName = (socket as any).userName as string;

    console.log(`[Chat] ${userName} connected (${socket.id})`);

    // Track online status
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId)!.add(socket.id);

    // Broadcast online status
    socket.broadcast.emit('user:online', { userId });

    // ── Join conversation rooms ──────────────────────────────────────────
    socket.on('conversation:join', async (conversationId: string) => {
      try {
        const conv = await Conversation.findOne({
          where: {
            id: conversationId,
            [Op.or]: [{ participant1_id: userId }, { participant2_id: userId }],
          },
        });

        if (conv) {
          socket.join(`conv:${conversationId}`);
          console.log(`[Chat] ${userName} joined conv:${conversationId}`);
        }
      } catch (error) {
        console.error('[Chat] Join conversation error:', error);
      }
    });

    socket.on('conversation:leave', (conversationId: string) => {
      socket.leave(`conv:${conversationId}`);
    });

    // ── Send message ─────────────────────────────────────────────────────
    socket.on(
      'message:send',
      async (
        data: { conversationId: string; content: string; messageType?: string },
        callback?: (response: any) => void
      ) => {
        try {
          const { conversationId, content, messageType } = data;

          if (!content?.trim()) {
            callback?.({ error: 'Message content required' });
            return;
          }

          // Verify membership
          const conv = await Conversation.findOne({
            where: {
              id: conversationId,
              [Op.or]: [{ participant1_id: userId }, { participant2_id: userId }],
            },
          });

          if (!conv) {
            callback?.({ error: 'Conversation not found' });
            return;
          }

          // Create message
          const message = await Message.create({
            conversation_id: conversationId,
            sender_id: userId,
            content: content.trim(),
            message_type: (messageType as any) || 'text',
          });

          // Update conversation
          await conv.update({
            last_message_id: message.id,
            last_message_at: message.created_at,
          });

          const fullMessage = {
            id: message.id,
            conversation_id: message.conversation_id,
            sender_id: message.sender_id,
            content: message.content,
            message_type: message.message_type,
            is_read: false,
            created_at: message.created_at,
            Sender: { id: userId, name: userName },
          };

          // Emit to conversation room (including sender)
          io.to(`conv:${conversationId}`).emit('message:new', fullMessage);

          // Also notify the other user if they aren't in the room
          const otherUserId =
            conv.participant1_id === userId ? conv.participant2_id : conv.participant1_id;
          const otherSockets = onlineUsers.get(otherUserId);
          if (otherSockets) {
            otherSockets.forEach((sid) => {
              io.to(sid).emit('conversation:updated', {
                conversationId,
                last_message: fullMessage,
              });
            });
          }

          callback?.({ message: fullMessage });
        } catch (error: any) {
          console.error('[Chat] Send message error:', error);
          callback?.({ error: 'Failed to send message' });
        }
      }
    );

    // ── Typing indicators ────────────────────────────────────────────────
    socket.on('typing:start', (conversationId: string) => {
      socket.to(`conv:${conversationId}`).emit('typing:start', {
        conversationId,
        userId,
        userName,
      });
    });

    socket.on('typing:stop', (conversationId: string) => {
      socket.to(`conv:${conversationId}`).emit('typing:stop', {
        conversationId,
        userId,
      });
    });

    // ── Mark messages read ───────────────────────────────────────────────
    socket.on('messages:read', async (conversationId: string) => {
      try {
        await Message.update(
          { is_read: true, read_at: new Date() },
          {
            where: {
              conversation_id: conversationId,
              sender_id: { [Op.ne]: userId },
              is_read: false,
            },
          }
        );

        // Notify the other user
        socket.to(`conv:${conversationId}`).emit('messages:read', {
          conversationId,
          readBy: userId,
        });
      } catch (error) {
        console.error('[Chat] Mark read error:', error);
      }
    });

    // ── Get online status ────────────────────────────────────────────────
    socket.on('users:online', (userIds: string[], callback?: (result: any) => void) => {
      const statuses: Record<string, boolean> = {};
      userIds.forEach((uid) => {
        statuses[uid] = onlineUsers.has(uid) && onlineUsers.get(uid)!.size > 0;
      });
      callback?.(statuses);
    });

    // ── Disconnect ───────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`[Chat] ${userName} disconnected (${socket.id})`);

      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);
          socket.broadcast.emit('user:offline', { userId });
        }
      }
    });
  });
}

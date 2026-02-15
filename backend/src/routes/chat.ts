import express, { Response } from 'express';
import { param, body, query, validationResult } from 'express-validator';
import { Op } from 'sequelize';
import { User, Conversation, Message, UserMatch } from '../models';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// ── Get conversations list ────────────────────────────────────────────────────
router.get(
  '/conversations',
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const conversations = await Conversation.findAll({
        where: {
          [Op.or]: [
            { participant1_id: req.user!.id },
            { participant2_id: req.user!.id },
          ],
        },
        include: [
          {
            model: User,
            as: 'Participant1',
            attributes: ['id', 'name', 'city', 'bio'],
          },
          {
            model: User,
            as: 'Participant2',
            attributes: ['id', 'name', 'city', 'bio'],
          },
          {
            model: Message,
            as: 'LastMessage',
            attributes: ['id', 'content', 'sender_id', 'message_type', 'created_at'],
          },
        ],
        order: [['last_message_at', 'DESC NULLS LAST'], ['created_at', 'DESC']],
      });

      // Add unread counts & format response
      const formatted = await Promise.all(
        conversations.map(async (conv) => {
          const unreadCount = await Message.count({
            where: {
              conversation_id: conv.id,
              sender_id: { [Op.ne]: req.user!.id },
              is_read: false,
            },
          });

          const otherUser =
            conv.participant1_id === req.user!.id ? conv.Participant2 : conv.Participant1;

          return {
            id: conv.id,
            other_user: otherUser?.toJSON(),
            last_message: conv.LastMessage?.toJSON() || null,
            last_message_at: conv.last_message_at,
            unread_count: unreadCount,
            created_at: conv.created_at,
          };
        })
      );

      res.json({ conversations: formatted });
    } catch (error: any) {
      console.error('Get conversations error:', error);
      res.status(500).json({ message: 'Failed to get conversations', error: error.message });
    }
  }
);

// ── Get messages for a conversation ───────────────────────────────────────────
router.get(
  '/conversations/:id/messages',
  authenticate,
  [
    param('id').isUUID(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('before').optional().isUUID(), // cursor-based pagination
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Verify user is a participant
      const conversation = await Conversation.findOne({
        where: {
          id: req.params.id,
          [Op.or]: [
            { participant1_id: req.user!.id },
            { participant2_id: req.user!.id },
          ],
        },
      });

      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }

      const limit = Number(req.query.limit) || 50;
      const where: any = { conversation_id: conversation.id };

      // Cursor-based pagination
      if (req.query.before) {
        const beforeMsg = await Message.findByPk(req.query.before as string);
        if (beforeMsg) {
          where.created_at = { [Op.lt]: beforeMsg.created_at };
        }
      }

      const messages = await Message.findAll({
        where,
        include: [
          {
            model: User,
            as: 'Sender',
            attributes: ['id', 'name'],
          },
        ],
        order: [['created_at', 'DESC']],
        limit,
      });

      // Mark unread messages from other user as read
      await Message.update(
        { is_read: true, read_at: new Date() },
        {
          where: {
            conversation_id: conversation.id,
            sender_id: { [Op.ne]: req.user!.id },
            is_read: false,
          },
        }
      );

      res.json({
        messages: messages.reverse(), // oldest first
        has_more: messages.length === limit,
      });
    } catch (error: any) {
      console.error('Get messages error:', error);
      res.status(500).json({ message: 'Failed to get messages', error: error.message });
    }
  }
);

// ── Send message (REST fallback) ──────────────────────────────────────────────
router.post(
  '/conversations/:id/messages',
  authenticate,
  [
    param('id').isUUID(),
    body('content').trim().notEmpty().isLength({ max: 5000 }),
    body('message_type').optional().isIn(['text', 'image']),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const conversation = await Conversation.findOne({
        where: {
          id: req.params.id,
          [Op.or]: [
            { participant1_id: req.user!.id },
            { participant2_id: req.user!.id },
          ],
        },
      });

      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }

      const message = await Message.create({
        conversation_id: conversation.id,
        sender_id: req.user!.id,
        content: req.body.content.trim(),
        message_type: req.body.message_type || 'text',
      });

      // Update conversation's last message
      await conversation.update({
        last_message_id: message.id,
        last_message_at: message.created_at,
      });

      const fullMessage = await Message.findByPk(message.id, {
        include: [{ model: User, as: 'Sender', attributes: ['id', 'name'] }],
      });

      res.status(201).json(fullMessage?.toJSON());
    } catch (error: any) {
      console.error('Send message error:', error);
      res.status(500).json({ message: 'Failed to send message', error: error.message });
    }
  }
);

// ── Start or get conversation with a user ─────────────────────────────────────
router.post(
  '/conversations',
  authenticate,
  [body('user_id').isUUID()],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const otherUserId = req.body.user_id;
      if (otherUserId === req.user!.id) {
        return res.status(400).json({ message: 'Cannot start conversation with yourself' });
      }

      // Verify the other user exists
      const otherUser = await User.findByPk(otherUserId);
      if (!otherUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Normalize participant order (smaller UUID first)
      const [p1, p2] =
        req.user!.id < otherUserId
          ? [req.user!.id, otherUserId]
          : [otherUserId, req.user!.id];

      // Find or create conversation
      const [conversation, created] = await Conversation.findOrCreate({
        where: {
          participant1_id: p1,
          participant2_id: p2,
        },
        defaults: {
          participant1_id: p1,
          participant2_id: p2,
        },
      });

      // If new conversation, send a system message
      if (created) {
        const sysMsg = await Message.create({
          conversation_id: conversation.id,
          sender_id: req.user!.id,
          content: 'Conversation started',
          message_type: 'system',
        });
        await conversation.update({
          last_message_id: sysMsg.id,
          last_message_at: sysMsg.created_at,
        });
      }

      // Fetch full conversation with associations
      const full = await Conversation.findByPk(conversation.id, {
        include: [
          { model: User, as: 'Participant1', attributes: ['id', 'name', 'city', 'bio'] },
          { model: User, as: 'Participant2', attributes: ['id', 'name', 'city', 'bio'] },
          { model: Message, as: 'LastMessage', attributes: ['id', 'content', 'sender_id', 'message_type', 'created_at'] },
        ],
      });

      res.status(created ? 201 : 200).json(full?.toJSON());
    } catch (error: any) {
      console.error('Start conversation error:', error);
      res.status(500).json({ message: 'Failed to start conversation', error: error.message });
    }
  }
);

// ── Mark conversation as read ─────────────────────────────────────────────────
router.post(
  '/conversations/:id/read',
  authenticate,
  [param('id').isUUID()],
  async (req: AuthRequest, res: Response) => {
    try {
      const conversation = await Conversation.findOne({
        where: {
          id: req.params.id,
          [Op.or]: [
            { participant1_id: req.user!.id },
            { participant2_id: req.user!.id },
          ],
        },
      });

      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }

      const [updated] = await Message.update(
        { is_read: true, read_at: new Date() },
        {
          where: {
            conversation_id: conversation.id,
            sender_id: { [Op.ne]: req.user!.id },
            is_read: false,
          },
        }
      );

      res.json({ marked_read: updated });
    } catch (error: any) {
      console.error('Mark read error:', error);
      res.status(500).json({ message: 'Failed to mark as read', error: error.message });
    }
  }
);

export default router;

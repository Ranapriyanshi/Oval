import express, { Response } from 'express';
import { param, body, query, validationResult } from 'express-validator';
import { Op } from 'sequelize';
import sequelize from '../config/sequelize';
import { User, Gametime, GametimeParticipant } from '../models';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// ── List gametime events ──────────────────────────────────────────────────────
router.get(
  '/',
  authenticate,
  [
    query('sport').optional().trim(),
    query('city').optional().trim(),
    query('event_type').optional().isIn(['casual', 'competitive', 'training']),
    query('skill_level').optional().isIn(['beginner', 'intermediate', 'advanced', 'any']),
    query('status').optional().isIn(['upcoming', 'in_progress', 'completed', 'cancelled']),
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
    query('offset').optional().isInt({ min: 0 }).toInt(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const where: any = {};
      if (req.query.sport) where.sport_name = { [Op.iLike]: req.query.sport as string };
      if (req.query.city) where.city = { [Op.iLike]: `%${req.query.city}%` };
      if (req.query.event_type) where.event_type = req.query.event_type;
      if (req.query.skill_level) where.skill_level = req.query.skill_level;
      where.status = (req.query.status as string) || 'upcoming';

      // Default: only show upcoming events that haven't started yet
      if (where.status === 'upcoming') {
        where.start_time = { [Op.gt]: new Date() };
      }

      const limit = Number(req.query.limit) || 20;
      const offset = Number(req.query.offset) || 0;

      const { rows: events, count: total } = await Gametime.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'Creator',
            attributes: ['id', 'name', 'city', 'country'],
          },
          {
            model: GametimeParticipant,
            as: 'GametimeParticipants',
            where: { status: 'joined' },
            required: false,
            include: [
              {
                model: User,
                as: 'User',
                attributes: ['id', 'name'],
              },
            ],
          },
        ],
        order: [['start_time', 'ASC']],
        limit,
        offset,
        distinct: true,
      });

      res.json({ events, total });
    } catch (error: any) {
      console.error('List gametime error:', error);
      res.status(500).json({ message: 'Failed to list events', error: error.message });
    }
  }
);

// ── Get gametime detail ───────────────────────────────────────────────────────
router.get(
  '/:id',
  authenticate,
  [param('id').isUUID()],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const event = await Gametime.findByPk(req.params.id, {
        include: [
          {
            model: User,
            as: 'Creator',
            attributes: ['id', 'name', 'email', 'city', 'country'],
          },
          {
            model: GametimeParticipant,
            as: 'GametimeParticipants',
            where: { status: 'joined' },
            required: false,
            include: [
              {
                model: User,
                as: 'User',
                attributes: ['id', 'name', 'city'],
              },
            ],
          },
        ],
      });

      if (!event) {
        return res.status(404).json({ message: 'Gametime event not found' });
      }

      // Check if current user has joined
      const myParticipation = await GametimeParticipant.findOne({
        where: {
          gametime_id: event.id,
          user_id: req.user!.id,
          status: 'joined',
        },
      });

      res.json({
        ...event.toJSON(),
        is_joined: !!myParticipation,
        is_creator: event.creator_id === req.user!.id,
      });
    } catch (error: any) {
      console.error('Get gametime detail error:', error);
      res.status(500).json({ message: 'Failed to get event', error: error.message });
    }
  }
);

// ── Create gametime event ─────────────────────────────────────────────────────
router.post(
  '/',
  authenticate,
  [
    body('title').trim().notEmpty().isLength({ max: 200 }),
    body('sport_name').trim().notEmpty().isLength({ max: 100 }),
    body('description').optional().trim(),
    body('event_type').isIn(['casual', 'competitive', 'training']),
    body('skill_level').isIn(['beginner', 'intermediate', 'advanced', 'any']),
    body('venue_name').optional().trim(),
    body('address').optional().trim(),
    body('city').optional().trim(),
    body('country').optional().trim(),
    body('latitude').optional().isFloat(),
    body('longitude').optional().isFloat(),
    body('start_time').isISO8601(),
    body('end_time').isISO8601(),
    body('max_players').isInt({ min: 2, max: 100 }),
    body('cost_per_person_cents').optional().isInt({ min: 0 }),
    body('currency').optional().isLength({ min: 3, max: 3 }),
    body('notes').optional().trim(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        title,
        sport_name,
        description,
        event_type,
        skill_level,
        venue_name,
        address,
        city,
        country,
        latitude,
        longitude,
        start_time,
        end_time,
        max_players,
        cost_per_person_cents,
        currency,
        notes,
      } = req.body;

      // Validate time range
      if (new Date(end_time) <= new Date(start_time)) {
        return res.status(400).json({ message: 'End time must be after start time' });
      }

      const event = await sequelize.transaction(async (t) => {
        // Create the event
        const newEvent = await Gametime.create(
          {
            creator_id: req.user!.id,
            title,
            sport_name,
            description,
            event_type,
            skill_level,
            venue_name,
            address,
            city,
            country,
            latitude,
            longitude,
            start_time,
            end_time,
            max_players,
            cost_per_person_cents: cost_per_person_cents || 0,
            currency: currency || 'AUD',
            notes,
            current_players: 1,
            status: 'upcoming',
          },
          { transaction: t }
        );

        // Creator auto-joins as participant
        await GametimeParticipant.create(
          {
            gametime_id: newEvent.id,
            user_id: req.user!.id,
            status: 'joined',
          },
          { transaction: t }
        );

        return newEvent;
      });

      res.status(201).json(event.toJSON());
    } catch (error: any) {
      console.error('Create gametime error:', error);
      res.status(500).json({ message: 'Failed to create event', error: error.message });
    }
  }
);

// ── Join gametime event ───────────────────────────────────────────────────────
router.post(
  '/:id/join',
  authenticate,
  [param('id').isUUID()],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const event = await Gametime.findByPk(req.params.id);
      if (!event) {
        return res.status(404).json({ message: 'Gametime event not found' });
      }

      if (event.status !== 'upcoming') {
        return res.status(400).json({ message: 'Cannot join a non-upcoming event' });
      }

      if (event.current_players >= event.max_players) {
        return res.status(400).json({ message: 'Event is full' });
      }

      // Check if already joined
      const existing = await GametimeParticipant.findOne({
        where: {
          gametime_id: event.id,
          user_id: req.user!.id,
        },
      });

      if (existing && existing.status === 'joined') {
        return res.status(400).json({ message: 'Already joined this event' });
      }

      await sequelize.transaction(async (t) => {
        if (existing) {
          // Rejoin (was previously left)
          await existing.update({ status: 'joined', joined_at: new Date() }, { transaction: t });
        } else {
          await GametimeParticipant.create(
            {
              gametime_id: event.id,
              user_id: req.user!.id,
              status: 'joined',
            },
            { transaction: t }
          );
        }

        await event.update(
          { current_players: event.current_players + 1 },
          { transaction: t }
        );
      });

      res.json({ message: 'Joined successfully', current_players: event.current_players + 1 });
    } catch (error: any) {
      console.error('Join gametime error:', error);
      res.status(500).json({ message: 'Failed to join event', error: error.message });
    }
  }
);

// ── Leave gametime event ──────────────────────────────────────────────────────
router.post(
  '/:id/leave',
  authenticate,
  [param('id').isUUID()],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const event = await Gametime.findByPk(req.params.id);
      if (!event) {
        return res.status(404).json({ message: 'Gametime event not found' });
      }

      if (event.creator_id === req.user!.id) {
        return res.status(400).json({ message: 'Creator cannot leave their own event. Cancel it instead.' });
      }

      const participation = await GametimeParticipant.findOne({
        where: {
          gametime_id: event.id,
          user_id: req.user!.id,
          status: 'joined',
        },
      });

      if (!participation) {
        return res.status(400).json({ message: 'Not currently joined' });
      }

      await sequelize.transaction(async (t) => {
        await participation.update({ status: 'left' }, { transaction: t });
        await event.update(
          { current_players: Math.max(1, event.current_players - 1) },
          { transaction: t }
        );
      });

      res.json({ message: 'Left successfully', current_players: Math.max(1, event.current_players - 1) });
    } catch (error: any) {
      console.error('Leave gametime error:', error);
      res.status(500).json({ message: 'Failed to leave event', error: error.message });
    }
  }
);

// ── Cancel gametime event (creator only) ──────────────────────────────────────
router.post(
  '/:id/cancel',
  authenticate,
  [param('id').isUUID()],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const event = await Gametime.findByPk(req.params.id);
      if (!event) {
        return res.status(404).json({ message: 'Gametime event not found' });
      }

      if (event.creator_id !== req.user!.id) {
        return res.status(403).json({ message: 'Only the creator can cancel this event' });
      }

      if (event.status !== 'upcoming') {
        return res.status(400).json({ message: 'Can only cancel upcoming events' });
      }

      await event.update({ status: 'cancelled' });
      res.json({ message: 'Event cancelled', event: event.toJSON() });
    } catch (error: any) {
      console.error('Cancel gametime error:', error);
      res.status(500).json({ message: 'Failed to cancel event', error: error.message });
    }
  }
);

// ── My gametime events ────────────────────────────────────────────────────────
router.get(
  '/my/events',
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      // Events I created
      const created = await Gametime.findAll({
        where: { creator_id: req.user!.id },
        include: [
          {
            model: GametimeParticipant,
            as: 'GametimeParticipants',
            where: { status: 'joined' },
            required: false,
            include: [{ model: User, as: 'User', attributes: ['id', 'name'] }],
          },
        ],
        order: [['start_time', 'ASC']],
      });

      // Events I joined (but didn't create)
      const participations = await GametimeParticipant.findAll({
        where: {
          user_id: req.user!.id,
          status: 'joined',
        },
        attributes: ['gametime_id'],
        raw: true,
      });

      const joinedIds = participations.map((p: any) => p.gametime_id);

      const joined = await Gametime.findAll({
        where: {
          id: { [Op.in]: joinedIds },
          creator_id: { [Op.ne]: req.user!.id }, // exclude created ones
        },
        include: [
          {
            model: User,
            as: 'Creator',
            attributes: ['id', 'name'],
          },
          {
            model: GametimeParticipant,
            as: 'GametimeParticipants',
            where: { status: 'joined' },
            required: false,
            include: [{ model: User, as: 'User', attributes: ['id', 'name'] }],
          },
        ],
        order: [['start_time', 'ASC']],
      });

      res.json({ created, joined });
    } catch (error: any) {
      console.error('My gametime error:', error);
      res.status(500).json({ message: 'Failed to get your events', error: error.message });
    }
  }
);

export default router;

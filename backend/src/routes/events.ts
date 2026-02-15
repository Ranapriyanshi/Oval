import express, { Response } from 'express';
import { param, body, query, validationResult } from 'express-validator';
import { Op } from 'sequelize';
import { Event, EventRegistration, User, Venue } from '../models';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get(
  '/',
  authenticate,
  [
    query('sport').optional().trim(),
    query('event_type').optional().isIn(['tournament', 'meetup', 'league']),
    query('status').optional().isIn(['open', 'closed', 'completed']),
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
    query('offset').optional().isInt({ min: 0 }).toInt(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const where: any = { status: (req.query.status as string) || 'open' };
      if (req.query.sport) where.sport_name = { [Op.iLike]: req.query.sport as string };
      if (req.query.event_type) where.event_type = req.query.event_type;
      where.start_time = { [Op.gte]: new Date() };

      const limit = Number(req.query.limit) || 20;
      const offset = Number(req.query.offset) || 0;

      const { rows: events, count: total } = await Event.findAndCountAll({
        where,
        include: [
          { model: User, as: 'Organizer', attributes: ['id', 'name', 'city'] },
          { model: EventRegistration, as: 'Registrations', where: { status: 'registered' }, required: false, attributes: ['id'] },
        ],
        order: [['start_time', 'ASC']],
        limit,
        offset,
        distinct: true,
      });

      const list = events.map((e) => {
        const j = e.toJSON() as any;
        j.registered_count = j.Registrations?.length ?? 0;
        delete j.Registrations;
        return j;
      });
      res.json({ events: list, total });
    } catch (error: any) {
      console.error('List events error:', error);
      res.status(500).json({ message: 'Failed to list events', error: error.message });
    }
  }
);

router.get(
  '/my/events',
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const regs = await EventRegistration.findAll({
        where: { user_id: req.user!.id, status: 'registered' },
        include: [
          { model: Event, as: 'Event', include: [{ model: User, as: 'Organizer', attributes: ['id', 'name', 'city'] }] },
        ],
        order: [[{ model: Event, as: 'Event' }, 'start_time', 'ASC']],
      });
      const events = regs.map((r) => (r as any).Event).filter(Boolean);
      res.json({ events });
    } catch (error: any) {
      console.error('My events error:', error);
      res.status(500).json({ message: 'Failed to get my events', error: error.message });
    }
  }
);

router.get(
  '/:id',
  authenticate,
  [param('id').isUUID()],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const event = await Event.findByPk(req.params.id, {
        include: [
          { model: User, as: 'Organizer', attributes: ['id', 'name', 'city', 'country'] },
          { model: Venue, as: 'Venue', attributes: ['id', 'name', 'address', 'city'], required: false },
          {
            model: EventRegistration,
            as: 'Registrations',
            where: { status: 'registered' },
            required: false,
            include: [{ model: User, as: 'User', attributes: ['id', 'name'] }],
          },
        ],
      });
      if (!event) return res.status(404).json({ message: 'Event not found' });
      const userId = req.user!.id;
      const myReg = await EventRegistration.findOne({
        where: { event_id: event.id, user_id: userId },
      });
      const json = event.toJSON() as any;
      json.is_registered = myReg?.status === 'registered';
      json.registered_count = json.Registrations?.length ?? 0;
      res.json(json);
    } catch (error: any) {
      console.error('Get event error:', error);
      res.status(500).json({ message: 'Failed to get event', error: error.message });
    }
  }
);

router.post(
  '/',
  authenticate,
  [
    body('title').trim().notEmpty(),
    body('sport_name').trim().notEmpty(),
    body('event_type').isIn(['tournament', 'meetup', 'league']),
    body('start_time').isISO8601(),
    body('end_time').isISO8601(),
    body('max_participants').optional().isInt({ min: 2, max: 256 }).toInt(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const data = {
        organizer_id: req.user!.id,
        title: req.body.title,
        sport_name: req.body.sport_name,
        event_type: req.body.event_type,
        description: req.body.description,
        venue_id: req.body.venue_id || null,
        address: req.body.address,
        city: req.body.city,
        country: req.body.country,
        start_time: new Date(req.body.start_time),
        end_time: new Date(req.body.end_time),
        max_participants: req.body.max_participants || 32,
        registration_deadline: req.body.registration_deadline ? new Date(req.body.registration_deadline) : null,
        status: 'open',
        bracket_type: req.body.bracket_type || null,
      };
      const event = await Event.create(data);
      res.status(201).json(event.toJSON());
    } catch (error: any) {
      console.error('Create event error:', error);
      res.status(500).json({ message: 'Failed to create event', error: error.message });
    }
  }
);

router.post(
  '/:id/register',
  authenticate,
  [param('id').isUUID()],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const event = await Event.findByPk(req.params.id);
      if (!event) return res.status(404).json({ message: 'Event not found' });
      if (event.status !== 'open') return res.status(400).json({ message: 'Registration is not open' });
      if (event.registration_deadline && new Date() > event.registration_deadline) {
        return res.status(400).json({ message: 'Registration deadline has passed' });
      }
      const count = await EventRegistration.count({
        where: { event_id: event.id, status: 'registered' },
      });
      if (count >= event.max_participants) return res.status(400).json({ message: 'Event is full' });

      const [reg] = await EventRegistration.findOrCreate({
        where: { event_id: event.id, user_id: req.user!.id },
        defaults: { event_id: event.id, user_id: req.user!.id, status: 'registered' },
      });
      if (reg.status === 'cancelled') await reg.update({ status: 'registered' });
      res.json({ message: 'Registered', registration: reg.toJSON() });
    } catch (error: any) {
      console.error('Register event error:', error);
      res.status(500).json({ message: 'Failed to register', error: error.message });
    }
  }
);

router.post(
  '/:id/unregister',
  authenticate,
  [param('id').isUUID()],
  async (req: AuthRequest, res: Response) => {
    try {
      const reg = await EventRegistration.findOne({
        where: { event_id: req.params.id, user_id: req.user!.id },
      });
      if (!reg) return res.status(404).json({ message: 'Registration not found' });
      await reg.update({ status: 'cancelled' });
      res.json({ message: 'Unregistered' });
    } catch (error: any) {
      console.error('Unregister error:', error);
      res.status(500).json({ message: 'Failed to unregister', error: error.message });
    }
  }
);

export default router;

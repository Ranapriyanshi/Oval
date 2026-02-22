import express, { Response } from 'express';
import { param, body, query, validationResult } from 'express-validator';
import { Op } from 'sequelize';
import { User, Coach, CoachAvailability, CoachingSession, CoachRating } from '../models';
import { authenticate, AuthRequest } from '../middleware/auth';
import { awardXP } from '../services/xpService';

const router = express.Router();

// ── List coaches ──────────────────────────────────────────────────────────────
router.get(
  '/',
  authenticate,
  [
    query('sport').optional().isString(),
    query('city').optional().isString(),
    query('min_rating').optional().isFloat({ min: 0, max: 5 }),
    query('max_rate').optional().isFloat({ min: 0 }),
    query('verified').optional().isBoolean(),
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
    query('offset').optional().isInt({ min: 0 }).toInt(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const where: any = { is_active: true };

      if (req.query.sport) {
        where.specializations = { [Op.contains]: [req.query.sport] };
      }
      if (req.query.city) {
        where.city = { [Op.iLike]: `%${req.query.city}%` };
      }
      if (req.query.min_rating) {
        where.rating_avg = { [Op.gte]: parseFloat(req.query.min_rating as string) };
      }
      if (req.query.max_rate) {
        where.hourly_rate = { [Op.lte]: parseFloat(req.query.max_rate as string) };
      }
      if (req.query.verified === 'true') {
        where.is_verified = true;
      }

      const limit = Number(req.query.limit) || 20;
      const offset = Number(req.query.offset) || 0;

      const { rows: coaches, count } = await Coach.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'User',
            attributes: ['id', 'name', 'city', 'bio'],
          },
          {
            model: CoachAvailability,
            as: 'Availabilities',
            where: { is_active: true },
            required: false,
          },
        ],
        order: [
          ['is_verified', 'DESC'],
          ['rating_avg', 'DESC'],
          ['total_sessions', 'DESC'],
        ],
        limit,
        offset,
        distinct: true,
      });

      res.json({
        coaches: coaches.map((c) => c.toJSON()),
        total: count,
        limit,
        offset,
      });
    } catch (error: any) {
      console.error('List coaches error:', error);
      res.status(500).json({ message: 'Failed to list coaches', error: error.message });
    }
  }
);

// ── Get coach detail ──────────────────────────────────────────────────────────
router.get(
  '/:id',
  authenticate,
  [param('id').isUUID()],
  async (req: AuthRequest, res: Response) => {
    try {
      const coach = await Coach.findByPk(req.params.id, {
        include: [
          {
            model: User,
            as: 'User',
            attributes: ['id', 'name', 'city', 'bio', 'karma_points'],
          },
          {
            model: CoachAvailability,
            as: 'Availabilities',
            where: { is_active: true },
            required: false,
          },
          {
            model: CoachRating,
            as: 'Ratings',
            include: [
              {
                model: User,
                as: 'User',
                attributes: ['id', 'name'],
              },
            ],
            order: [['created_at', 'DESC']],
            limit: 10,
          },
        ],
      });

      if (!coach) {
        return res.status(404).json({ message: 'Coach not found' });
      }

      res.json(coach.toJSON());
    } catch (error: any) {
      console.error('Get coach error:', error);
      res.status(500).json({ message: 'Failed to get coach', error: error.message });
    }
  }
);

// ── Book a coaching session ───────────────────────────────────────────────────
router.post(
  '/:id/book',
  authenticate,
  [
    param('id').isUUID(),
    body('sport').trim().notEmpty(),
    body('session_date').isISO8601(),
    body('start_time').matches(/^\d{2}:\d{2}$/),
    body('duration_minutes').optional().isInt({ min: 30, max: 180 }).toInt(),
    body('notes').optional().trim(),
    body('location').optional().trim(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const coach = await Coach.findByPk(req.params.id);
      if (!coach || !coach.is_active) {
        return res.status(404).json({ message: 'Coach not found or inactive' });
      }

      // Can't book yourself
      if (coach.user_id === req.user!.id) {
        return res.status(400).json({ message: 'You cannot book yourself as a coach' });
      }

      const duration = req.body.duration_minutes || 60;
      const [startH, startM] = req.body.start_time.split(':').map(Number);
      const endMinutes = startH * 60 + startM + duration;
      const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;

      // Calculate cost based on hourly rate
      const cost = (Number(coach.hourly_rate) * duration) / 60;

      // Check for conflicting sessions
      const conflict = await CoachingSession.findOne({
        where: {
          coach_id: coach.id,
          session_date: req.body.session_date,
          status: { [Op.in]: ['pending', 'confirmed'] },
          [Op.or]: [
            {
              start_time: { [Op.lt]: endTime },
              end_time: { [Op.gt]: req.body.start_time },
            },
          ],
        },
      });

      if (conflict) {
        return res.status(409).json({ message: 'This time slot is already booked' });
      }

      const session = await CoachingSession.create({
        coach_id: coach.id,
        student_id: req.user!.id,
        sport: req.body.sport.trim(),
        session_date: req.body.session_date,
        start_time: req.body.start_time,
        end_time: endTime,
        duration_minutes: duration,
        cost,
        currency: coach.currency,
        notes: req.body.notes?.trim() || null,
        location: req.body.location?.trim() || null,
      });

      const fullSession = await CoachingSession.findByPk(session.id, {
        include: [
          {
            model: Coach,
            as: 'Coach',
            include: [{ model: User, as: 'User', attributes: ['id', 'name'] }],
          },
          { model: User, as: 'Student', attributes: ['id', 'name'] },
        ],
      });

      let xpResult = null;
      try {
        xpResult = await awardXP(req.user!.id, 'coaching_completed', session.id);
      } catch (xpErr) {
        console.error('XP award error (non-blocking):', xpErr);
      }

      res.status(201).json({ ...(fullSession?.toJSON() ?? {}), xp: xpResult });
    } catch (error: any) {
      console.error('Book session error:', error);
      res.status(500).json({ message: 'Failed to book session', error: error.message });
    }
  }
);

// ── Get my sessions (as student) ──────────────────────────────────────────────
router.get(
  '/sessions/my',
  authenticate,
  [
    query('status').optional().isIn(['pending', 'confirmed', 'completed', 'cancelled']),
    query('upcoming').optional().isBoolean(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const where: any = { student_id: req.user!.id };

      if (req.query.status) {
        where.status = req.query.status;
      }

      if (req.query.upcoming === 'true') {
        where.session_date = { [Op.gte]: new Date().toISOString().split('T')[0] };
        where.status = { [Op.in]: ['pending', 'confirmed'] };
      }

      const sessions = await CoachingSession.findAll({
        where,
        include: [
          {
            model: Coach,
            as: 'Coach',
            include: [{ model: User, as: 'User', attributes: ['id', 'name', 'city'] }],
          },
        ],
        order: [['session_date', 'ASC'], ['start_time', 'ASC']],
      });

      res.json({ sessions: sessions.map((s) => s.toJSON()) });
    } catch (error: any) {
      console.error('Get my sessions error:', error);
      res.status(500).json({ message: 'Failed to get sessions', error: error.message });
    }
  }
);

// ── Cancel a session ──────────────────────────────────────────────────────────
router.post(
  '/sessions/:id/cancel',
  authenticate,
  [param('id').isUUID()],
  async (req: AuthRequest, res: Response) => {
    try {
      const session = await CoachingSession.findByPk(req.params.id);

      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }

      // Only student or coach can cancel
      const coach = await Coach.findByPk(session.coach_id);
      if (session.student_id !== req.user!.id && coach?.user_id !== req.user!.id) {
        return res.status(403).json({ message: 'Not authorized to cancel this session' });
      }

      if (session.status === 'cancelled' || session.status === 'completed') {
        return res.status(400).json({ message: `Session is already ${session.status}` });
      }

      await session.update({ status: 'cancelled' });
      res.json({ message: 'Session cancelled', session: session.toJSON() });
    } catch (error: any) {
      console.error('Cancel session error:', error);
      res.status(500).json({ message: 'Failed to cancel session', error: error.message });
    }
  }
);

// ── Rate a coach ──────────────────────────────────────────────────────────────
router.post(
  '/:id/rate',
  authenticate,
  [
    param('id').isUUID(),
    body('rating').isInt({ min: 1, max: 5 }),
    body('review').optional().trim().isLength({ max: 1000 }),
    body('session_id').optional().isUUID(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const coach = await Coach.findByPk(req.params.id);
      if (!coach) {
        return res.status(404).json({ message: 'Coach not found' });
      }

      // Can't rate yourself
      if (coach.user_id === req.user!.id) {
        return res.status(400).json({ message: 'You cannot rate yourself' });
      }

      // Check for existing rating
      const existing = await CoachRating.findOne({
        where: { coach_id: coach.id, user_id: req.user!.id },
      });

      if (existing) {
        // Update existing rating
        await existing.update({
          rating: req.body.rating,
          review: req.body.review?.trim() || existing.review,
        });
      } else {
        // Create new rating
        await CoachRating.create({
          coach_id: coach.id,
          user_id: req.user!.id,
          session_id: req.body.session_id || null,
          rating: req.body.rating,
          review: req.body.review?.trim() || null,
        });
      }

      // Recalculate average
      const allRatings = await CoachRating.findAll({ where: { coach_id: coach.id } });
      const avg = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;

      await coach.update({
        rating_avg: Math.round(avg * 100) / 100,
        rating_count: allRatings.length,
      });

      res.json({
        message: existing ? 'Rating updated' : 'Rating submitted',
        rating_avg: coach.rating_avg,
        rating_count: coach.rating_count,
      });
    } catch (error: any) {
      console.error('Rate coach error:', error);
      res.status(500).json({ message: 'Failed to rate coach', error: error.message });
    }
  }
);

export default router;

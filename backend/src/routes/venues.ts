import express, { Request, Response } from 'express';
import { query, param, body, validationResult } from 'express-validator';
import { Op } from 'sequelize';
import {
  Venue,
  VenueSport,
  VenueImage,
  VenueSchedule,
  VenueRating,
  Booking,
} from '../models';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// List/search venues
router.get(
  '/',
  [
    query('country').optional().isLength({ min: 2, max: 2 }).trim(),
    query('city').optional().trim(),
    query('sport').optional().trim(),
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
    query('offset').optional().isInt({ min: 0 }).toInt(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { country, city, sport, limit = 20, offset = 0 } = req.query as Record<string, string>;

      const where: Record<string, unknown> = {};
      if (country) where.country_code = country;
      if (city) where.city = { [Op.iLike]: `%${city}%` };

      const include: any[] = [
        { model: VenueSport, as: 'VenueSports', attributes: ['sport_name', 'hourly_rate_cents'] },
        { model: VenueImage, as: 'VenueImages', attributes: ['url', 'sort_order'] },
      ];

      if (sport) {
        include[0] = {
          ...include[0],
          where: { sport_name: { [Op.iLike]: sport } },
          required: true,
        };
      }

      const { count, rows } = await Venue.findAndCountAll({
        where,
        include,
        limit: Number(limit),
        offset: Number(offset),
        order: [['name', 'ASC']],
        distinct: true,
      });

      const venueIds = rows.map((v) => v.id);
      const allRatings = await VenueRating.findAll({
        where: { venue_id: venueIds },
        attributes: ['venue_id', 'rating'],
        raw: true,
      });
      const ratingMap: Record<string, { avg: string; count: number }> = {};
      venueIds.forEach((id) => {
        const venueRatings = (allRatings as any[]).filter((r) => r.venue_id === id).map((r) => r.rating);
        const count = venueRatings.length;
        const avg = count ? (venueRatings.reduce((a, b) => a + b, 0) / count).toFixed(1) : '0';
        ratingMap[id] = { avg, count };
      });

      const list = rows.map((v) => {
        const j = v.toJSON() as any;
        j.rating = ratingMap[j.id] || { avg: null, count: 0 };
        return j;
      });

      res.json({ venues: list, total: count });
    } catch (error: any) {
      console.error('List venues error:', error);
      res.status(500).json({ message: 'Failed to list venues', error: error.message });
    }
  }
);

// Get venue by id
router.get(
  '/:id',
  [param('id').isUUID()],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const venue = await Venue.findByPk(req.params.id, {
        include: [
          { model: VenueSport, as: 'VenueSports', attributes: ['sport_name', 'hourly_rate_cents'] },
          { model: VenueImage, as: 'VenueImages', attributes: ['url', 'sort_order'], order: [['sort_order', 'ASC']] },
          { model: VenueSchedule, as: 'VenueSchedules', attributes: ['day_of_week', 'open_time', 'close_time'] },
        ],
      });

      if (!venue) {
        return res.status(404).json({ message: 'Venue not found' });
      }

      const venueRatings = await VenueRating.findAll({
        where: { venue_id: venue.id },
        attributes: ['rating'],
        raw: true,
      });
      const rList = (venueRatings as any[]).map((r) => r.rating);
      const avgRating = rList.length ? (rList.reduce((a, b) => a + b, 0) / rList.length).toFixed(1) : null;

      const out = venue.toJSON() as any;
      out.rating = { avg: avgRating, count: rList.length };
      res.json(out);
    } catch (error: any) {
      console.error('Get venue error:', error);
      res.status(500).json({ message: 'Failed to get venue', error: error.message });
    }
  }
);

// Get venue availability (slots for a given date)
router.get(
  '/:id/availability',
  [
    param('id').isUUID(),
    query('date').isISO8601(),
    query('sport').trim().notEmpty(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const venue = await Venue.findByPk(req.params.id, {
        include: [
          { model: VenueSchedule, as: 'VenueSchedules' },
          { model: VenueSport, as: 'VenueSports', where: { sport_name: { [Op.iLike]: (req.query.sport as string) } }, required: false },
        ],
      });

      if (!venue) {
        return res.status(404).json({ message: 'Venue not found' });
      }

      const dateStr = req.query.date as string;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) {
        return res.status(400).json({ message: 'Invalid date' });
      }
      const dayOfWeek = d.getDay();
      const schedules = (venue as any).VenueSchedules || [];
      const daySchedule = schedules.find((s: any) => s.day_of_week === dayOfWeek);
      if (!daySchedule) {
        return res.json({ slots: [], message: 'Venue closed on this day' });
      }

      const startOfDay = new Date(d);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(d);
      endOfDay.setUTCHours(23, 59, 59, 999);

      const [openH, openM] = daySchedule.open_time.split(':').map(Number);
      const [closeH, closeM] = daySchedule.close_time.split(':').map(Number);
      const slotStart = new Date(d);
      slotStart.setHours(openH, openM, 0, 0);
      const slotEnd = new Date(d);
      slotEnd.setHours(closeH, closeM, 0, 0);

      const existingBookings = await Booking.findAll({
        where: {
          venue_id: venue.id,
          status: { [Op.ne]: 'cancelled' },
          [Op.or]: [
            { start_time: { [Op.between]: [slotStart, slotEnd] } },
            { end_time: { [Op.between]: [slotStart, slotEnd] } },
          ],
        },
        attributes: ['start_time', 'end_time'],
      });

      const slotDurationMs = 60 * 60 * 1000;
      const slots: { start: string; end: string; available: boolean }[] = [];
      let current = new Date(slotStart);
      while (current < slotEnd) {
        const slotEndTime = new Date(current.getTime() + slotDurationMs);
        if (slotEndTime > slotEnd) break;
        const overlaps = existingBookings.some(
          (b) => (current >= b.start_time && current < b.end_time) || (slotEndTime > b.start_time && slotEndTime <= b.end_time) || (current <= b.start_time && slotEndTime >= b.end_time)
        );
        slots.push({
          start: current.toISOString(),
          end: slotEndTime.toISOString(),
          available: !overlaps,
        });
        current = slotEndTime;
      }

      const sportRow = (venue as any).VenueSports?.[0];
      const hourlyRateCents = sportRow ? sportRow.hourly_rate_cents : 0;

      res.json({ slots, hourly_rate_cents: hourlyRateCents, currency: venue.currency });
    } catch (error: any) {
      console.error('Availability error:', error);
      res.status(500).json({ message: 'Failed to get availability', error: error.message });
    }
  }
);

// Rate a venue (authenticated)
router.post(
  '/:id/rate',
  authenticate,
  [
    param('id').isUUID(),
    body('rating').isInt({ min: 1, max: 5 }),
    body('comment').optional().trim().isLength({ max: 1000 }),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const venue = await Venue.findByPk(req.params.id);
      if (!venue) {
        return res.status(404).json({ message: 'Venue not found' });
      }

      const [rating, created] = await VenueRating.findOrCreate({
        where: { venue_id: venue.id, user_id: req.user!.id },
        defaults: {
          venue_id: venue.id,
          user_id: req.user!.id,
          rating: req.body.rating,
          comment: req.body.comment || null,
        },
      });
      if (!created) {
        await rating.update({ rating: req.body.rating, comment: req.body.comment || null });
      }

      res.json(rating.toJSON());
    } catch (error: any) {
      console.error('Rate venue error:', error);
      res.status(500).json({ message: 'Failed to rate venue', error: error.message });
    }
  }
);

export default router;

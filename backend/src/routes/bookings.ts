import express, { Request, Response } from 'express';
import { param, body, query, validationResult } from 'express-validator';
import { Booking, Venue, VenueSport } from '../models';
import { authenticate, AuthRequest } from '../middleware/auth';
import { Op } from 'sequelize';

const router = express.Router();

// List current user's bookings
router.get(
  '/',
  authenticate,
  [
    query('status').optional().isIn(['confirmed', 'cancelled', 'completed']).trim(),
    query('upcoming').optional().isBoolean().toBoolean(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const where: Record<string, unknown> = { user_id: req.user!.id };
      if (req.query.status) where.status = req.query.status;
      if (req.query.upcoming === 'true') {
        where.start_time = { [Op.gte]: new Date() };
      }

      const bookings = await Booking.findAll({
        where,
        include: [{ model: Venue, as: 'Venue', attributes: ['id', 'name', 'address', 'city', 'country_code', 'currency'] }],
        order: [['start_time', 'DESC']],
        limit: 50,
      });

      res.json({ bookings });
    } catch (error: any) {
      console.error('List bookings error:', error);
      res.status(500).json({ message: 'Failed to list bookings', error: error.message });
    }
  }
);

// Create booking (book a slot)
router.post(
  '/',
  authenticate,
  [
    body('venue_id').isUUID(),
    body('sport_name').trim().notEmpty(),
    body('start_time').isISO8601(),
    body('end_time').isISO8601(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { venue_id, sport_name, start_time, end_time } = req.body;
      const start = new Date(start_time);
      const end = new Date(end_time);

      if (start >= end) {
        return res.status(400).json({ message: 'start_time must be before end_time' });
      }
      if (start < new Date()) {
        return res.status(400).json({ message: 'Cannot book in the past' });
      }

      const venue = await Venue.findByPk(venue_id);
      if (!venue) {
        return res.status(404).json({ message: 'Venue not found' });
      }

      const venueSport = await VenueSport.findOne({
        where: { venue_id, sport_name: { [Op.iLike]: sport_name } },
      });
      if (!venueSport) {
        return res.status(400).json({ message: 'Sport not offered at this venue' });
      }

      const overlapping = await Booking.findOne({
        where: {
          venue_id,
          status: { [Op.ne]: 'cancelled' },
          [Op.or]: [
            { start_time: { [Op.between]: [start, end] } },
            { end_time: { [Op.between]: [start, end] } },
            { [Op.and]: [{ start_time: { [Op.lte]: start } }, { end_time: { [Op.gte]: end } }] },
          ],
        },
      });
      if (overlapping) {
        return res.status(409).json({ message: 'This slot is no longer available' });
      }

      const durationHours = (end.getTime() - start.getTime()) / (60 * 60 * 1000);
      const totalCents = Math.round(venueSport.hourly_rate_cents * durationHours);

      const booking = await Booking.create({
        venue_id,
        user_id: req.user!.id,
        sport_name: venueSport.sport_name,
        start_time: start,
        end_time: end,
        total_cents: totalCents,
        currency: venue.currency,
        status: 'confirmed',
      });

      const withVenue = await Booking.findByPk(booking.id, {
        include: [{ model: Venue, as: 'Venue', attributes: ['id', 'name', 'address', 'city', 'currency'] }],
      });

      res.status(201).json(withVenue?.toJSON() ?? booking.toJSON());
    } catch (error: any) {
      console.error('Create booking error:', error);
      res.status(500).json({ message: 'Failed to create booking', error: error.message });
    }
  }
);

// Cancel booking
router.put(
  '/:id/cancel',
  authenticate,
  [param('id').isUUID()],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const booking = await Booking.findByPk(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      if (booking.user_id !== req.user!.id) {
        return res.status(403).json({ message: 'Not allowed to cancel this booking' });
      }
      if (booking.status === 'cancelled') {
        return res.status(400).json({ message: 'Booking is already cancelled' });
      }

      await booking.update({ status: 'cancelled' });
      res.json(booking.toJSON());
    } catch (error: any) {
      console.error('Cancel booking error:', error);
      res.status(500).json({ message: 'Failed to cancel booking', error: error.message });
    }
  }
);

export default router;

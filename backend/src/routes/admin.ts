import express, { Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { requireAdmin } from '../middleware/adminAuth';
import { User, Venue, Event, Booking, Gametime } from '../models';

const router = express.Router();
router.use(authenticate);
router.use(requireAdmin);

router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const [usersCount, venuesCount, eventsCount, bookingsCount, gametimesCount] = await Promise.all([
      User.count(),
      Venue.count(),
      Event.count(),
      Booking.count(),
      Gametime.count(),
    ]);
    res.json({
      users: usersCount,
      venues: venuesCount,
      events: eventsCount,
      bookings: bookingsCount,
      gametimes: gametimesCount,
    });
  } catch (error: any) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Failed to get stats', error: error.message });
  }
});

router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const limit = Math.min(parseInt(String(req.query.limit)) || 50, 100);
    const offset = parseInt(String(req.query.offset)) || 0;
    const { rows, count } = await User.findAndCountAll({
      attributes: ['id', 'email', 'name', 'country', 'city', 'karma_points', 'created_at'],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });
    res.json({ users: rows, total: count });
  } catch (error: any) {
    console.error('Admin users error:', error);
    res.status(500).json({ message: 'Failed to list users', error: error.message });
  }
});

export default router;

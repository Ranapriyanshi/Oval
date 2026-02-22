import express, { Response } from 'express';
import { query, validationResult } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getProfile, getXPHistory, awardXP } from '../services/xpService';
import { TIER_LABELS } from '../models/OvaloProfile';
import { XP_VALUES } from '../models/XPTransaction';
import OvaloProfile from '../models/OvaloProfile';
import User from '../models/User';

const router = express.Router();

router.get('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const profile = await getProfile(req.user!.id);
    const user = await User.findByPk(req.user!.id, { attributes: ['name', 'avatar_choice'] });
    res.json({
      ...profile,
      tier_label: TIER_LABELS[profile.tier],
      user_name: user?.name,
      avatar_choice: user?.avatar_choice,
    });
  } catch (error: any) {
    console.error('Get Ovalo profile error:', error);
    res.status(500).json({ message: 'Failed to get Ovalo profile', error: error.message });
  }
});

router.get(
  '/history',
  authenticate,
  [
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
    query('offset').optional().isInt({ min: 0 }).toInt(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const limit = (req.query.limit as unknown as number) || 20;
      const offset = (req.query.offset as unknown as number) || 0;
      const result = await getXPHistory(req.user!.id, limit, offset);
      res.json(result);
    } catch (error: any) {
      console.error('Get XP history error:', error);
      res.status(500).json({ message: 'Failed to get XP history', error: error.message });
    }
  }
);

router.get('/leaderboard', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const offset = Number(req.query.offset) || 0;

    const profiles = await OvaloProfile.findAndCountAll({
      order: [['total_xp', 'DESC']],
      limit,
      offset,
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'name', 'city', 'country', 'avatar_choice'],
        },
      ],
    });

    const leaderboard = profiles.rows.map((p, i) => ({
      rank: offset + i + 1,
      user_id: p.user_id,
      name: (p as any).User?.name,
      city: (p as any).User?.city,
      country: (p as any).User?.country,
      avatar_choice: (p as any).User?.avatar_choice,
      total_xp: p.total_xp,
      tier: p.tier,
      tier_label: TIER_LABELS[p.tier],
      feather_level: p.feather_level,
      streak: p.current_streak,
    }));

    res.json({ leaderboard, total: profiles.count });
  } catch (error: any) {
    console.error('Get Ovalo leaderboard error:', error);
    res.status(500).json({ message: 'Failed to get leaderboard', error: error.message });
  }
});

router.get('/xp-values', authenticate, async (_req: AuthRequest, res: Response) => {
  res.json(XP_VALUES);
});

export default router;

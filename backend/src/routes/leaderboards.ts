import express, { Response } from 'express';
import { param, query, validationResult } from 'express-validator';
import { Op } from 'sequelize';
import { User, UserStats } from '../models';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// ── GET /api/leaderboards - Global leaderboard (by karma or by wins) ─────────────
router.get(
  '/',
  authenticate,
  [
    query('sort').optional().isIn(['karma', 'wins', 'matches']),
    query('sport').optional().trim(),
    query('country').optional().trim().isLength({ min: 2, max: 2 }),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('offset').optional().isInt({ min: 0 }).toInt(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const sort = (req.query.sort as string) || 'karma';
      const sport = (req.query.sport as string)?.trim();
      const country = (req.query.country as string)?.trim()?.toUpperCase();
      const limit = Number(req.query.limit) || 50;
      const offset = Number(req.query.offset) || 0;

      if (sort === 'karma') {
        const where: any = {};
        if (country) where.country = country;
        const { rows: users, count: total } = await User.findAndCountAll({
          where,
          attributes: ['id', 'name', 'city', 'country', 'karma_points'],
          order: [['karma_points', 'DESC']],
          limit,
          offset,
        });
        const leaderboard = users.map((u, i) => ({
          rank: offset + i + 1,
          user_id: u.id,
          name: u.name,
          city: u.city,
          country: u.country,
          karma_points: u.karma_points,
        }));
        return res.json({ leaderboard, total, sort: 'karma' });
      }

      // sort by wins or matches: need to join UserStats and optionally filter by sport
      const whereStats: any = {};
      if (sport) whereStats.sport = { [Op.iLike]: sport };
      const stats = await UserStats.findAll({
        where: Object.keys(whereStats).length ? whereStats : undefined,
        attributes: ['user_id', 'sport', 'matches_played', 'wins', 'losses', 'hours_played'],
        raw: true,
      });
      const byUser = new Map<string, { matches_played: number; wins: number; user_id: string; sport?: string }>();
      for (const s of stats) {
        const cur = byUser.get(s.user_id) || { user_id: s.user_id, matches_played: 0, wins: 0 };
        cur.matches_played += s.matches_played || 0;
        cur.wins += s.wins || 0;
        if (sport) cur.sport = s.sport;
        byUser.set(s.user_id, cur);
      }
      const sorted = [...byUser.entries()]
        .map(([_, v]) => v)
        .sort((a, b) =>
          sort === 'wins'
            ? (b.wins ?? 0) - (a.wins ?? 0)
            : (b.matches_played ?? 0) - (a.matches_played ?? 0)
        );
      const total = sorted.length;
      const page = sorted.slice(offset, offset + limit);
      const userIds = page.map((p) => p.user_id);
      const users = await User.findAll({
        where: { id: userIds },
        attributes: ['id', 'name', 'city', 'country', 'karma_points'],
        raw: true,
      });
      const userMap = new Map(users.map((u) => [u.id, u]));
      const leaderboard = page.map((p, i) => {
        const u = userMap.get(p.user_id);
        return {
          rank: offset + i + 1,
          user_id: p.user_id,
          name: u?.name,
          city: u?.city,
          country: u?.country,
          karma_points: u?.karma_points,
          matches_played: p.matches_played,
          wins: p.wins,
          sport: p.sport,
        };
      });
      res.json({ leaderboard, total, sort });
    } catch (error: any) {
      console.error('Leaderboards error:', error);
      res.status(500).json({ message: 'Failed to get leaderboard', error: error.message });
    }
  }
);

// ── GET /api/leaderboards/:sport - Sport-specific leaderboard ──────────────────
router.get(
  '/:sport',
  authenticate,
  [
    param('sport').trim().notEmpty(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('offset').optional().isInt({ min: 0 }).toInt(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const sport = decodeURIComponent((req.params.sport as string).replace(/\+/g, ' '));
      const limit = Number(req.query.limit) || 50;
      const offset = Number(req.query.offset) || 0;

      const stats = await UserStats.findAll({
        where: { sport: { [Op.iLike]: sport } },
        order: [
          ['wins', 'DESC'],
          ['matches_played', 'DESC'],
        ],
        limit: limit + offset,
        raw: true,
      });
      const total = stats.length;
      const page = stats.slice(offset, offset + limit);
      const userIds = page.map((s) => s.user_id);
      const users = await User.findAll({
        where: { id: userIds },
        attributes: ['id', 'name', 'city', 'country', 'karma_points'],
        raw: true,
      });
      const userMap = new Map(users.map((u) => [u.id, u]));
      const leaderboard = page.map((s, i) => {
        const u = userMap.get(s.user_id);
        return {
          rank: offset + i + 1,
          user_id: s.user_id,
          name: u?.name,
          city: u?.city,
          country: u?.country,
          karma_points: u?.karma_points,
          matches_played: s.matches_played,
          wins: s.wins,
          losses: s.losses,
          draws: s.draws,
          hours_played: Number(s.hours_played),
          sport: s.sport,
        };
      });
      res.json({ leaderboard, total, sport });
    } catch (error: any) {
      console.error('Sport leaderboard error:', error);
      res.status(500).json({ message: 'Failed to get leaderboard', error: error.message });
    }
  }
);

export default router;

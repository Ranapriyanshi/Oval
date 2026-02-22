import express, { Response } from 'express';
import { param, body, validationResult } from 'express-validator';
import { Op } from 'sequelize';
import {
  User,
  UserStats,
  PlayerRating,
  Gametime,
  GametimeParticipant,
} from '../models';
import { authenticate, AuthRequest } from '../middleware/auth';
import { awardXP } from '../services/xpService';

const router = express.Router();
const KARMA_PER_RATING = 2;

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const stats = await UserStats.findAll({
      where: { user_id: userId },
      order: [['matches_played', 'DESC']],
      raw: true,
    });
    const user = await User.findByPk(userId, { attributes: ['karma_points'] });
    const totalMatches = stats.reduce((sum, s) => sum + (s.matches_played || 0), 0);
    const totalWins = stats.reduce((sum, s) => sum + (s.wins || 0), 0);
    const totalHours = stats.reduce((sum, s) => sum + Number(s.hours_played || 0), 0);
    res.json({
      karma_points: user?.karma_points ?? 0,
      overall: {
        matches_played: totalMatches,
        wins: totalWins,
        hours_played: Math.round(totalHours * 100) / 100,
      },
      by_sport: stats,
    });
  } catch (error: any) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Failed to get stats', error: error.message });
  }
});

router.get(
  '/sport/:sport',
  authenticate,
  [param('sport').trim().notEmpty()],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const userId = req.user!.id;
      const sport = decodeURIComponent((req.params.sport as string).replace(/\+/g, ' '));
      let stat = await UserStats.findOne({
        where: { user_id: userId, sport: { [Op.iLike]: sport } },
      });
      if (!stat) {
        stat = await UserStats.create({
          user_id: userId,
          sport,
          matches_played: 0,
          wins: 0,
          losses: 0,
          draws: 0,
          hours_played: 0,
        });
      }
      const user = await User.findByPk(userId, { attributes: ['karma_points'] });
      res.json({
        karma_points: user?.karma_points ?? 0,
        sport: stat.sport,
        matches_played: stat.matches_played,
        wins: stat.wins,
        losses: stat.losses,
        draws: stat.draws,
        hours_played: Number(stat.hours_played),
      });
    } catch (error: any) {
      console.error('Get sport stats error:', error);
      res.status(500).json({ message: 'Failed to get sport stats', error: error.message });
    }
  }
);

router.get('/karma', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByPk(req.user!.id, { attributes: ['karma_points'] });
    res.json({ karma_points: user?.karma_points ?? 0 });
  } catch (error: any) {
    console.error('Get karma error:', error);
    res.status(500).json({ message: 'Failed to get karma', error: error.message });
  }
});

router.post(
  '/games/:gameId/rate',
  authenticate,
  [
    param('gameId').isUUID(),
    body('rated_user_id').isUUID(),
    body('rating').isInt({ min: 1, max: 5 }),
    body('sportsmanship').isInt({ min: 1, max: 5 }),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const { gameId } = req.params;
      const { rated_user_id, rating, sportsmanship } = req.body;
      const raterId = req.user!.id;
      if (rated_user_id === raterId) {
        return res.status(400).json({ message: 'Cannot rate yourself' });
      }
      const gametime = await Gametime.findByPk(gameId);
      if (!gametime) return res.status(404).json({ message: 'Game not found' });
      if (gametime.status !== 'completed') {
        return res.status(400).json({ message: 'Can only rate players after a completed game' });
      }
      const participant = await GametimeParticipant.findOne({
        where: { gametime_id: gameId, user_id: rated_user_id, status: 'joined' },
      });
      if (!participant) {
        return res.status(400).json({ message: 'Rated user was not a participant in this game' });
      }
      const [existing, created] = await PlayerRating.findOrCreate({
        where: { gametime_id: gameId, rater_id: raterId, rated_user_id },
        defaults: {
          gametime_id: gameId,
          rater_id: raterId,
          rated_user_id,
          rating,
          sportsmanship,
        },
      });
      if (!created) await existing.update({ rating, sportsmanship });
      await User.increment({ karma_points: KARMA_PER_RATING }, { where: { id: rated_user_id } });

      let xpResult = null;
      try {
        xpResult = await awardXP(raterId, 'player_rated', gameId);
      } catch (xpErr) {
        console.error('XP award error (non-blocking):', xpErr);
      }

      res.json({ message: 'Rating saved', karma_awarded: KARMA_PER_RATING, xp: xpResult });
    } catch (error: any) {
      console.error('Rate player error:', error);
      res.status(500).json({ message: 'Failed to save rating', error: error.message });
    }
  }
);

export default router;

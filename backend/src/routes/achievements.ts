import express, { Response } from 'express';
import { Op } from 'sequelize';
import { Achievement, UserAchievement, User, UserStats } from '../models';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const list = await Achievement.findAll({ order: [['key', 'ASC']], raw: true });
    res.json({ achievements: list });
  } catch (error: any) {
    console.error('List achievements error:', error);
    res.status(500).json({ message: 'Failed to list achievements', error: error.message });
  }
});

router.get('/my', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userAchievements = await UserAchievement.findAll({
      where: { user_id: req.user!.id },
      include: [{ model: Achievement, as: 'Achievement' }],
      order: [['unlocked_at', 'DESC']],
    });
    const list = userAchievements.map((ua) => {
      const a = (ua as any).Achievement;
      return {
        ...a?.toJSON(),
        progress: ua.progress,
        unlocked_at: ua.unlocked_at,
        unlocked: !!ua.unlocked_at,
      };
    });
    res.json({ achievements: list });
  } catch (error: any) {
    console.error('My achievements error:', error);
    res.status(500).json({ message: 'Failed to get achievements', error: error.message });
  }
});

router.post('/check', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const achievements = await Achievement.findAll({ raw: true });
    const userStats = await UserStats.findAll({ where: { user_id: userId }, raw: true });
    const totalMatches = userStats.reduce((s, r) => s + (r.matches_played || 0), 0);
    const user = await User.findByPk(userId, { attributes: ['karma_points'], raw: true });
    const karma = user?.karma_points ?? 0;

    const awarded: string[] = [];
    for (const a of achievements) {
      let progress = 0;
      if (a.criteria_type === 'matches_played' && a.criteria_value != null) {
        progress = Math.min(totalMatches, a.criteria_value);
      } else if (a.criteria_type === 'karma' && a.criteria_value != null) {
        progress = Math.min(karma, a.criteria_value);
      }
      const [ua] = await UserAchievement.findOrCreate({
        where: { user_id: userId, achievement_id: a.id },
        defaults: { user_id: userId, achievement_id: a.id, progress },
      });
      const target = a.criteria_value ?? 0;
      const unlocked = progress >= target && target > 0;
      if (unlocked && !ua.unlocked_at) {
        await ua.update({ progress: target, unlocked_at: new Date() });
        awarded.push(a.key);
      } else if (ua.progress !== progress) {
        await ua.update({ progress });
      }
    }
    res.json({ message: 'Checked', awarded });
  } catch (error: any) {
    console.error('Check achievements error:', error);
    res.status(500).json({ message: 'Failed to check achievements', error: error.message });
  }
});

export default router;

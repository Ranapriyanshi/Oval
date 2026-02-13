import express, { Request, Response } from 'express';
import { param, body, query, validationResult } from 'express-validator';
import { Op } from 'sequelize';
import {
  User,
  UserSportsSkill,
  UserAvailability,
  UserProfilePhoto,
  UserSwipe,
  UserMatch,
} from '../models';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Get potential matches (discover)
router.get(
  '/discover',
  authenticate,
  [
    query('sport').optional().trim(),
    query('max_distance').optional().isFloat({ min: 0 }).toFloat(),
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const currentUser = await User.findByPk(req.user!.id, {
        include: [
          { model: UserSportsSkill, as: 'UserSportsSkills' },
          { model: UserAvailability, as: 'UserAvailabilities' },
        ],
      });

      if (!currentUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Get users already swiped on
      const swipedUserIds = await UserSwipe.findAll({
        where: { swiper_id: req.user!.id },
        attributes: ['swiped_id'],
        raw: true,
      }).then((swipes) => swipes.map((s: any) => s.swiped_id));

      // Get users already matched with
      const matchedUserIds = await UserMatch.findAll({
        where: {
          [Op.or]: [{ user1_id: req.user!.id }, { user2_id: req.user!.id }],
          is_active: true,
        },
        attributes: ['user1_id', 'user2_id'],
        raw: true,
      }).then((matches: any[]) =>
        matches.map((m) => (m.user1_id === req.user!.id ? m.user2_id : m.user1_id))
      );

      const excludeIds = [
        req.user!.id,
        ...swipedUserIds,
        ...matchedUserIds,
      ];

      // Build where clause
      const where: any = {
        id: { [Op.notIn]: excludeIds },
      };

      // Filter by sport if provided
      let sportFilter: any = {};
      if (req.query.sport) {
        sportFilter = {
          model: UserSportsSkill,
          as: 'UserSportsSkills',
          where: { sport_name: { [Op.iLike]: req.query.sport as string } },
          required: true,
        };
      }

      // Get potential matches
      const limit = Number(req.query.limit) || 20;
      const potentialMatches = await User.findAll({
        where,
        include: [
          {
            model: UserSportsSkill,
            as: 'UserSportsSkills',
            required: false,
            ...(req.query.sport ? { where: { sport_name: { [Op.iLike]: req.query.sport as string } } } : {}),
          },
          {
            model: UserAvailability,
            as: 'UserAvailabilities',
            required: false,
          },
          {
            model: UserProfilePhoto,
            as: 'UserProfilePhotos',
            required: false,
            order: [['sort_order', 'ASC'], ['is_primary', 'DESC']],
            limit: 1,
          },
        ],
        limit,
      });

      // Calculate match scores and filter by distance if coordinates available
      const currentLat = currentUser.latitude ? parseFloat(currentUser.latitude) : null;
      const currentLon = currentUser.longitude ? parseFloat(currentUser.longitude) : null;
      const maxDistance = req.query.max_distance ? Number(req.query.max_distance) : null;

      const scoredMatches = potentialMatches
        .map((user) => {
          let score = 0;
          const reasons: string[] = [];

          // Location-based scoring
          if (currentLat && currentLon && user.latitude && user.longitude) {
            const userLat = parseFloat(user.latitude);
            const userLon = parseFloat(user.longitude);
            const distance = calculateDistance(currentLat, currentLon, userLat, userLon);

            if (maxDistance && distance > maxDistance) {
              return null; // Filter out if beyond max distance
            }

            // Score based on proximity (closer = higher score)
            if (distance < 5) score += 30;
            else if (distance < 10) score += 20;
            else if (distance < 25) score += 10;
            reasons.push(`Distance: ${distance.toFixed(1)}km`);
          }

          // Sport preference matching
          const currentUserSports = (currentUser as any).UserSportsSkills?.map(
            (s: any) => s.sport_name
          ) || [];
          const userSports = (user as any).UserSportsSkills?.map((s: any) => s.sport_name) || [];

          const commonSports = currentUserSports.filter((s: string) =>
            userSports.includes(s)
          );
          if (commonSports.length > 0) {
            score += commonSports.length * 15;
            reasons.push(`Common sports: ${commonSports.join(', ')}`);
          }

          // Skill level compatibility (prefer similar skill levels)
          if ((currentUser as any).UserSportsSkills && (user as any).UserSportsSkills) {
            const skillMatches = (currentUser as any).UserSportsSkills.filter(
              (cs: any) =>
                (user as any).UserSportsSkills.some(
                  (us: any) =>
                    us.sport_name === cs.sport_name &&
                    Math.abs(
                      ['beginner', 'intermediate', 'advanced', 'professional'].indexOf(
                        cs.skill_level
                      ) -
                        ['beginner', 'intermediate', 'advanced', 'professional'].indexOf(
                          us.skill_level
                        )
                    ) <= 1
                )
            );
            if (skillMatches.length > 0) {
              score += skillMatches.length * 10;
              reasons.push(`Compatible skill levels`);
            }
          }

          // Availability overlap
          if (
            (currentUser as any).UserAvailabilities?.length &&
            (user as any).UserAvailabilities?.length
          ) {
            const hasOverlap = (currentUser as any).UserAvailabilities.some(
              (ca: any) =>
                (user as any).UserAvailabilities.some(
                  (ua: any) =>
                    ua.day_of_week === ca.day_of_week &&
                    ((ca.start_time <= ua.end_time && ca.end_time >= ua.start_time) ||
                      (ua.start_time <= ca.end_time && ua.end_time >= ca.start_time))
                )
            );
            if (hasOverlap) {
              score += 15;
              reasons.push(`Availability overlap`);
            }
          }

          return {
            user: user.toJSON(),
            score,
            reasons,
          };
        })
        .filter((item): item is { user: any; score: number; reasons: string[] } => item !== null)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      res.json({
        matches: scoredMatches.map((m) => ({
          ...m.user,
          match_score: m.score,
          match_reasons: m.reasons,
        })),
      });
    } catch (error: any) {
      console.error('Discover playpals error:', error);
      res.status(500).json({ message: 'Failed to discover playpals', error: error.message });
    }
  }
);

// Swipe on a user (left = pass, right = like)
router.post(
  '/:id/swipe',
  authenticate,
  [
    param('id').isUUID(),
    body('direction').isIn(['left', 'right']),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const swipedUserId = req.params.id;
      if (swipedUserId === req.user!.id) {
        return res.status(400).json({ message: 'Cannot swipe on yourself' });
      }

      const swipedUser = await User.findByPk(swipedUserId);
      if (!swipedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if already swiped
      const existingSwipe = await UserSwipe.findOne({
        where: {
          swiper_id: req.user!.id,
          swiped_id: swipedUserId,
        },
      });

      if (existingSwipe) {
        return res.status(400).json({ message: 'Already swiped on this user' });
      }

      // Create swipe
      const swipe = await UserSwipe.create({
        swiper_id: req.user!.id,
        swiped_id: swipedUserId,
        direction: req.body.direction,
      });

      // Check for mutual match (if swiped right and they also swiped right on you)
      if (req.body.direction === 'right') {
        const mutualSwipe = await UserSwipe.findOne({
          where: {
            swiper_id: swipedUserId,
            swiped_id: req.user!.id,
            direction: 'right',
          },
        });

        if (mutualSwipe) {
          // Create match (ensure user1_id < user2_id for consistency)
          const [user1Id, user2Id] =
            req.user!.id < swipedUserId
              ? [req.user!.id, swipedUserId]
              : [swipedUserId, req.user!.id];

          const [match, created] = await UserMatch.findOrCreate({
            where: {
              user1_id: user1Id,
              user2_id: user2Id,
            },
            defaults: {
              user1_id: user1Id,
              user2_id: user2Id,
              is_active: true,
            },
          });

          return res.json({
            swipe: swipe.toJSON(),
            match: created ? match.toJSON() : null,
            is_match: true,
          });
        }
      }

      res.json({
        swipe: swipe.toJSON(),
        match: null,
        is_match: false,
      });
    } catch (error: any) {
      console.error('Swipe error:', error);
      res.status(500).json({ message: 'Failed to swipe', error: error.message });
    }
  }
);

// Get matched users
router.get('/matches', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const matches = await UserMatch.findAll({
      where: {
        [Op.or]: [{ user1_id: req.user!.id }, { user2_id: req.user!.id }],
        is_active: true,
      },
      include: [
        {
          model: User,
          as: 'User1',
          attributes: ['id', 'name', 'email', 'city', 'bio', 'country'],
          include: [
            {
              model: UserProfilePhoto,
              as: 'UserProfilePhotos',
              limit: 1,
              order: [['is_primary', 'DESC'], ['sort_order', 'ASC']],
            },
            {
              model: UserSportsSkill,
              as: 'UserSportsSkills',
            },
          ],
        },
        {
          model: User,
          as: 'User2',
          attributes: ['id', 'name', 'email', 'city', 'bio', 'country'],
          include: [
            {
              model: UserProfilePhoto,
              as: 'UserProfilePhotos',
              limit: 1,
              order: [['is_primary', 'DESC'], ['sort_order', 'ASC']],
            },
            {
              model: UserSportsSkill,
              as: 'UserSportsSkills',
            },
          ],
        },
      ],
      order: [['matched_at', 'DESC']],
    });

    const matchedUsers = matches.map((match) => {
      const otherUser =
        match.user1_id === req.user!.id ? match.User2 : match.User1;
      return {
        match_id: match.id,
        matched_at: match.matched_at,
        user: otherUser?.toJSON(),
      };
    });

    res.json({ matches: matchedUsers });
  } catch (error: any) {
    console.error('Get matches error:', error);
    res.status(500).json({ message: 'Failed to get matches', error: error.message });
  }
});

// Unmatch a user
router.post(
  '/:id/unmatch',
  authenticate,
  [param('id').isUUID()],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const otherUserId = req.params.id;
      const match = await UserMatch.findOne({
        where: {
          [Op.or]: [
            { user1_id: req.user!.id, user2_id: otherUserId },
            { user1_id: otherUserId, user2_id: req.user!.id },
          ],
          is_active: true,
        },
      });

      if (!match) {
        return res.status(404).json({ message: 'Match not found' });
      }

      await match.update({ is_active: false });
      res.json({ message: 'Unmatched successfully', match: match.toJSON() });
    } catch (error: any) {
      console.error('Unmatch error:', error);
      res.status(500).json({ message: 'Failed to unmatch', error: error.message });
    }
  }
);

// Get playpal profile
router.get(
  '/:id/profile',
  authenticate,
  [param('id').isUUID()],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const user = await User.findByPk(req.params.id, {
        attributes: { exclude: ['password_hash'] },
        include: [
          {
            model: UserSportsSkill,
            as: 'UserSportsSkills',
          },
          {
            model: UserAvailability,
            as: 'UserAvailabilities',
          },
          {
            model: UserProfilePhoto,
            as: 'UserProfilePhotos',
            order: [['sort_order', 'ASC'], ['is_primary', 'DESC']],
          },
        ],
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if matched
      const match = await UserMatch.findOne({
        where: {
          [Op.or]: [
            { user1_id: req.user!.id, user2_id: req.params.id },
            { user1_id: req.params.id, user2_id: req.user!.id },
          ],
          is_active: true,
        },
      });

      res.json({
        ...user.toJSON(),
        is_matched: !!match,
      });
    } catch (error: any) {
      console.error('Get playpal profile error:', error);
      res.status(500).json({ message: 'Failed to get profile', error: error.message });
    }
  }
);

export default router;

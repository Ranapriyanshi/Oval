import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get user profile
router.get('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByPk(req.user!.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = user.toJSON();
    const { password_hash, ...userWithoutPassword } = userData;
    res.json(userWithoutPassword);
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to get profile', error: error.message });
  }
});

// Update user profile
router.put(
  '/profile',
  authenticate,
  [
    body('name').optional().trim().notEmpty(),
    body('country').optional().isLength({ min: 2, max: 2 }),
    body('timezone').optional().trim().notEmpty(),
    body('currency').optional().isLength({ min: 3, max: 3 }),
    body('sports_preferences').optional().isArray(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const user = await User.findByPk(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Handle password update separately if provided
      const updates: any = { ...req.body };
      
      // Remove password_hash from updates (password will be hashed by hook)
      delete updates.password_hash;
      
      // If password is provided, it will be hashed by the beforeUpdate hook
      // If no password, remove it from updates
      if (!updates.password) {
        delete updates.password;
      }

      await user.update(updates);
      await user.reload();

      const userData = user.toJSON();
      const { password_hash, ...userWithoutPassword } = userData;
      res.json(userWithoutPassword);
    } catch (error: any) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Failed to update profile', error: error.message });
    }
  }
);

export default router;

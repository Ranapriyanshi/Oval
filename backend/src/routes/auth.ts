import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import User from '../models/User';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Helper function to convert user data from snake_case to camelCase for frontend
const formatUserResponse = (userData: any) => {
  const { password_hash, avatar_choice, ...rest } = userData;
  return {
    ...rest,
    ...(avatar_choice !== undefined && { avatarChoice: avatar_choice }),
  };
};

// Register
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().notEmpty(),
    body('country').isLength({ min: 2, max: 2 }),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, name, country, timezone, currency } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Determine currency based on country
      const userCurrency = currency || (country === 'AU' ? 'AUD' : 'USD');
      const userTimezone = timezone || (country === 'AU' ? 'Australia/Sydney' : 'America/New_York');

      // Hash password explicitly for registration to satisfy NOT NULL constraint
      const passwordHash = await User.hashPassword(password);

      // Create user with hashed password
      const user = await User.create(
        {
          email,
          password_hash: passwordHash,
          name,
          country,
          timezone: userTimezone,
          currency: userCurrency,
        } as any
      );

      // Generate token
      const token = jwt.sign({ userId: user.id }, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
      } as jwt.SignOptions);

      // Return user data (without password)
      const userData = user.toJSON();
      res.status(201).json({
        token,
        user: formatUserResponse(userData),
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Registration failed', error: error.message });
    }
  }
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Verify password
      const isValidPassword = await user.verifyPassword(password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate token
      const token = jwt.sign({ userId: user.id }, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
      } as jwt.SignOptions);

      // Return user data (without password)
      const userData = user.toJSON();
      res.json({
        token,
        user: formatUserResponse(userData),
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed', error: error.message });
    }
  }
);

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByPk(req.user!.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = user.toJSON();
    res.json(formatUserResponse(userData));
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to get user', error: error.message });
  }
});

export default router;

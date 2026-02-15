import express, { Response } from 'express';
import { query, validationResult } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY;

router.get(
  '/',
  authenticate,
  [query('city').optional().trim(), query('lat').optional().isFloat(), query('lon').optional().isFloat()],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const city = (req.query.city as string) || 'Sydney';
      const lat = req.query.lat as string | undefined;
      const lon = req.query.lon as string | undefined;

      if (OPENWEATHERMAP_API_KEY && (lat != null && lon != null || city)) {
        const params = new URLSearchParams({
          appid: OPENWEATHERMAP_API_KEY,
          units: 'metric',
          ...(lat != null && lon != null ? { lat, lon } : { q: city }),
        });
        const resp = await fetch(`https://api.openweathermap.org/data/2.5/weather?${params}`);
        if (!resp.ok) throw new Error('Weather API error');
        const data = await resp.json();
        return res.json({
          temp: Math.round(data.main?.temp ?? 20),
          condition: data.weather?.[0]?.main ?? 'Clear',
          description: data.weather?.[0]?.description ?? '',
          city: data.name ?? city,
          recommendation: getRecommendation(data.weather?.[0]?.main, data.main?.temp),
        });
      }

      // Mock response when no API key
      const mockConditions = ['Clear', 'Clouds', 'Rain', 'Sunny'];
      const condition = mockConditions[Math.floor(Math.random() * mockConditions.length)];
      res.json({
        temp: 18 + Math.floor(Math.random() * 12),
        condition,
        description: condition.toLowerCase(),
        city: city || 'Sydney',
        recommendation: getRecommendation(condition, 22),
      });
    } catch (error: any) {
      console.error('Weather error:', error);
      res.status(500).json({ message: 'Failed to get weather', error: error.message });
    }
  }
);

function getRecommendation(condition: string | undefined, temp: number | undefined): string {
  const t = temp ?? 20;
  if (condition === 'Rain') return 'Great day for indoor sports or swimming.';
  if (condition === 'Clear' && t > 25) return 'Perfect for outdoor games. Stay hydrated!';
  if (t < 10) return 'Layer up for outdoor activities.';
  return 'Good conditions for most sports.';
}

export default router;

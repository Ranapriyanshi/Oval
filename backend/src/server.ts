import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import config from './config/config';
import sequelize from './config/sequelize';
import './models'; // Load models and register associations before routes
import apiLogger from './middleware/apiLogger';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import venueRoutes from './routes/venues';
import bookingRoutes from './routes/bookings';
import playpalRoutes from './routes/playpals';
import gametimeRoutes from './routes/gametime';
import chatRoutes from './routes/chat';
import coachingRoutes from './routes/coaching';
import statsRoutes from './routes/stats';
import leaderboardsRoutes from './routes/leaderboards';
import eventsRoutes from './routes/events';
import achievementsRoutes from './routes/achievements';
import weatherRoutes from './routes/weather';
import adminRoutes from './routes/admin';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { setupChatSocket } from './socket/chatHandler';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: Array.isArray(config.cors.origin) ? config.cors.origin : [config.cors.origin],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(helmet());
app.use(cors({ 
  origin: config.cors.origin,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(apiLogger); // Add API logging middleware

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/playpals', playpalRoutes);
app.use('/api/gametime', gametimeRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/coaching', coachingRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/leaderboards', leaderboardsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/achievements', achievementsRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.io chat handler (auth, messaging, typing, online status)
setupChatSocket(io);

// Test database connection and start server
const PORT = config.port;

const startServer = async () => {
  try {
    // Test Sequelize connection
    await sequelize.authenticate();
    console.log('✓ Database connection established successfully');

    // Sync models (optional - migrations handle schema)
    // await sequelize.sync({ alter: false });

    // Start HTTP server
    httpServer.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${config.env}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();

export { io };

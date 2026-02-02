import dotenv from 'dotenv';

dotenv.config();

const env = process.env.NODE_ENV || 'development';

const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  env,
  jwt: {
    secret: (process.env.JWT_SECRET || 'your-secret-key') as string,
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as string,
  },
  cors: {
    origin: process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
      : (env === 'development' 
          ? ['http://localhost:19006', 'http://localhost:8081', 'http://localhost:19000']
          : [process.env.CORS_ORIGIN || 'http://localhost:19006']),
  },
};

export default config;

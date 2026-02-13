import { Request, Response, NextFunction } from 'express';

interface ApiLog {
  timestamp: string;
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  userAgent?: string;
  ip: string;
  userId?: string;
  body?: any;
  query?: any;
}

const apiLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const originalSend = res.send;
  
  let responseBody: any;
  
  res.send = function(data: any) {
    responseBody = data;
    return originalSend.call(this, data);
  };

  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    
    const log: ApiLog = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      userId: (req as any).user?.id,
      query: req.query,
      body: process.env.NODE_ENV === 'development' ? req.body : undefined
    };

    // Color-coded console output
    const statusColor = res.statusCode >= 400 ? '\x1b[31m' : // red
                       res.statusCode >= 300 ? '\x1b[33m' : // yellow
                       res.statusCode >= 200 ? '\x1b[32m' : // green
                       '\x1b[0m'; // reset

    console.log(
      `${statusColor}${req.method} ${req.originalUrl} ${res.statusCode} ${responseTime}ms\x1b[0m ` +
      `IP: ${log.ip} ${log.userId ? `User: ${log.userId}` : ''}`
    );

    // Log slow requests (>500ms)
    if (responseTime > 500) {
      console.warn(`\x1b[33m⚠️  Slow API Request: ${req.method} ${req.originalUrl} took ${responseTime}ms\x1b[0m`);
    }

    // Log errors
    if (res.statusCode >= 400) {
      console.error(`\x1b[31m❌ API Error: ${req.method} ${req.originalUrl} - ${res.statusCode}\x1b[0m`);
      if (process.env.NODE_ENV === 'development' && responseBody) {
        console.error('Error response:', responseBody);
      }
    }
  });

  next();
};

export default apiLogger;
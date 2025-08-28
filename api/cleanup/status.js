import cors from 'cors';

const allowedOrigins = [
  'https://hospitalityapp.chaletmoments.com',
  'https://hospitalityapp-frontend.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173'
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

const corsMiddleware = cors(corsOptions);

const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export default async function handler(req, res) {
  await runMiddleware(req, res, corsMiddleware);
  
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }
  
  // Return a mock cleanup status for serverless environment
  // In serverless, we don't have persistent background processes
  return res.status(200).json({
    success: true,
    data: {
      isRunning: false,
      lastRun: new Date().toISOString(),
      nextRun: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      interval: 3600000,
      stats: {
        lastCleanupCount: 0,
        totalCleanupsPerformed: 0
      }
    }
  });
}
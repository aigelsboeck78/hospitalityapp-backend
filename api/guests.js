import pg from 'pg';
import cors from 'cors';

const { Pool } = pg;

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
  
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  
  try {
    const result = await pool.query('SELECT * FROM guests ORDER BY created_at DESC');
    await pool.end();
    
    return res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Guests fetch error:', error);
    await pool.end();
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch guests'
    });
  }
}
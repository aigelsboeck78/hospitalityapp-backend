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
  
  let pool;
  
  try {
    // Debug: Check which env vars are available
    const envInfo = {
      hasPostgresUrlNonPooling: !!process.env.POSTGRES_URL_NON_POOLING,
      hasPostgresUrl: !!process.env.POSTGRES_URL,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      nodeEnv: process.env.NODE_ENV
    };
    
    console.log('Environment info:', envInfo);
    
    // Use POSTGRES_URL for Vercel (pooling connection)
    const connectionString = process.env.POSTGRES_URL || 
                           process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('No database connection string found');
    }
    
    // For Vercel Postgres, we should use the pooling connection
    pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 5000,
      query_timeout: 5000,
      statement_timeout: 5000
    });
    
    console.log('Attempting database query...');
    const result = await pool.query('SELECT * FROM properties ORDER BY created_at DESC LIMIT 10');
    console.log('Query successful, rows:', result.rows.length);
    
    await pool.end();
    
    return res.status(200).json({
      success: true,
      data: result.rows,
      debug: envInfo
    });
  } catch (error) {
    console.error('Properties fetch detailed error:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack
    });
    
    if (pool) {
      try {
        await pool.end();
      } catch (endError) {
        console.error('Error ending pool:', endError);
      }
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch properties',
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        code: error.code,
        detail: error.detail
      } : undefined
    });
  }
}
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Vercel Postgres provides these environment variables
// POSTGRES_URL - Connection string with pooling
// POSTGRES_URL_NON_POOLING - Direct connection string
// POSTGRES_PRISMA_URL - For Prisma ORM
// POSTGRES_HOST, POSTGRES_DATABASE, POSTGRES_USER, POSTGRES_PASSWORD

function getConnectionConfig() {
  // Priority 1: Use Vercel's POSTGRES_URL if available
  if (process.env.POSTGRES_URL) {
    console.log('Using Vercel Postgres connection');
    return {
      connectionString: process.env.POSTGRES_URL,
      ssl: {
        rejectUnauthorized: false
      },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };
  }
  
  // Priority 2: Use standard DATABASE_URL
  if (process.env.DATABASE_URL) {
    console.log('Using DATABASE_URL connection');
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
      } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };
  }
  
  // Priority 3: Use individual Vercel Postgres variables
  if (process.env.POSTGRES_HOST) {
    console.log('Using Vercel Postgres individual variables');
    return {
      host: process.env.POSTGRES_HOST,
      port: 5432,
      database: process.env.POSTGRES_DATABASE,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      ssl: {
        rejectUnauthorized: false
      },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };
  }
  
  // Priority 4: Fallback to standard DB variables
  console.log('Using standard database configuration');
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'vacation_rental_hospitality',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
}

const config = getConnectionConfig();
const pool = new Pool(config);

// Connection event handlers
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  // Don't exit in production, just log the error
  if (process.env.NODE_ENV !== 'production') {
    process.exit(-1);
  }
});

// Test the connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection test failed:', err);
  } else {
    console.log('✅ Database connection test successful:', res.rows[0].now);
  }
});

export default pool;
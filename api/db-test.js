export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const envInfo = {
    hasPostgresUrl: !!process.env.POSTGRES_URL,
    hasPostgresUrlNonPooling: !!process.env.POSTGRES_URL_NON_POOLING,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasPostgresDatabase: !!process.env.POSTGRES_DATABASE,
    hasPostgresHost: !!process.env.POSTGRES_HOST,
    nodeEnv: process.env.NODE_ENV,
    // Get first few chars of connection strings to verify format
    postgresUrlFormat: process.env.POSTGRES_URL ? process.env.POSTGRES_URL.substring(0, 20) + '...' : null,
    databaseUrlFormat: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + '...' : null
  };
  
  // Try a simple connection test
  let testResult = 'Not tested';
  let error = null;
  
  // Try DATABASE_URL first (Supabase), then POSTGRES_URL (Vercel Postgres)
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  
  if (connectionString) {
    try {
      const { Pool } = await import('pg');
      const pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000
      });
      
      const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');
      testResult = {
        connected: true,
        currentTime: result.rows[0].current_time,
        version: result.rows[0].pg_version
      };
      await pool.end();
    } catch (err) {
      error = {
        message: err.message,
        code: err.code,
        detail: err.detail
      };
      testResult = 'Failed';
    }
  }
  
  return res.status(200).json({
    envInfo,
    testResult,
    error
  });
}
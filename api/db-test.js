export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const envInfo = {
    hasPostgresUrl: !!process.env.POSTGRES_URL,
    hasPostgresPrismaUrl: !!process.env.POSTGRES_PRISMA_URL,
    hasPostgresUrlNonPooling: !!process.env.POSTGRES_URL_NON_POOLING,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasPostgresDatabase: !!process.env.POSTGRES_DATABASE,
    hasPostgresHost: !!process.env.POSTGRES_HOST,
    nodeEnv: process.env.NODE_ENV,
    // Get first few chars of connection strings to verify format
    postgresUrlFormat: process.env.POSTGRES_URL ? process.env.POSTGRES_URL.substring(0, 50) + '...' : null,
    postgresPrismaUrlFormat: process.env.POSTGRES_PRISMA_URL ? process.env.POSTGRES_PRISMA_URL.substring(0, 50) + '...' : null,
    databaseUrlFormat: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + '...' : null
  };
  
  // Try a simple connection test
  let testResult = 'Not tested';
  let error = null;
  
  // Try different connection strings in order of preference
  // POSTGRES_PRISMA_URL has pgbouncer=true which might work better
  const connectionString = process.env.POSTGRES_PRISMA_URL || 
                           process.env.POSTGRES_URL || 
                           process.env.POSTGRES_URL_NON_POOLING ||
                           process.env.DATABASE_URL;
  
  if (connectionString && !connectionString.includes('[your-')) {
    try {
      const { Pool } = await import('pg');
      
      // Check if SSL is required in connection string
      const needsSSL = connectionString.includes('sslmode=require');
      const sslConfig = needsSSL || process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false;
        
      const pool = new Pool({
        connectionString,
        ssl: sslConfig,
        connectionTimeoutMillis: 10000
      });
      
      const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');
      
      // Also check if we can query the properties table
      let tableCheck = null;
      try {
        const tableResult = await pool.query('SELECT COUNT(*) as count FROM properties');
        tableCheck = { propertiesCount: tableResult.rows[0].count };
      } catch (tableErr) {
        tableCheck = { error: tableErr.message };
      }
      
      testResult = {
        connected: true,
        currentTime: result.rows[0].current_time,
        version: result.rows[0].pg_version,
        tableCheck
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
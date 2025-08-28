import pg from 'pg';

const { Pool } = pg;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  let pool;
  
  try {
    // Use same connection as main
    const connectionString = process.env.POSTGRES_PRISMA_URL || 
                           process.env.POSTGRES_URL || 
                           process.env.DATABASE_URL;
    
    const sslConfig = {
      rejectUnauthorized: false,
      require: true
    };
    
    pool = new Pool({
      connectionString,
      ssl: sslConfig,
      connectionTimeoutMillis: 10000,
      max: 1
    });
    
    // Test basic connection
    const testResult = await pool.query('SELECT NOW()');
    
    // Try to query events table
    let eventsResult;
    let eventsError = null;
    
    try {
      eventsResult = await pool.query('SELECT COUNT(*) as count FROM events');
    } catch (err) {
      eventsError = {
        message: err.message,
        code: err.code,
        detail: err.detail,
        table: err.table
      };
    }
    
    // Try to describe events table
    let tableInfo = null;
    try {
      tableInfo = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'events'
        ORDER BY ordinal_position
      `);
    } catch (err) {
      // Ignore
    }
    
    // Also check dining table
    let diningInfo = null;
    let diningResult = null;
    let diningError = null;
    try {
      diningInfo = await pool.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'dining'
        ORDER BY ordinal_position
      `);
      
      diningResult = await pool.query('SELECT COUNT(*) as count FROM dining');
    } catch (err) {
      diningError = {
        message: err.message,
        code: err.code
      };
    }
    
    await pool.end();
    
    return res.status(200).json({
      connectionTest: 'Success',
      currentTime: testResult.rows[0].now,
      eventsTable: eventsResult ? {
        count: eventsResult.rows[0].count
      } : null,
      eventsError,
      tableColumns: tableInfo ? tableInfo.rows : null,
      diningTable: diningResult ? {
        count: diningResult.rows[0].count
      } : null,
      diningColumns: diningInfo ? diningInfo.rows : null,
      diningError
    });
    
  } catch (error) {
    if (pool) {
      try {
        await pool.end();
      } catch (e) {
        // Ignore
      }
    }
    
    return res.status(500).json({
      error: {
        message: error.message,
        code: error.code,
        detail: error.detail
      }
    });
  }
}
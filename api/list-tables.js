import pg from 'pg';

const { Pool } = pg;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  let pool;
  
  try {
    const connectionString = process.env.POSTGRES_PRISMA_URL || 
                           process.env.POSTGRES_URL || 
                           process.env.DATABASE_URL;
    
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false, require: true },
      connectionTimeoutMillis: 10000,
      max: 1
    });
    
    // List all tables
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    await pool.end();
    
    return res.status(200).json({
      tables: result.rows.map(r => r.table_name)
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
        code: error.code
      }
    });
  }
}
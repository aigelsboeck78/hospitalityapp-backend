import cors from 'cors';
import jwt from 'jsonwebtoken';
import pg from 'pg';

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
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'Content-Type']
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

// Helper function to create database pool
const createPool = () => {
  // Try POSTGRES_PRISMA_URL first (has pgbouncer=true), then POSTGRES_URL
  // Both should be Supabase pooler connections
  const connectionString = process.env.POSTGRES_PRISMA_URL || 
                           process.env.POSTGRES_URL || 
                           process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('Database configuration error');
  }
  
  // For Supabase, handle SSL properly
  let sslConfig = false;
  
  if (connectionString.includes('sslmode=require') || process.env.NODE_ENV === 'production') {
    // Use SSL but don't reject unauthorized certificates
    sslConfig = {
      rejectUnauthorized: false,
      require: true
    };
  }
  
  return new Pool({
    connectionString,
    ssl: sslConfig,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 1000,
    max: 1 // Serverless should use single connection
  });
};

// Helper function to generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'default-secret-for-dev', {
    expiresIn: '24h'
  });
};

export default async function handler(req, res) {
  // Apply CORS
  await runMiddleware(req, res, corsMiddleware);
  
  const { url, method } = req;
  const pathname = url.split('?')[0];
  
  // Health check
  if (pathname === '/api/health' && method === 'GET') {
    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '2.0.0'
    });
  }
  
  // Auth login
  if (pathname === '/api/auth/login' && method === 'POST') {
    try {
      const { username, password } = req.body;
      
      const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
      const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
      
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        const token = generateToken({
          id: 'admin',
          username: ADMIN_USERNAME,
          role: 'admin'
        });
        
        return res.status(200).json({
          success: true,
          data: {
            token,
            user: {
              id: 'admin',
              username: ADMIN_USERNAME,
              role: 'admin'
            }
          }
        });
      } else {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  // Auth verify
  if (pathname === '/api/auth/verify' && method === 'GET') {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'No token provided'
        });
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-for-dev');
      
      return res.status(200).json({
        success: true,
        data: decoded
      });
    } catch (error) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  }
  
  // Properties list
  if (pathname === '/api/properties' && method === 'GET') {
    const pool = createPool();
    
    try {
      const result = await pool.query('SELECT * FROM properties ORDER BY created_at DESC');
      await pool.end();
      
      return res.status(200).json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Properties fetch error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch properties'
      });
    }
  }
  
  // Single property - /api/properties/:id
  const singlePropertyMatch = pathname.match(/^\/api\/properties\/([^\/]+)$/);
  if (singlePropertyMatch && method === 'GET') {
    const propertyId = singlePropertyMatch[1];
    const pool = createPool();
    
    try {
      const result = await pool.query('SELECT * FROM properties WHERE id = $1', [propertyId]);
      await pool.end();
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Property fetch error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch property'
      });
    }
  }
  
  // Guests
  if (pathname === '/api/guests' && method === 'GET') {
    const pool = createPool();
    
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
  
  // Current guest for a property - /api/properties/:id/guests/current
  const currentGuestMatch = pathname.match(/^\/api\/properties\/([^\/]+)\/guests\/current$/);
  if (currentGuestMatch && method === 'GET') {
    const propertyId = currentGuestMatch[1];
    const pool = createPool();
    
    try {
      // Get the currently checked-in guest for this property
      const result = await pool.query(
        `SELECT * FROM guests 
         WHERE property_id = $1 
           AND checked_in = true 
           AND (checked_out = false OR checked_out IS NULL)
         ORDER BY check_in_date DESC 
         LIMIT 1`,
        [propertyId]
      );
      await pool.end();
      
      return res.status(200).json({
        success: true,
        data: result.rows[0] || null
      });
    } catch (error) {
      console.error('Current guest fetch error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch current guest'
      });
    }
  }
  
  // Cleanup status
  if (pathname === '/api/cleanup/status' && method === 'GET') {
    return res.status(200).json({
      success: true,
      data: {
        isRunning: false,
        lastRun: new Date().toISOString(),
        nextRun: new Date(Date.now() + 3600000).toISOString(),
        interval: 3600000,
        stats: {
          lastCleanupCount: 0,
          totalCleanupsPerformed: 0
        }
      }
    });
  }
  
  // Activities
  if (pathname === '/api/activities' && method === 'GET') {
    const pool = createPool();
    
    try {
      const { property_id } = req.query || {};
      let query = 'SELECT * FROM activities';
      let params = [];
      
      if (property_id) {
        query += ' WHERE property_id = $1';
        params.push(property_id);
      }
      query += ' ORDER BY created_at DESC';
      
      const result = await pool.query(query, params);
      await pool.end();
      
      return res.status(200).json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Activities fetch error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch activities'
      });
    }
  }
  
  // Events
  if (pathname === '/api/events' && method === 'GET') {
    const pool = createPool();
    
    try {
      const { property_id } = req.query || {};
      let query = 'SELECT * FROM events';
      let params = [];
      
      if (property_id) {
        query += ' WHERE property_id = $1';
        params.push(property_id);
      }
      query += ' ORDER BY date DESC';
      
      const result = await pool.query(query, params);
      await pool.end();
      
      return res.status(200).json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Events fetch error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch events'
      });
    }
  }
  
  // Dining
  if (pathname === '/api/dining' && method === 'GET') {
    const pool = createPool();
    
    try {
      const { property_id } = req.query || {};
      let query = 'SELECT * FROM dining';
      let params = [];
      
      if (property_id) {
        query += ' WHERE property_id = $1';
        params.push(property_id);
      }
      query += ' ORDER BY created_at DESC';
      
      const result = await pool.query(query, params);
      await pool.end();
      
      return res.status(200).json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Dining fetch error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch dining'
      });
    }
  }
  
  // Shop products
  if (pathname === '/api/shop/products' && method === 'GET') {
    const pool = createPool();
    
    try {
      const { property_id } = req.query || {};
      let query = 'SELECT * FROM shop_products';
      let params = [];
      
      if (property_id) {
        query += ' WHERE property_id = $1';
        params.push(property_id);
      }
      query += ' ORDER BY created_at DESC';
      
      const result = await pool.query(query, params);
      await pool.end();
      
      return res.status(200).json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Shop products fetch error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch shop products'
      });
    }
  }
  
  // Streaming services
  if ((pathname === '/api/streaming-services' || pathname === '/api/streaming') && method === 'GET') {
    const pool = createPool();
    
    try {
      const result = await pool.query('SELECT * FROM streaming_services ORDER BY name');
      await pool.end();
      
      return res.status(200).json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Streaming services fetch error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch streaming services'
      });
    }
  }
  
  // Settings
  if (pathname === '/api/settings' && method === 'GET') {
    const pool = createPool();
    
    try {
      const { property_id } = req.query || {};
      
      if (!property_id) {
        return res.status(400).json({
          success: false,
          message: 'Property ID required'
        });
      }
      
      const result = await pool.query(
        'SELECT * FROM property_settings WHERE property_id = $1',
        [property_id]
      );
      await pool.end();
      
      return res.status(200).json({
        success: true,
        data: result.rows[0] || {}
      });
    } catch (error) {
      console.error('Settings fetch error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch settings'
      });
    }
  }
  
  // Property devices - /api/properties/:id/devices
  const propertyDevicesMatch = pathname.match(/^\/api\/properties\/([^\/]+)\/devices$/);
  if (propertyDevicesMatch && method === 'GET') {
    const propertyId = propertyDevicesMatch[1];
    const pool = createPool();
    
    try {
      const result = await pool.query(
        'SELECT * FROM devices WHERE property_id = $1 ORDER BY created_at DESC',
        [propertyId]
      );
      await pool.end();
      
      return res.status(200).json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Devices fetch error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch devices'
      });
    }
  }
  
  // MDM profiles - /api/mdm/properties/:id/profiles
  const mdmProfilesMatch = pathname.match(/^\/api\/mdm\/properties\/([^\/]+)\/profiles$/);
  if (mdmProfilesMatch && method === 'GET') {
    const propertyId = mdmProfilesMatch[1];
    const pool = createPool();
    
    try {
      const result = await pool.query(
        'SELECT * FROM configuration_profiles WHERE property_id = $1 ORDER BY created_at DESC',
        [propertyId]
      );
      await pool.end();
      
      return res.status(200).json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('MDM profiles fetch error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch MDM profiles'
      });
    }
  }
  
  // MDM alerts - /api/mdm/alerts
  if (pathname === '/api/mdm/alerts' && method === 'GET') {
    const { propertyId, resolved } = req.query || {};
    const pool = createPool();
    
    try {
      let query = 'SELECT * FROM mdm_alerts WHERE 1=1';
      const params = [];
      
      if (propertyId) {
        params.push(propertyId);
        query += ` AND property_id = $${params.length}`;
      }
      
      if (resolved !== undefined) {
        params.push(resolved === 'true');
        query += ` AND resolved = $${params.length}`;
      }
      
      query += ' ORDER BY created_at DESC';
      
      const result = await pool.query(query, params);
      await pool.end();
      
      return res.status(200).json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('MDM alerts fetch error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch MDM alerts'
      });
    }
  }
  
  // Notifications statistics - /api/notifications/statistics
  if (pathname === '/api/notifications/statistics' && method === 'GET') {
    const { propertyId } = req.query || {};
    const pool = createPool();
    
    try {
      let query = `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent,
          COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
        FROM push_notifications
        WHERE 1=1
      `;
      const params = [];
      
      if (propertyId) {
        params.push(propertyId);
        query += ` AND property_id = $${params.length}`;
      }
      
      const result = await pool.query(query, params);
      await pool.end();
      
      return res.status(200).json({
        success: true,
        data: result.rows[0] || {
          total: 0,
          sent: 0,
          delivered: 0,
          failed: 0
        }
      });
    } catch (error) {
      console.error('Notifications statistics error:', error);
      await pool.end();
      
      // Return default values if table doesn't exist
      return res.status(200).json({
        success: true,
        data: {
          total: 0,
          sent: 0,
          delivered: 0,
          failed: 0
        }
      });
    }
  }
  
  // Default 404
  return res.status(404).json({
    success: false,
    message: `Not Found - ${pathname}`
  });
}
import cors from 'cors';
import jwt from 'jsonwebtoken';
import pg from 'pg';
import bcrypt from 'bcrypt';

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
  const [pathname, queryString] = url.split('?');
  
  // Parse query parameters
  const query = {};
  if (queryString) {
    const params = new URLSearchParams(queryString);
    for (const [key, value] of params) {
      query[key] = value;
    }
  }
  req.query = query;
  
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
    const pool = createPool();
    
    try {
      const { username, password, email } = req.body;
      
      // Allow login with either username or email
      let query;
      let params;
      
      if (email) {
        query = 'SELECT * FROM users WHERE email = $1 AND is_active = true';
        params = [email];
      } else if (username) {
        query = 'SELECT * FROM users WHERE username = $1 AND is_active = true';
        params = [username];
      } else {
        return res.status(400).json({
          success: false,
          message: 'Username or email required'
        });
      }
      
      const result = await pool.query(query, params);
      
      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
      
      const user = result.rows[0];
      
      // Verify password
      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      
      if (!passwordMatch) {
        // Log failed attempt
        await pool.query(
          `INSERT INTO audit_logs (user_id, action, ip_address, details) 
           VALUES ($1, $2, $3, $4)`,
          [user.id, 'login_failed', req.headers['x-forwarded-for'] || req.socket?.remoteAddress, { reason: 'invalid_password' }]
        );
        
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
      
      // Update last login
      await pool.query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );
      
      // Log successful login
      await pool.query(
        `INSERT INTO audit_logs (user_id, action, ip_address) 
         VALUES ($1, $2, $3)`,
        [user.id, 'login_success', req.headers['x-forwarded-for'] || req.socket?.remoteAddress]
      );
      
      // Generate tokens
      const token = generateToken({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      });
      
      // Create refresh token
      const refreshToken = jwt.sign(
        { id: user.id, type: 'refresh' },
        process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET || 'default-secret',
        { expiresIn: '7d' }
      );
      
      // Store refresh token
      await pool.query(
        `INSERT INTO refresh_tokens (user_id, token, expires_at) 
         VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
        [user.id, refreshToken]
      );
      
      await pool.end();
      
      return res.status(200).json({
        success: true,
        data: {
          token,
          refreshToken,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role
          }
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Authentication failed'
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
           AND is_active = true 
           AND check_in_date <= NOW() 
           AND check_out_date > NOW()
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
  
  // Activities list
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
  
  // Single activity - /api/activities/:id
  const singleActivityMatch = pathname.match(/^\/api\/activities\/([^\/]+)$/);
  if (singleActivityMatch && method === 'GET') {
    const activityId = singleActivityMatch[1];
    const pool = createPool();
    
    try {
      const result = await pool.query('SELECT * FROM activities WHERE id = $1', [activityId]);
      await pool.end();
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Activity not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Activity fetch error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch activity'
      });
    }
  }
  
  // Events
  if (pathname === '/api/events' && method === 'GET') {
    const pool = createPool();
    
    try {
      // Events table doesn't have property_id column, fetch all events
      const query = 'SELECT * FROM events ORDER BY start_date DESC';
      
      const result = await pool.query(query);
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
  
  // Event statistics - /api/events/stats
  if (pathname === '/api/events/stats' && method === 'GET') {
    const pool = createPool();
    
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*) as total_events,
          COUNT(CASE WHEN start_date >= CURRENT_DATE THEN 1 END) as upcoming_events,
          COUNT(CASE WHEN start_date < CURRENT_DATE THEN 1 END) as past_events
        FROM events
      `);
      await pool.end();
      
      return res.status(200).json({
        success: true,
        data: result.rows[0] || {
          total_events: 0,
          upcoming_events: 0,
          past_events: 0
        }
      });
    } catch (error) {
      console.error('Event stats error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch event statistics'
      });
    }
  }
  
  // Dining
  if (pathname === '/api/dining' && method === 'GET') {
    const pool = createPool();
    
    try {
      // The table is actually named dining_places
      const query = 'SELECT * FROM dining_places ORDER BY created_at DESC';
      
      const result = await pool.query(query);
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
  
  // Background images - /api/property/:id/backgrounds
  const backgroundImagesMatch = pathname.match(/^\/api\/property\/([^\/]+)\/backgrounds$/);
  if (backgroundImagesMatch && method === 'GET') {
    const propertyId = backgroundImagesMatch[1];
    const pool = createPool();
    
    try {
      const result = await pool.query(
        'SELECT * FROM background_images WHERE property_id = $1 ORDER BY created_at DESC',
        [propertyId]
      );
      await pool.end();
      
      return res.status(200).json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Background images fetch error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch background images'
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
  
  // User management - List users (admin only)
  if (pathname === '/api/users' && method === 'GET') {
    const pool = createPool();
    
    try {
      // Verify token and check admin role
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-for-dev');
      
      if (decoded.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }
      
      const result = await pool.query(
        'SELECT id, email, username, first_name, last_name, role, is_active, email_verified, last_login, created_at FROM users ORDER BY created_at DESC'
      );
      await pool.end();
      
      return res.status(200).json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Users fetch error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch users'
      });
    }
  }
  
  // Create new user (admin only)
  if (pathname === '/api/users' && method === 'POST') {
    const pool = createPool();
    
    try {
      // Verify token and check admin role
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-for-dev');
      
      if (decoded.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }
      
      const { email, username, password, firstName, lastName, role = 'user' } = req.body;
      
      if (!email || !username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email, username, and password are required'
        });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const result = await pool.query(
        `INSERT INTO users (email, username, password_hash, first_name, last_name, role, is_active, email_verified)
         VALUES ($1, $2, $3, $4, $5, $6, true, false)
         RETURNING id, email, username, first_name, last_name, role`,
        [email, username, hashedPassword, firstName, lastName, role]
      );
      
      // Log user creation
      await pool.query(
        `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details) 
         VALUES ($1, $2, $3, $4, $5)`,
        [decoded.id, 'user_created', 'user', result.rows[0].id, { created_by: decoded.username }]
      );
      
      await pool.end();
      
      return res.status(201).json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('User creation error:', error);
      await pool.end();
      
      if (error.code === '23505') { // Unique violation
        return res.status(400).json({
          success: false,
          message: 'Email or username already exists'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Failed to create user'
      });
    }
  }
  
  // Change password endpoint
  if (pathname === '/api/auth/change-password' && method === 'POST') {
    const pool = createPool();
    
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-for-dev');
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current and new passwords required'
        });
      }
      
      // Get user
      const userResult = await pool.query(
        'SELECT password_hash FROM users WHERE id = $1',
        [decoded.id]
      );
      
      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Verify current password
      const passwordMatch = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
      
      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password
      await pool.query(
        'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [hashedPassword, decoded.id]
      );
      
      // Log password change
      await pool.query(
        `INSERT INTO audit_logs (user_id, action, ip_address) 
         VALUES ($1, $2, $3)`,
        [decoded.id, 'password_changed', req.headers['x-forwarded-for'] || req.socket?.remoteAddress]
      );
      
      await pool.end();
      
      return res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Password change error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to change password'
      });
    }
  }
  
  // Refresh token endpoint
  if (pathname === '/api/auth/refresh' && method === 'POST') {
    const pool = createPool();
    
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token required'
        });
      }
      
      // Verify refresh token
      const decoded = jwt.verify(
        refreshToken, 
        process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET || 'default-secret'
      );
      
      if (decoded.type !== 'refresh') {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
      }
      
      // Check if refresh token exists in database
      const tokenResult = await pool.query(
        'SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
        [refreshToken]
      );
      
      if (tokenResult.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token'
        });
      }
      
      // Get user
      const userResult = await pool.query(
        'SELECT * FROM users WHERE id = $1 AND is_active = true',
        [decoded.id]
      );
      
      if (userResult.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'User not found or inactive'
        });
      }
      
      const user = userResult.rows[0];
      
      // Generate new access token
      const newToken = generateToken({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      });
      
      await pool.end();
      
      return res.status(200).json({
        success: true,
        data: {
          token: newToken
        }
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      await pool.end();
      return res.status(401).json({
        success: false,
        message: 'Failed to refresh token'
      });
    }
  }
  
  // Default 404
  return res.status(404).json({
    success: false,
    message: `Not Found - ${pathname}`
  });
}
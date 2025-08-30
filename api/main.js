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
  const isSupabase = connectionString && connectionString.includes('supabase.com');
  let sslConfig = false;
  
  if (isSupabase || connectionString.includes('sslmode=require') || process.env.NODE_ENV === 'production') {
    // Use SSL but don't reject unauthorized certificates
    sslConfig = {
      rejectUnauthorized: false,
      require: true,
      // Add additional SSL options for Supabase
      ...(isSupabase && {
        ca: undefined,
        cert: undefined,
        key: undefined
      })
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

// Helper function to import external image to Vercel Blob
const importImageToBlob = async (imageUrl, folder, filename) => {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN not configured, returning original URL');
      return imageUrl;
    }
    
    // If already a Vercel Blob URL, return as-is
    if (imageUrl.includes('blob.vercel-storage.com')) {
      return imageUrl;
    }
    
    console.log(`Importing image from ${imageUrl} to ${folder}/${filename}`);
    
    // Fetch the image
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/*'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    
    // Get the image buffer
    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // Import Vercel Blob
    const { put } = await import('@vercel/blob');
    
    // Upload to Vercel Blob
    const blob = await put(
      `${folder}/${filename}`,
      Buffer.from(buffer),
      {
        access: 'public',
        contentType,
        token: process.env.BLOB_READ_WRITE_TOKEN
      }
    );
    
    console.log(`Successfully imported to Vercel Blob: ${blob.url}`);
    return blob.url;
    
  } catch (error) {
    console.error('Failed to import image to Blob:', error);
    // Return original URL if import fails
    return imageUrl;
  }
};

// Vercel configuration for body parsing
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4.5mb',
    },
  },
};

export default async function handler(req, res) {
  const { url, method } = req;
  
  // Set CORS headers immediately for all requests - outside try-catch
  const origin = req.headers.origin || req.headers.Origin;
  if (origin && allowedOrigins.some(allowed => origin.startsWith(allowed))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle OPTIONS requests immediately - outside try-catch
  if (method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
  
  if (url && url.startsWith('/api/events/stats') && method === 'GET') {
    try {
      // Return default stats - database may not be initialized
      console.log('Events stats endpoint - returning defaults due to early catch');
      return res.status(200).json({
        success: true,
        data: {
          total: 0,
          today: 0,
          upcoming: 0,
          featured: 0
        }
      });
    } catch (e) {
      // Even CORS failed, still return something
      console.error('Critical error in events/stats:', e);
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(200).json({
        success: true,
        data: {
          total: 0,
          today: 0,
          upcoming: 0,
          featured: 0
        }
      });
    }
  }
  
  const [pathname, queryString] = (url || '').split('?');
  
  // Parse query parameters
  const query = {};
  if (queryString) {
    const params = new URLSearchParams(queryString);
    for (const [key, value] of params) {
      query[key] = value;
    }
  }
  req.query = query;
  
  // Vercel should handle body parsing with the export config above
  // Log body type for debugging
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    console.log('Request body type:', typeof req.body);
    if (req.body) {
      console.log('Body keys:', Object.keys(req.body).slice(0, 5));
    }
  }
  
  // Health check
  if (pathname === '/api/health' && method === 'GET') {
    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '2.1.0',
      blobStorageConfigured: !!process.env.BLOB_READ_WRITE_TOKEN,
      deployedAt: '2024-12-29'
    });
  }
  
  // tvOS device registration endpoint (simplified version without database)
  if (pathname === '/api/tvos/device/register' && method === 'POST') {
    try {
      // Handle both parameter naming conventions
      const {
        property_id = '41059600-402d-434e-9b34-2b4821f6e3a4', // Default Chalet 20
        identifier = req.body.device_identifier,
        device_identifier,
        device_name = 'Apple TV',
        model,
        os_version,
        app_version
      } = req.body;

      const deviceId = identifier || device_identifier;
      
      if (!deviceId) {
        return res.status(400).json({
          success: false,
          message: 'device_identifier is required'
        });
      }

      // For now, just return a successful registration without database
      // This allows the tvOS app to connect while we set up the database tables
      const device = {
        device_id: `device_${Date.now()}`,
        property_id,
        property_name: 'Chalet 20',
        identifier: deviceId,
        device_name,
        model,
        os_version,
        app_version,
        is_active: true,
        created_at: new Date().toISOString(),
        last_connected: new Date().toISOString()
      };
      
      return res.status(200).json({
        success: true,
        data: device,
        message: 'Device registered successfully'
      });
    } catch (error) {
      console.error('Device registration error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to register device'
      });
    }
  }

  // tvOS device authentication endpoint
  if (pathname === '/api/tvos/auth/device' && method === 'POST') {
    try {
      const { deviceId, propertyId } = req.body;
      
      if (!deviceId || !propertyId) {
        return res.status(400).json({
          success: false,
          message: 'deviceId and propertyId are required'
        });
      }
      
      // Create a session token for the device
      const sessionId = `tvos_${deviceId}_${Date.now()}`;
      
      return res.status(200).json({
        success: true,
        data: {
          sessionId,
          deviceId,
          propertyId,
          accessToken: sessionId,
          expiresIn: 86400, // 24 hours
          tokenType: 'Bearer'
        }
      });
    } catch (error) {
      console.error('Device auth error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to authenticate device'
      });
    }
  }
  
  // tvOS properties endpoint
  if (pathname.match(/^\/api\/tvos\/properties\/([^\/]+)$/) && method === 'GET') {
    const propertyId = pathname.split('/').pop();
    return res.status(200).json({
      success: true,
      data: {
        id: propertyId,
        name: 'Chalet 20',
        address: 'Schladming, Austria',
        description: 'Luxury mountain chalet with modern amenities',
        amenities: ['WiFi', 'Smart TV', 'Kitchen', 'Sauna', 'Parking'],
        check_in_time: '15:00',
        check_out_time: '10:00',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    });
  }
  
  // tvOS activities endpoint
  if (pathname === '/api/tvos/activities' && method === 'GET') {
    return res.status(200).json({
      success: true,
      data: [
        {
          id: '1',
          property_id: '41059600-402d-434e-9b34-2b4821f6e3a4',
          title: 'Planai Skiing',
          name: 'Planai Skiing',
          category: 'winter_sports',
          activity_type: 'outdoor',
          description: 'World-class skiing on Planai mountain',
          location: 'Schladming',
          image_url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256',
          target_guest_types: ['families', 'couples', 'groups']
        },
        {
          id: '2',
          property_id: '41059600-402d-434e-9b34-2b4821f6e3a4',
          title: 'Dachstein Glacier',
          name: 'Dachstein Glacier',
          category: 'sightseeing',
          activity_type: 'outdoor',
          description: 'Visit the eternal ice at Dachstein Glacier',
          location: 'Ramsau',
          image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
          target_guest_types: ['families', 'couples', 'groups']
        }
      ]
    });
  }
  
  // tvOS streaming services endpoint
  if (pathname === '/api/tvos/streaming-services' && method === 'GET') {
    return res.status(200).json({
      success: true,
      data: [
        {
          id: '1',
          property_id: '41059600-402d-434e-9b34-2b4821f6e3a4',
          service_name: 'Netflix',
          service_type: 'streaming',
          name: 'Netflix',
          logo_url: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
          is_active: true,
          requires_login: true
        },
        {
          id: '2',
          property_id: '41059600-402d-434e-9b34-2b4821f6e3a4',
          service_name: 'Apple TV+',
          service_type: 'streaming',
          name: 'Apple TV+',
          logo_url: 'https://upload.wikimedia.org/wikipedia/commons/2/28/Apple_TV_Plus_Logo.svg',
          is_active: true,
          requires_login: true
        }
      ]
    });
  }
  
  // tvOS dining endpoint
  if (pathname === '/api/tvos/dining' && method === 'GET') {
    return res.status(200).json({
      success: true,
      total: 2,
      data: [
        {
          id: '1',
          name: 'Talbachschenke',
          cuisine: 'Austrian',
          description: 'Traditional Austrian cuisine',
          location: {
            name: 'Schladming',
            address: 'Talbach 1, 8970 Schladming',
            coordinates: { lat: 47.3947, lng: 13.6853 }
          },
          rating: '4.5'
        },
        {
          id: '2',
          name: 'Falkensteiner Hotel Restaurant',
          cuisine: 'International',
          description: 'Fine dining with mountain views',
          location: {
            name: 'Schladming',
            address: 'Europaplatz 613, 8970 Schladming',
            coordinates: { lat: 47.3947, lng: 13.6853 }
          },
          rating: '4.8'
        }
      ]
    });
  }
  
  // Weather recommendations endpoint
  if (pathname === '/api/recommendations/weather' && method === 'GET') {
    return res.status(200).json({
      success: true,
      data: {
        location: 'Schladming, Austria',
        last_updated: new Date().toISOString(),
        current: {
          temperature: 15,
          condition: 'partly_cloudy',
          description: 'Partly cloudy with mild temperatures',
          icon: 'cloud.sun',
          humidity: 65,
          wind_speed: 10
        },
        forecast: [
          {
            date: new Date().toISOString(),
            day: 'Today',
            high: 18,
            low: 10,
            condition: 'sunny',
            icon: 'sun.max'
          }
        ]
      }
    });
  }
  
  // Health check endpoint to test database tables
  if (pathname === '/api/health/auth' && method === 'GET') {
    const pool = createPool();
    try {
      const tables = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('users', 'refresh_tokens', 'user_sessions', 'audit_logs')
        ORDER BY table_name
      `);
      
      const userCount = await pool.query('SELECT COUNT(*) FROM users');
      
      await pool.end();
      
      return res.status(200).json({
        success: true,
        tables: tables.rows.map(r => r.table_name),
        userCount: parseInt(userCount.rows[0].count),
        dbConnection: 'success'
      });
    } catch (error) {
      await pool.end();
      return res.status(500).json({
        success: false,
        message: error.message,
        code: error.code
      });
    }
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
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        detail: error.detail,
        stack: error.stack
      });
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Authentication failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
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

  // Change password
  if (pathname === '/api/auth/change-password' && method === 'POST') {
    const pool = createPool();
    
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
      const { currentPassword, newPassword } = req.body;
      
      // Get user
      const userResult = await pool.query(
        'SELECT password_hash FROM users WHERE id = $1',
        [decoded.id]
      );
      
      if (userResult.rows.length === 0) {
        await pool.end();
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Verify current password
      const passwordMatch = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
      
      if (!passwordMatch) {
        await pool.end();
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
      
      // Log the password change
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
      console.error('Change password error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to change password'
      });
    }
  }

  // Get all users (admin only)
  if (pathname === '/api/users' && method === 'GET') {
    const pool = createPool();
    
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
      
      // Check if user is admin
      if (decoded.role !== 'admin') {
        await pool.end();
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
      console.error('Get users error:', error);
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
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'No token provided'
        });
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-for-dev');
      
      // Check if user is admin
      if (decoded.role !== 'admin') {
        await pool.end();
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }
      
      const { email, username, password, firstName, lastName, role } = req.body;
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const result = await pool.query(
        `INSERT INTO users (email, username, password_hash, first_name, last_name, role, is_active, email_verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, email, username, first_name, last_name, role`,
        [email, username, hashedPassword, firstName || null, lastName || null, role || 'user', true, false]
      );
      
      // Log user creation
      await pool.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address) 
         VALUES ($1, $2, $3, $4, $5)`,
        [decoded.id, 'user_created', 'user', result.rows[0].id, req.headers['x-forwarded-for'] || req.socket?.remoteAddress]
      );
      
      await pool.end();
      
      return res.status(201).json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Create user error:', error);
      await pool.end();
      
      if (error.code === '23505') {
        return res.status(400).json({
          success: false,
          message: 'Username or email already exists'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Failed to create user'
      });
    }
  }

  // Delete user (admin only)
  const deleteUserMatch = pathname.match(/^\/api\/users\/([^\/]+)$/);
  if (deleteUserMatch && method === 'DELETE') {
    const userId = deleteUserMatch[1];
    const pool = createPool();
    
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
      
      // Check if user is admin
      if (decoded.role !== 'admin') {
        await pool.end();
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }
      
      // Prevent deleting self
      if (userId === decoded.id) {
        await pool.end();
        return res.status(400).json({
          success: false,
          message: 'Cannot delete your own account'
        });
      }
      
      // Delete user
      const result = await pool.query(
        'DELETE FROM users WHERE id = $1 RETURNING username',
        [userId]
      );
      
      if (result.rows.length === 0) {
        await pool.end();
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Log deletion
      await pool.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address) 
         VALUES ($1, $2, $3, $4, $5)`,
        [decoded.id, 'user_deleted', 'user', userId, req.headers['x-forwarded-for'] || req.socket?.remoteAddress]
      );
      
      await pool.end();
      
      return res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to delete user'
      });
    }
  }

  // Toggle user active status (admin only)
  const toggleUserMatch = pathname.match(/^\/api\/users\/([^\/]+)\/toggle-active$/);
  if (toggleUserMatch && method === 'PATCH') {
    const userId = toggleUserMatch[1];
    const pool = createPool();
    
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
      
      // Check if user is admin
      if (decoded.role !== 'admin') {
        await pool.end();
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }
      
      const { isActive } = req.body;
      
      // Update user status
      const result = await pool.query(
        'UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING username, is_active',
        [isActive, userId]
      );
      
      if (result.rows.length === 0) {
        await pool.end();
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Log status change
      await pool.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          decoded.id, 
          isActive ? 'user_activated' : 'user_deactivated', 
          'user', 
          userId, 
          { newStatus: isActive },
          req.headers['x-forwarded-for'] || req.socket?.remoteAddress
        ]
      );
      
      await pool.end();
      
      return res.status(200).json({
        success: true,
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error) {
      console.error('Toggle user error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to update user status'
      });
    }
  }
  
  // Property devices endpoint - GET /api/properties/:id/devices or /properties/:id/devices
  const propertyDevicesMatch = pathname.match(/^\/(?:api\/)?properties\/([^\/]+)\/devices$/);
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
      console.error('Property devices fetch error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch property devices'
      });
    }
  }
  
  // Devices list - GET /api/devices
  if (pathname === '/api/devices' && method === 'GET') {
    const pool = createPool();
    
    try {
      const { property_id } = req.query || {};
      
      let query = `
        SELECT d.*, p.name as property_name 
        FROM devices d
        LEFT JOIN properties p ON d.property_id = p.id
        WHERE 1=1
      `;
      const params = [];
      
      if (property_id) {
        params.push(property_id);
        query += ` AND d.property_id = $${params.length}`;
      }
      
      query += ' ORDER BY d.created_at DESC';
      
      const result = await pool.query(query, params);
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
  
  // Single device - GET /api/devices/:id
  const singleDeviceMatch = pathname.match(/^\/api\/devices\/([^\/]+)$/);
  if (singleDeviceMatch && method === 'GET') {
    const deviceId = singleDeviceMatch[1];
    const pool = createPool();
    
    try {
      const result = await pool.query(
        `SELECT d.*, p.name as property_name 
         FROM devices d
         LEFT JOIN properties p ON d.property_id = p.id
         WHERE d.id = $1`,
        [deviceId]
      );
      await pool.end();
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Device not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Device fetch error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch device'
      });
    }
  }
  
  // Restore default device - POST /api/devices/restore-default
  if (pathname === '/api/devices/restore-default' && method === 'POST') {
    const pool = createPool();
    
    try {
      // First ensure devices table exists
      await pool.query(`
        CREATE TABLE IF NOT EXISTS devices (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
          device_name VARCHAR(255) NOT NULL,
          device_type VARCHAR(50),
          identifier VARCHAR(255),
          serial_number VARCHAR(255),
          model VARCHAR(255),
          is_active BOOLEAN DEFAULT true,
          is_primary BOOLEAN DEFAULT false,
          metadata JSONB,
          kiosk_mode_enabled BOOLEAN DEFAULT false,
          kiosk_mode_config JSONB,
          allowed_apps JSONB,
          restrictions JSONB,
          room_number VARCHAR(50),
          device_status VARCHAR(50),
          enrollment_status VARCHAR(50),
          enrollment_date TIMESTAMP,
          provisional_period_end TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      // Ensure property exists
      await pool.query(`
        INSERT INTO properties (
          id, name, address, wifi_ssid, wifi_password, welcome_message
        ) VALUES (
          '41059600-402d-434e-9b34-2b4821f6e3a4',
          'Chalet 20',
          'Schladming, Austria',
          'Chalet20_WiFi',
          'Welcome2024',
          'Welcome to Chalet 20! Enjoy your stay.'
        )
        ON CONFLICT (id) DO NOTHING;
      `);
      
      // Insert or update the device
      const result = await pool.query(`
        INSERT INTO devices (
          id, property_id, device_name, device_type,
          identifier, serial_number, model, is_active, is_primary,
          metadata, kiosk_mode_enabled, kiosk_mode_config,
          allowed_apps, restrictions, room_number, device_status,
          enrollment_status, enrollment_date, provisional_period_end
        ) VALUES (
          '9f724aaa-295f-4736-b38a-a226441279ff',
          '41059600-402d-434e-9b34-2b4821f6e3a4',
          'Living Room Apple TV',
          'apple_tv',
          '00008110-000439023C63801E',
          'MW1R9ND9G1',
          'Apple TV 4K (3rd generation)',
          true,
          true,
          '{"hdr": true, "storage": "128GB", "generation": "3rd", "resolution": "4K"}'::jsonb,
          true,
          '{"mode": "autonomous", "enabled": true, "autoReturn": true, "returnTimeout": 1800}'::jsonb,
          '[{"name": "Netflix", "enabled": true, "bundleId": "com.netflix.Netflix"}, {"name": "YouTube", "enabled": true, "bundleId": "com.google.ios.youtube"}, {"name": "Spotify", "enabled": true, "bundleId": "com.spotify.client"}]'::jsonb,
          '{"disableAirPlay": false, "disableAutoLock": true, "disableAppRemoval": true}'::jsonb,
          'Living Room',
          'online',
          'enrolled',
          '2025-08-19 10:52:12.959495',
          '2025-09-18 10:52:12.959495'
        )
        ON CONFLICT (id) DO UPDATE SET
          device_name = EXCLUDED.device_name,
          model = EXCLUDED.model,
          metadata = EXCLUDED.metadata,
          kiosk_mode_config = EXCLUDED.kiosk_mode_config,
          allowed_apps = EXCLUDED.allowed_apps,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *;
      `);
      
      await pool.end();
      
      return res.status(200).json({
        success: true,
        message: 'Device restored successfully',
        data: result.rows[0]
      });
      
    } catch (error) {
      console.error('Device restore error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to restore device',
        error: error.message
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
  
  // Guests - all
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

  // Create new guest - POST /api/guests
  if (pathname === '/api/guests' && method === 'POST') {
    const pool = createPool();
    
    try {
      const { 
        name, 
        property_id,
        email,
        phone,
        check_in_date,
        check_out_date,
        welcome_message,
        special_requests,
        guest_type = 'family',
        party_size,
        number_of_adults,
        number_of_children,
        allergies,
        preferences,
        is_active = true
      } = req.body;
      
      // Parse name into first and last name if provided as full name
      let firstName, lastName;
      if (name) {
        const nameParts = name.split(' ');
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(' ') || nameParts[0];
      }
      
      const result = await pool.query(
        `INSERT INTO guests (
          first_name, last_name, property_id, email, phone,
          check_in_date, check_out_date, special_requests,
          guest_type, party_size, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [
          firstName || 'Guest',
          lastName || 'User',
          property_id,
          email,
          phone,
          check_in_date,
          check_out_date,
          special_requests || welcome_message,
          guest_type,
          party_size || number_of_adults || 1,
          is_active
        ]
      );
      
      await pool.end();
      
      return res.status(201).json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Guest create error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to create guest',
        error: error.message
      });
    }
  }

  // Single guest by ID - /api/guests/:id
  const singleGuestMatch = pathname.match(/^\/api\/guests\/([^\/]+)$/);
  if (singleGuestMatch && method === 'GET') {
    const guestId = singleGuestMatch[1];
    const pool = createPool();
    
    try {
      const result = await pool.query('SELECT * FROM guests WHERE id = $1', [guestId]);
      
      if (result.rows.length === 0) {
        await pool.end();
        return res.status(404).json({
          success: false,
          message: 'Guest not found'
        });
      }
      
      await pool.end();
      
      return res.status(200).json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Guest fetch error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch guest'
      });
    }
  }

  // Update guest - PUT /api/guests/:id
  if (singleGuestMatch && method === 'PUT') {
    const guestId = singleGuestMatch[1];
    const pool = createPool();
    
    try {
      const { 
        name, 
        property_id,
        email,
        phone,
        check_in_date,
        check_out_date,
        welcome_message,
        special_requests,
        guest_type,
        party_size,
        number_of_adults,
        number_of_children,
        allergies,
        preferences,
        is_active
      } = req.body;
      
      // Parse name into first and last name if provided as full name
      let firstName, lastName;
      if (name) {
        const nameParts = name.split(' ');
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(' ') || nameParts[0];
      }
      
      const result = await pool.query(
        `UPDATE guests 
         SET first_name = COALESCE($1, first_name),
             last_name = COALESCE($2, last_name),
             property_id = COALESCE($3, property_id),
             email = COALESCE($4, email),
             phone = COALESCE($5, phone),
             check_in_date = COALESCE($6, check_in_date),
             check_out_date = COALESCE($7, check_out_date),
             special_requests = COALESCE($8, special_requests),
             guest_type = COALESCE($9, guest_type),
             party_size = COALESCE($10, party_size),
             is_active = COALESCE($11, is_active),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $12
         RETURNING *`,
        [
          firstName,
          lastName,
          property_id,
          email,
          phone,
          check_in_date,
          check_out_date,
          special_requests || welcome_message,
          guest_type,
          party_size || number_of_adults,
          is_active !== undefined ? is_active : true,
          guestId
        ]
      );
      
      if (result.rows.length === 0) {
        await pool.end();
        return res.status(404).json({
          success: false,
          message: 'Guest not found'
        });
      }
      
      await pool.end();
      
      return res.status(200).json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Guest update error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to update guest'
      });
    }
  }

  // Delete guest - DELETE /api/guests/:id
  if (singleGuestMatch && method === 'DELETE') {
    const guestId = singleGuestMatch[1];
    const pool = createPool();
    
    try {
      const result = await pool.query('DELETE FROM guests WHERE id = $1 RETURNING *', [guestId]);
      
      if (result.rows.length === 0) {
        await pool.end();
        return res.status(404).json({
          success: false,
          message: 'Guest not found'
        });
      }
      
      await pool.end();
      
      return res.status(200).json({
        success: true,
        message: 'Guest deleted successfully'
      });
    } catch (error) {
      console.error('Guest delete error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to delete guest'
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
  
  // Create activity - /api/activities
  if (pathname === '/api/activities' && method === 'POST') {
    const pool = createPool();
    
    try {
      let { property_id, title, description, image_url, activity_type, location, contact_info, 
           operating_hours, price_range, booking_required, booking_url, booking_phone,
           is_active = true, display_order = 0 } = req.body;
      
      // Auto-import image to Vercel Blob if it's an external URL
      if (image_url && !image_url.includes('blob.vercel-storage.com')) {
        const timestamp = Date.now();
        const filename = `${timestamp}-${title?.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
        image_url = await importImageToBlob(image_url, `activities/${property_id}`, filename);
      }
      
      const result = await pool.query(
        `INSERT INTO activities 
         (property_id, title, description, image_url, activity_type, location, contact_info,
          operating_hours, price_range, booking_required, booking_url, booking_phone,
          is_active, display_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         RETURNING *`,
        [property_id, title, description, image_url, activity_type, location, contact_info,
         operating_hours, price_range, booking_required, booking_url, booking_phone,
         is_active, display_order]
      );
      
      await pool.end();
      
      return res.status(201).json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Activity create error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to create activity'
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
  
  // Update activity - /api/activities/:id
  if (singleActivityMatch && method === 'PUT') {
    const activityId = singleActivityMatch[1];
    const pool = createPool();
    
    try {
      let { title, description, image_url, activity_type, location, contact_info,
           operating_hours, price_range, booking_required, booking_url, booking_phone,
           is_active, display_order, property_id } = req.body;
      
      // Get property_id if not provided
      if (!property_id) {
        const existing = await pool.query('SELECT property_id FROM activities WHERE id = $1', [activityId]);
        if (existing.rows.length > 0) {
          property_id = existing.rows[0].property_id;
        }
      }
      
      // Auto-import image to Vercel Blob if it's an external URL
      if (image_url && !image_url.includes('blob.vercel-storage.com')) {
        const timestamp = Date.now();
        const filename = `${timestamp}-${title?.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
        image_url = await importImageToBlob(image_url, `activities/${property_id || activityId}`, filename);
      }
      
      const result = await pool.query(
        `UPDATE activities
         SET title = $1, description = $2, image_url = $3, activity_type = $4,
             location = $5, contact_info = $6, operating_hours = $7, price_range = $8,
             booking_required = $9, booking_url = $10, booking_phone = $11,
             is_active = $12, display_order = $13, updated_at = NOW()
         WHERE id = $14
         RETURNING *`,
        [title, description, image_url, activity_type, location, contact_info,
         operating_hours, price_range, booking_required, booking_url, booking_phone,
         is_active, display_order, activityId]
      );
      
      if (result.rows.length === 0) {
        await pool.end();
        return res.status(404).json({
          success: false,
          message: 'Activity not found'
        });
      }
      
      await pool.end();
      
      return res.status(200).json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Activity update error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to update activity'
      });
    }
  }
  
  // Delete activity - /api/activities/:id
  if (singleActivityMatch && method === 'DELETE') {
    const activityId = singleActivityMatch[1];
    const pool = createPool();
    
    try {
      const result = await pool.query('DELETE FROM activities WHERE id = $1 RETURNING *', [activityId]);
      
      if (result.rows.length === 0) {
        await pool.end();
        return res.status(404).json({
          success: false,
          message: 'Activity not found'
        });
      }
      
      await pool.end();
      
      return res.status(200).json({
        success: true,
        message: 'Activity deleted successfully'
      });
    } catch (error) {
      console.error('Activity delete error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to delete activity'
      });
    }
  }
  
  // Events - GET /api/events
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
  
  // Scrape events - POST /api/events/scrape
  if (pathname === '/api/events/scrape' && method === 'POST') {
    try {
      // Import the enhanced scraper dynamically
      const { EnhancedEventScraperService } = await import('../src/services/enhancedEventScraperService.js');
      
      console.log('🔄 Starting event scraping process...');
      
      // Get max pages from request body (default 1 for Vercel timeout constraints)
      const { maxPages = 1 } = req.body || {};
      
      // Create scraper instance
      const scraper = new EnhancedEventScraperService();
      
      // Run scraping synchronously and wait for completion (within timeout limit)
      try {
        const events = await scraper.scrapeEvents(maxPages);
        console.log(`✅ Scraping completed: ${events.length} events processed`);
        
        return res.status(200).json({
          success: true,
          message: `Successfully scraped ${events.length} events from ${maxPages} page(s)`,
          eventsCount: events.length
        });
      } catch (scrapeError) {
        console.error('❌ Scraping failed:', scrapeError);
        
        // Try fallback: scrape without enhanced features
        try {
          console.log('Attempting basic scraping...');
          const { EventScraperService } = await import('../src/services/eventScraperService.js');
          const basicScraper = new EventScraperService();
          const events = await basicScraper.scrapeEvents(1);
          
          return res.status(200).json({
            success: true,
            message: `Scraped ${events.length} events using basic scraper`,
            eventsCount: events.length,
            fallback: true
          });
        } catch (fallbackError) {
          throw fallbackError;
        }
      }
      
    } catch (error) {
      console.error('Scrape endpoint error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to scrape events',
        error: error.message
      });
    }
  }
  
  // Quick scrape - GET /api/events/quick-scrape (for testing)
  if (pathname === '/api/events/quick-scrape' && method === 'GET') {
    const pool = createPool();
    
    try {
      console.log('🚀 Quick scrape - fetching sample events...');
      
      // Create some sample events for immediate testing
      const sampleEvents = [
        {
          name: 'Schladming Night Race 2025',
          description: 'World Cup Ski Racing under floodlights',
          start_date: new Date('2025-01-28T18:00:00'),
          location: 'Planai Stadium, Schladming',
          category: 'sport',
          image_url: 'https://www.schladming-dachstein.at/assets/images/nightrace.jpg',
          is_featured: true
        },
        {
          name: 'Dachstein Glacier Concert',
          description: 'Classical music concert on the glacier at 2700m',
          start_date: new Date('2025-09-15T11:00:00'),
          location: 'Dachstein Glacier',
          category: 'music',
          image_url: 'https://www.schladming-dachstein.at/assets/images/glacier.jpg',
          is_featured: true
        },
        {
          name: 'Ramsau Farmers Market',
          description: 'Traditional farmers market with local products',
          start_date: new Date('2025-09-01T08:00:00'),
          location: 'Ramsau Town Center',
          category: 'market',
          image_url: 'https://www.schladming-dachstein.at/assets/images/market.jpg'
        }
      ];
      
      let inserted = 0;
      for (const event of sampleEvents) {
        try {
          await pool.query(
            `INSERT INTO events (name, description, start_date, location, category, image_url, is_featured)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [event.name, event.description, event.start_date, event.location, 
             event.category, event.image_url, event.is_featured || false]
          );
          inserted++;
        } catch (e) {
          console.error('Failed to insert event:', e.message);
        }
      }
      
      await pool.end();
      
      return res.status(200).json({
        success: true,
        message: `Quick scrape completed: ${inserted} sample events added`,
        eventsAdded: inserted
      });
      
    } catch (error) {
      console.error('Quick scrape error:', error);
      if (pool) await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Quick scrape failed',
        error: error.message
      });
    }
  }
  
  // Create event - POST /api/events
  if (pathname === '/api/events' && method === 'POST') {
    let pool = null;
    
    try {
      // Create pool with error handling
      try {
        pool = createPool();
      } catch (poolError) {
        console.error('Failed to create pool for event creation:', poolError);
        return res.status(500).json({
          success: false,
          message: 'Database connection failed'
        });
      }
      
      let { title, name, description, start_date, end_date, image_url, location, 
           event_type, price, booking_url, is_featured = false } = req.body;
      
      // Map title to name for database (frontend sends title, database has name column)
      name = name || title;
      
      console.log('Creating event:', { name, event_type, location });
      
      // Auto-import image to Vercel Blob if it's an external URL
      try {
        if (image_url && !image_url.includes('blob.vercel-storage.com')) {
          const timestamp = Date.now();
          const filename = `${timestamp}-${title?.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
          image_url = await importImageToBlob(image_url, 'events', filename);
        }
      } catch (imageError) {
        console.error('Image import error (continuing with original URL):', imageError.message);
        // Continue with the original image_url
      }
      
      // First check if the events table exists
      let tableExists = false;
      try {
        const tableCheck = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'events'
          );
        `);
        tableExists = tableCheck.rows[0]?.exists || false;
      } catch (tableError) {
        console.error('Error checking events table:', tableError);
        tableExists = false;
      }
      
      if (!tableExists) {
        // Try to create the events table
        console.log('Events table not found, attempting to create it...');
        try {
          await pool.query(`
            CREATE TABLE IF NOT EXISTS events (
              id SERIAL PRIMARY KEY,
              external_id VARCHAR(255) UNIQUE,
              name VARCHAR(255) NOT NULL,
              description TEXT,
              start_date TIMESTAMP NOT NULL,
              end_date TIMESTAMP,
              image_url TEXT,
              location TEXT,
              source_url TEXT,
              category VARCHAR(100),
              event_type VARCHAR(100),
              price DECIMAL(10, 2),
              price_info TEXT,
              contact_info TEXT,
              booking_url TEXT,
              is_featured BOOLEAN DEFAULT false,
              is_active BOOLEAN DEFAULT true,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `);
          console.log('Events table created successfully');
        } catch (createError) {
          console.error('Failed to create events table:', createError);
          if (pool) await pool.end();
          return res.status(500).json({
            success: false,
            message: 'Events table not initialized'
          });
        }
      }
      
      const result = await pool.query(
        `INSERT INTO events 
         (name, description, start_date, end_date, image_url, location,
          event_type, price, booking_url, is_featured)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [name, description, start_date, end_date, image_url, location,
         event_type, price, booking_url, is_featured || false]
      );
      
      await pool.end();
      
      return res.status(201).json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Event create error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        detail: error.detail
      });
      
      if (pool) {
        try {
          await pool.end();
        } catch (e) {
          // Ignore pool closing errors
        }
      }
      
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to create event'
      });
    }
  }
  
  // Single event - GET /api/events/:id
  const singleEventMatch = pathname.match(/^\/api\/events\/([^\/]+)$/);
  // Skip if this is the stats endpoint
  if (singleEventMatch && method === 'GET' && singleEventMatch[1] !== 'stats') {
    const eventId = singleEventMatch[1];
    const pool = createPool();
    
    try {
      const result = await pool.query('SELECT * FROM events WHERE id = $1', [eventId]);
      await pool.end();
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Event fetch error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch event'
      });
    }
  }
  
  // Update event - PUT /api/events/:id
  if (singleEventMatch && method === 'PUT' && singleEventMatch[1] !== 'stats') {
    const eventId = singleEventMatch[1];
    let pool = null;
    
    try {
      // Create pool with error handling
      try {
        pool = createPool();
      } catch (poolError) {
        console.error('Failed to create pool for event update:', poolError);
        return res.status(500).json({
          success: false,
          message: 'Database connection failed'
        });
      }
      
      let { title, name, description, start_date, end_date, image_url, location,
           event_type, price, booking_url, is_featured } = req.body;
      
      // Map title to name for database (frontend sends title, database has name column)
      name = name || title;
      
      console.log('Updating event:', eventId, { name, event_type, location });
      
      // Auto-import image to Vercel Blob if it's an external URL
      try {
        if (image_url && !image_url.includes('blob.vercel-storage.com')) {
          const timestamp = Date.now();
          const filename = `${timestamp}-${title?.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
          image_url = await importImageToBlob(image_url, 'events', filename);
        }
      } catch (imageError) {
        console.error('Image import error (continuing with original URL):', imageError.message);
        // Continue with the original image_url
      }
      
      // First check if the events table exists
      let tableExists = false;
      try {
        const tableCheck = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'events'
          );
        `);
        tableExists = tableCheck.rows[0]?.exists || false;
      } catch (tableError) {
        console.error('Error checking events table:', tableError);
        tableExists = false;
      }
      
      if (!tableExists) {
        if (pool) await pool.end();
        return res.status(500).json({
          success: false,
          message: 'Events table not initialized'
        });
      }
      
      const result = await pool.query(
        `UPDATE events
         SET name = $1, description = $2, start_date = $3, end_date = $4,
             image_url = $5, location = $6, event_type = $7, price = $8,
             booking_url = $9, is_featured = $10, updated_at = NOW()
         WHERE id = $11
         RETURNING *`,
        [name, description, start_date, end_date, image_url, location,
         event_type, price, booking_url, is_featured || false, eventId]
      );
      
      if (result.rows.length === 0) {
        await pool.end();
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }
      
      await pool.end();
      
      return res.status(200).json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Event update error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        detail: error.detail
      });
      
      if (pool) {
        try {
          await pool.end();
        } catch (e) {
          // Ignore pool closing errors
        }
      }
      
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to update event'
      });
    }
  }
  
  // Delete event - DELETE /api/events/:id
  if (singleEventMatch && method === 'DELETE' && singleEventMatch[1] !== 'stats') {
    const eventId = singleEventMatch[1];
    const pool = createPool();
    
    try {
      const result = await pool.query('DELETE FROM events WHERE id = $1 RETURNING *', [eventId]);
      
      if (result.rows.length === 0) {
        await pool.end();
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }
      
      await pool.end();
      
      return res.status(200).json({
        success: true,
        message: 'Event deleted successfully'
      });
    } catch (error) {
      console.error('Event delete error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to delete event'
      });
    }
  }
  
  // Event statistics - /api/events/stats
  // NOTE: This is handled at the top of the handler for safety
  if (false && pathname === '/api/events/stats' && method === 'GET') {
    // Default response for any error
    const defaultResponse = {
      success: true,
      data: {
        total: 0,
        today: 0,
        upcoming: 0,
        featured: 0
      }
    };
    
    let pool = null;
    
    try {
      console.log('Events stats endpoint hit');
      
      // Try to create pool - if this fails, return defaults
      try {
        pool = createPool();
      } catch (poolError) {
        console.error('Failed to create pool for events stats:', poolError.message);
        return res.status(200).json(defaultResponse);
      }
      
      // First, check if events table exists
      let tableExists = false;
      try {
        const tableCheck = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'events'
          );
        `);
        tableExists = tableCheck.rows[0]?.exists || false;
      } catch (tableError) {
        console.error('Error checking events table:', tableError.message);
        // Table check failed, assume table doesn't exist
        tableExists = false;
      }
      
      if (!tableExists) {
        if (pool) {
          try {
            await pool.end();
          } catch (e) {
            // Ignore pool closing errors
          }
        }
        return res.status(200).json(defaultResponse);
      }
      
      // Simple query without DATE function
      let stats = null;
      try {
        const result = await pool.query(`
          SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN start_date::date = CURRENT_DATE THEN 1 END) as today,
            COUNT(CASE WHEN start_date::date > CURRENT_DATE AND start_date::date <= CURRENT_DATE + 7 THEN 1 END) as upcoming,
            COUNT(CASE WHEN is_featured = true THEN 1 END) as featured
          FROM events
        `);
        stats = result.rows[0];
      } catch (queryError) {
        console.error('Error querying events stats:', queryError.message);
        // Query failed, use defaults
        stats = null;
      }
      
      // Close pool
      if (pool) {
        try {
          await pool.end();
        } catch (e) {
          // Ignore pool closing errors
        }
      }
      
      if (!stats) {
        return res.status(200).json(defaultResponse);
      }
      
      // Convert all values to numbers
      const processedStats = {};
      Object.keys(stats).forEach(key => {
        const value = stats[key];
        if (value === null || value === undefined) {
          processedStats[key] = 0;
        } else if (typeof value === 'bigint') {
          processedStats[key] = Number(value);
        } else if (typeof value === 'string') {
          processedStats[key] = parseInt(value, 10) || 0;
        } else {
          processedStats[key] = Number(value) || 0;
        }
      });
      
      return res.status(200).json({
        success: true,
        data: processedStats
      });
    } catch (error) {
      console.error('Unexpected error in events stats endpoint:', error);
      
      // Try to close pool if it was created
      if (pool) {
        try {
          await pool.end();
        } catch (e) {
          // Ignore pool closing errors
        }
      }
      
      // Always return default stats on any error - never return 500
      return res.status(200).json(defaultResponse);
    }
  }
  
  // Clean dining images - POST /api/dining/cleanup-images
  if (pathname === '/api/dining/cleanup-images' && method === 'POST') {
    const pool = createPool();
    
    try {
      // Ensure table exists
      await pool.query(`
        CREATE TABLE IF NOT EXISTS dining_places (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          description TEXT,
          cuisine_type VARCHAR(100),
          price_range VARCHAR(50),
          location TEXT,
          contact_phone VARCHAR(50),
          website VARCHAR(255),
          opening_hours JSONB,
          image_url TEXT,
          rating NUMERIC(3,2),
          is_featured BOOLEAN DEFAULT false,
          property_id UUID,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      // List of known faulty domains
      const faultyDomains = [
        'cdn.fastenberg.at', 'media.obertal.at', 'media.preuneggtal.at',
        'media.artisan-schladming.at', 'media.planai.at', 'media.reiteralm.at',
        'media.schafalm.at', 'cdn.alpenverein.at', 'cdn.hochwurzen.at',
        'cdn.landalm.at', 'cdn.dachstein.at', 'cdn.das-friedrich.at',
        'cdn.planai.at', 'cdn.rohrmoos.at', 'images.falstaff.com',
        'cdn.schladming-dachstein.at'
      ];
      
      // Valid placeholder images
      const validPlaceholders = [
        'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1525610553991-2bede1a236e2?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&auto=format&fit=crop'
      ];
      
      // Get all dining places with faulty images
      const result = await pool.query('SELECT id, name, image_url FROM dining_places WHERE image_url IS NOT NULL');
      
      let updatedCount = 0;
      const updates = [];
      
      for (const place of result.rows) {
        // Skip if no image URL
        if (!place.image_url) continue;
        
        const isFaultyDomain = faultyDomains.some(domain => place.image_url.includes(domain));
        
        if (isFaultyDomain) {
          // Generate consistent placeholder based on name (use ID if name is null)
          const nameForHash = place.name || place.id || 'default';
          const placeholderIndex = Math.abs(String(nameForHash).split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % validPlaceholders.length;
          const newImageUrl = validPlaceholders[placeholderIndex];
          
          await pool.query(
            'UPDATE dining_places SET image_url = $1 WHERE id = $2',
            [newImageUrl, place.id]
          );
          
          updates.push({
            name: place.name || 'Unknown',
            oldUrl: place.image_url,
            newUrl: newImageUrl
          });
          updatedCount++;
        }
      }
      
      await pool.end();
      
      return res.status(200).json({
        success: true,
        message: `Cleaned up ${updatedCount} faulty dining images`,
        updatedCount,
        updates
      });
      
    } catch (error) {
      console.error('Dining cleanup error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to cleanup dining images',
        error: error.message
      });
    }
  }
  
  // Dining - GET /api/dining
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
  
  // Create dining place - POST /api/dining
  if (pathname === '/api/dining' && method === 'POST') {
    const pool = createPool();
    
    try {
      let { name, description, cuisine_type, price_range, location, contact_phone,
           website, opening_hours, image_url, rating, is_featured = false,
           reservation_required = false, distance_km, event_type } = req.body;
      
      // Auto-import image to Vercel Blob if it's an external URL
      if (image_url && !image_url.includes('blob.vercel-storage.com')) {
        const timestamp = Date.now();
        const filename = `${timestamp}-${name?.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
        image_url = await importImageToBlob(image_url, 'dining', filename);
      }
      
      const result = await pool.query(
        `INSERT INTO dining_places 
         (name, description, cuisine_type, price_range, location, contact_phone,
          website, opening_hours, image_url, rating, is_featured,
          reservation_required, distance_km, event_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         RETURNING *`,
        [name, description, cuisine_type, price_range, location, contact_phone,
         website, opening_hours, image_url, rating, is_featured,
         reservation_required, distance_km, event_type]
      );
      
      await pool.end();
      
      return res.status(201).json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Dining create error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to create dining place'
      });
    }
  }
  
  // Single dining place - GET /api/dining/:id
  const singleDiningMatch = pathname.match(/^\/api\/dining\/([^\/]+)$/);
  if (singleDiningMatch && method === 'GET') {
    const diningId = singleDiningMatch[1];
    const pool = createPool();
    
    try {
      const result = await pool.query('SELECT * FROM dining_places WHERE id = $1', [diningId]);
      await pool.end();
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Dining place not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Dining fetch error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch dining place'
      });
    }
  }
  
  // Update dining place - PUT /api/dining/:id
  if (singleDiningMatch && method === 'PUT') {
    const diningId = singleDiningMatch[1];
    const pool = createPool();
    
    try {
      let { name, description, cuisine_type, price_range, location, contact_phone,
           website, opening_hours, image_url, rating, is_featured,
           reservation_required, distance_km, event_type } = req.body;
      
      // Auto-import image to Vercel Blob if it's an external URL
      if (image_url && !image_url.includes('blob.vercel-storage.com')) {
        const timestamp = Date.now();
        const filename = `${timestamp}-${name?.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
        image_url = await importImageToBlob(image_url, 'dining', filename);
      }
      
      const result = await pool.query(
        `UPDATE dining_places
         SET name = $1, description = $2, cuisine_type = $3, price_range = $4,
             location = $5, contact_phone = $6, website = $7, opening_hours = $8,
             image_url = $9, rating = $10, is_featured = $11,
             reservation_required = $12, distance_km = $13, event_type = $14,
             updated_at = NOW()
         WHERE id = $15
         RETURNING *`,
        [name, description, cuisine_type, price_range, location, contact_phone,
         website, opening_hours, image_url, rating, is_featured,
         reservation_required, distance_km, event_type, diningId]
      );
      
      if (result.rows.length === 0) {
        await pool.end();
        return res.status(404).json({
          success: false,
          message: 'Dining place not found'
        });
      }
      
      await pool.end();
      
      return res.status(200).json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Dining update error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to update dining place'
      });
    }
  }
  
  // Delete dining place - DELETE /api/dining/:id
  if (singleDiningMatch && method === 'DELETE') {
    const diningId = singleDiningMatch[1];
    const pool = createPool();
    
    try {
      const result = await pool.query('DELETE FROM dining_places WHERE id = $1 RETURNING *', [diningId]);
      
      if (result.rows.length === 0) {
        await pool.end();
        return res.status(404).json({
          success: false,
          message: 'Dining place not found'
        });
      }
      
      await pool.end();
      
      return res.status(200).json({
        success: true,
        message: 'Dining place deleted successfully'
      });
    } catch (error) {
      console.error('Dining delete error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to delete dining place'
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
  
  // Streaming services for a specific property - GET /api/properties/:id/streaming-services
  const propertyStreamingMatch = pathname.match(/^\/api\/properties\/([^\/]+)\/streaming-services$/);
  if (propertyStreamingMatch && method === 'GET') {
    const propertyId = propertyStreamingMatch[1];
    const pool = createPool();
    
    try {
      const result = await pool.query(
        `SELECT * FROM streaming_services 
         WHERE property_id = $1 OR property_id IS NULL 
         ORDER BY display_order, service_name`,
        [propertyId]
      );
      await pool.end();
      
      return res.status(200).json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Property streaming services fetch error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch streaming services'
      });
    }
  }
  
  // Add streaming service - POST /api/properties/:id/streaming-services
  if (propertyStreamingMatch && method === 'POST') {
    const propertyId = propertyStreamingMatch[1];
    const pool = createPool();
    
    try {
      const { service_name, service_type, app_url_scheme, logo_url, instructions, requires_login, display_order } = req.body;
      
      const result = await pool.query(
        `INSERT INTO streaming_services 
         (property_id, service_name, service_type, app_url_scheme, logo_url, instructions, requires_login, display_order, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
         RETURNING *`,
        [propertyId, service_name, service_type || 'streaming', app_url_scheme, logo_url, instructions, requires_login !== false, display_order || 0]
      );
      
      await pool.end();
      
      return res.status(201).json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Streaming service create error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to create streaming service'
      });
    }
  }
  
  // Update streaming service - PUT /api/properties/:id/streaming-services/:serviceId
  const updateStreamingMatch = pathname.match(/^\/api\/properties\/([^\/]+)\/streaming-services\/([^\/]+)$/);
  if (updateStreamingMatch && method === 'PUT') {
    const [, propertyId, serviceId] = updateStreamingMatch;
    const pool = createPool();
    
    try {
      const { service_name, service_type, app_url_scheme, logo_url, instructions, requires_login, display_order, is_active } = req.body;
      
      const result = await pool.query(
        `UPDATE streaming_services 
         SET service_name = $1, service_type = $2, app_url_scheme = $3, logo_url = $4, 
             instructions = $5, requires_login = $6, display_order = $7, is_active = $8,
             updated_at = NOW()
         WHERE id = $9 AND property_id = $10
         RETURNING *`,
        [service_name, service_type, app_url_scheme, logo_url, instructions, requires_login, display_order, is_active, serviceId, propertyId]
      );
      
      if (result.rows.length === 0) {
        await pool.end();
        return res.status(404).json({
          success: false,
          message: 'Streaming service not found'
        });
      }
      
      await pool.end();
      
      return res.status(200).json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Streaming service update error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to update streaming service'
      });
    }
  }
  
  // Delete streaming service - DELETE /api/properties/:id/streaming-services/:serviceId
  if (updateStreamingMatch && method === 'DELETE') {
    const [, propertyId, serviceId] = updateStreamingMatch;
    const pool = createPool();
    
    try {
      const result = await pool.query(
        'DELETE FROM streaming_services WHERE id = $1 AND property_id = $2 RETURNING *',
        [serviceId, propertyId]
      );
      
      if (result.rows.length === 0) {
        await pool.end();
        return res.status(404).json({
          success: false,
          message: 'Streaming service not found'
        });
      }
      
      await pool.end();
      
      return res.status(200).json({
        success: true,
        message: 'Streaming service deleted successfully'
      });
    } catch (error) {
      console.error('Streaming service delete error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to delete streaming service'
      });
    }
  }
  
  // Streaming services (all)
  if ((pathname === '/api/streaming-services' || pathname === '/api/streaming') && method === 'GET') {
    const pool = createPool();
    
    try {
      const result = await pool.query('SELECT * FROM streaming_services ORDER BY service_name');
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
      
      // Ensure table exists
      await pool.query(`
        CREATE TABLE IF NOT EXISTS property_settings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          property_id UUID,
          company_name VARCHAR(255),
          logo_url TEXT,
          primary_color VARCHAR(7),
          secondary_color VARCHAR(7),
          default_language VARCHAR(10) DEFAULT 'en',
          time_zone VARCHAR(50) DEFAULT 'Europe/Vienna',
          check_in_time VARCHAR(10) DEFAULT '15:00',
          check_out_time VARCHAR(10) DEFAULT '11:00',
          auto_cleanup BOOLEAN DEFAULT true,
          cleanup_interval INTEGER DEFAULT 24,
          enable_tv_app BOOLEAN DEFAULT true,
          enable_kiosk_mode BOOLEAN DEFAULT false,
          enable_guest_messaging BOOLEAN DEFAULT true,
          enable_analytics BOOLEAN DEFAULT true,
          privacy_mode BOOLEAN DEFAULT false,
          data_retention_days INTEGER DEFAULT 30,
          notification_email VARCHAR(255),
          sms_notifications BOOLEAN DEFAULT false,
          push_notifications BOOLEAN DEFAULT true,
          weather_api_key VARCHAR(255),
          currency VARCHAR(3) DEFAULT 'EUR',
          default_background_url TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      let result;
      if (property_id) {
        // Get settings for specific property
        result = await pool.query(
          'SELECT * FROM property_settings WHERE property_id = $1',
          [property_id]
        );
      } else {
        // Get global settings (property_id is NULL)
        result = await pool.query(
          'SELECT * FROM property_settings WHERE property_id IS NULL LIMIT 1'
        );
        
        // If no global settings exist, create default
        if (result.rows.length === 0) {
          result = await pool.query(`
            INSERT INTO property_settings (property_id, company_name, primary_color, secondary_color)
            VALUES (NULL, 'Chalet Moments', '#3B82F6', '#1E40AF')
            RETURNING *
          `);
        }
      }
      
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
  
  
  // Update settings - PUT /api/settings
  if (pathname === '/api/settings' && method === 'PUT') {
    const pool = createPool();
    
    try {
      const { property_id } = req.query || {};
      const settings = req.body;
      
      // Remove property_id from settings to avoid overwriting
      delete settings.property_id;
      
      // Build update query dynamically
      const fields = Object.keys(settings);
      if (fields.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No settings to update'
        });
      }
      
      const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
      const values = fields.map(field => settings[field]);
      
      let query;
      let queryValues;
      
      if (property_id) {
        query = `
          UPDATE property_settings 
          SET ${setClause}, updated_at = CURRENT_TIMESTAMP
          WHERE property_id = $1
          RETURNING *
        `;
        queryValues = [property_id, ...values];
      } else {
        // Update global settings
        query = `
          UPDATE property_settings 
          SET ${setClause}, updated_at = CURRENT_TIMESTAMP
          WHERE property_id IS NULL
          RETURNING *
        `;
        queryValues = [null, ...values];
        
        // First check if global settings exist
        const existing = await pool.query(
          'SELECT id FROM property_settings WHERE property_id IS NULL'
        );
        
        if (existing.rows.length === 0) {
          // Create if doesn't exist
          const insertFields = [...fields, 'property_id'];
          const insertPlaceholders = insertFields.map((_, i) => `$${i + 1}`).join(', ');
          const insertQuery = `
            INSERT INTO property_settings (${insertFields.join(', ')})
            VALUES (${insertPlaceholders})
            RETURNING *
          `;
          const result = await pool.query(insertQuery, [null, ...values]);
          await pool.end();
          
          return res.status(200).json({
            success: true,
            data: result.rows[0],
            message: 'Settings created successfully'
          });
        }
      }
      
      const result = await pool.query(query, queryValues);
      await pool.end();
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Settings not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: result.rows[0],
        message: 'Settings updated successfully'
      });
      
    } catch (error) {
      console.error('Settings update error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to update settings'
      });
    }
  }
  
  // MDM profiles - /api/mdm/properties/:id/profiles
  const mdmProfilesMatch = pathname.match(/^\/api\/mdm\/properties\/([^\/]+)\/profiles$/);
  if (mdmProfilesMatch && method === 'GET') {
    const propertyId = mdmProfilesMatch[1];
    const pool = createPool();
    
    try {
      // Ensure table exists
      await pool.query(`
        CREATE TABLE IF NOT EXISTS mdm_profiles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          property_id UUID,
          profile_name VARCHAR(255) NOT NULL,
          profile_type VARCHAR(50),
          profile_data JSONB,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      const result = await pool.query(
        'SELECT * FROM mdm_profiles WHERE property_id = $1 ORDER BY created_at DESC',
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
      // Ensure table exists first
      await pool.query(`
        CREATE TABLE IF NOT EXISTS mdm_alerts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          device_id UUID,
          property_id UUID,
          alert_type VARCHAR(50) NOT NULL,
          severity VARCHAR(20) DEFAULT 'info',
          title VARCHAR(255) NOT NULL,
          message TEXT,
          metadata JSONB,
          is_resolved BOOLEAN DEFAULT false,
          resolved_at TIMESTAMP,
          resolved_by VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      let query = 'SELECT * FROM mdm_alerts WHERE 1=1';
      const params = [];
      
      if (propertyId) {
        params.push(propertyId);
        query += ` AND property_id = $${params.length}`;
      }
      
      if (resolved !== undefined) {
        params.push(resolved === 'true');
        query += ` AND is_resolved = $${params.length}`;
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
        message: 'Failed to fetch MDM alerts',
        error: error.message
      });
    }
  }
  
  // MDM cleanup endpoint - POST /api/mdm/cleanup
  if (pathname === '/api/mdm/cleanup' && method === 'POST') {
    const pool = createPool();
    
    try {
      const { adminKey, keepIdentifier } = req.body;
      
      // Verify admin key
      if (adminKey !== 'mdm-init-2025') {
        return res.status(403).json({
          success: false,
          message: 'Invalid admin key'
        });
      }
      
      console.log('Cleaning up test devices...');
      
      // Delete all devices except the one with keepIdentifier
      let deleteResult;
      if (keepIdentifier) {
        deleteResult = await pool.query(`
          DELETE FROM devices 
          WHERE property_id = '41059600-402d-434e-9b34-2b4821f6e3a4'
          AND identifier != $1
          RETURNING id, device_name, identifier
        `, [keepIdentifier]);
      } else {
        deleteResult = await pool.query(`
          DELETE FROM devices 
          WHERE property_id = '41059600-402d-434e-9b34-2b4821f6e3a4'
          AND (identifier LIKE 'TEST-%' OR serial_number LIKE 'TEST-%')
          RETURNING id, device_name, identifier
        `);
      }
      
      // Get remaining devices
      const remainingResult = await pool.query(`
        SELECT id, device_name, identifier, serial_number, device_status
        FROM devices 
        WHERE property_id = '41059600-402d-434e-9b34-2b4821f6e3a4'
      `);
      
      await pool.end();
      
      return res.status(200).json({
        success: true,
        message: 'Test devices cleaned up',
        deleted: deleteResult.rows,
        deletedCount: deleteResult.rowCount,
        remaining: remainingResult.rows,
        remainingCount: remainingResult.rowCount
      });
      
    } catch (error) {
      console.error('MDM cleanup error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to cleanup devices',
        error: error.message
      });
    }
  }
  
  // MDM reset endpoint - POST /api/mdm/reset
  if (pathname === '/api/mdm/reset' && method === 'POST') {
    const pool = createPool();
    
    try {
      const { action, adminKey } = req.body;
      
      // Verify admin key
      if (adminKey !== 'mdm-init-2025') {
        return res.status(403).json({
          success: false,
          message: 'Invalid admin key'
        });
      }
      
      if (action === 'reset_tables') {
        console.log('Resetting MDM tables...');
        
        // Drop existing tables
        await pool.query('DROP TABLE IF EXISTS mdm_commands CASCADE');
        await pool.query('DROP TABLE IF EXISTS mdm_alerts CASCADE');
        await pool.query('DROP TABLE IF EXISTS mdm_device_status CASCADE');
        await pool.query('DROP TABLE IF EXISTS mdm_profiles CASCADE');
        
        // Recreate with correct structure
        await pool.query(`
          CREATE TABLE mdm_profiles (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
            profile_name VARCHAR(255) NOT NULL,
            profile_type VARCHAR(50),
            profile_data JSONB,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(property_id, profile_name)
          )
        `);
        
        await pool.query(`
          CREATE TABLE mdm_alerts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
            property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
            alert_type VARCHAR(50) NOT NULL,
            severity VARCHAR(20) DEFAULT 'info',
            title VARCHAR(255) NOT NULL,
            message TEXT,
            metadata JSONB,
            is_resolved BOOLEAN DEFAULT false,
            resolved_at TIMESTAMP,
            resolved_by VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        await pool.query(`
          CREATE TABLE mdm_commands (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
            property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
            command_type VARCHAR(50) NOT NULL,
            command_data JSONB,
            status VARCHAR(20) DEFAULT 'pending',
            executed_at TIMESTAMP,
            result JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        await pool.query(`
          CREATE TABLE mdm_device_status (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            device_id UUID REFERENCES devices(id) ON DELETE CASCADE UNIQUE,
            property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
            last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            battery_level INTEGER,
            storage_available BIGINT,
            storage_total BIGINT,
            network_status VARCHAR(50),
            current_app VARCHAR(255),
            screen_status VARCHAR(20),
            kiosk_mode_active BOOLEAN DEFAULT false,
            metadata JSONB,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        const tableCheck = await pool.query(`
          SELECT table_name FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name IN ('mdm_profiles', 'mdm_alerts', 'mdm_commands', 'mdm_device_status')
          ORDER BY table_name
        `);
        
        await pool.end();
        
        return res.status(200).json({
          success: true,
          message: 'MDM tables reset successfully',
          tables: tableCheck.rows.map(row => row.table_name)
        });
      }
      
      await pool.end();
      return res.status(400).json({
        success: false,
        message: 'Invalid action'
      });
      
    } catch (error) {
      console.error('MDM reset error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to reset MDM tables',
        error: error.message
      });
    }
  }
  
  // MDM initialization endpoint - POST /api/mdm/init
  if (pathname === '/api/mdm/init' && method === 'POST') {
    const pool = createPool();
    
    try {
      const { action, adminKey } = req.body;
      
      // Verify admin key
      if (adminKey !== 'mdm-init-2025') {
        return res.status(403).json({
          success: false,
          message: 'Invalid admin key'
        });
      }
      
      if (action === 'initialize_tables') {
        console.log('Initializing MDM tables...');
        
        // Create mdm_profiles table
        await pool.query(`
          CREATE TABLE IF NOT EXISTS mdm_profiles (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
            profile_name VARCHAR(255) NOT NULL,
            profile_type VARCHAR(50),
            profile_data JSONB,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(property_id, profile_name)
          )
        `);
        
        // Create mdm_alerts table
        await pool.query(`
          CREATE TABLE IF NOT EXISTS mdm_alerts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
            property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
            alert_type VARCHAR(50) NOT NULL,
            severity VARCHAR(20) DEFAULT 'info',
            title VARCHAR(255) NOT NULL,
            message TEXT,
            metadata JSONB,
            is_resolved BOOLEAN DEFAULT false,
            resolved_at TIMESTAMP,
            resolved_by VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        // Create mdm_commands table
        await pool.query(`
          CREATE TABLE IF NOT EXISTS mdm_commands (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
            property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
            command_type VARCHAR(50) NOT NULL,
            command_data JSONB,
            status VARCHAR(20) DEFAULT 'pending',
            executed_at TIMESTAMP,
            result JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        // Create mdm_device_status table
        await pool.query(`
          CREATE TABLE IF NOT EXISTS mdm_device_status (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            device_id UUID REFERENCES devices(id) ON DELETE CASCADE UNIQUE,
            property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
            last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            battery_level INTEGER,
            storage_available BIGINT,
            storage_total BIGINT,
            network_status VARCHAR(50),
            current_app VARCHAR(255),
            screen_status VARCHAR(20),
            kiosk_mode_active BOOLEAN DEFAULT false,
            metadata JSONB,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        // Create indexes
        await pool.query(`
          CREATE INDEX IF NOT EXISTS idx_mdm_alerts_property_id 
            ON mdm_alerts(property_id) WHERE is_resolved = false
        `);
        
        await pool.query(`
          CREATE INDEX IF NOT EXISTS idx_mdm_alerts_device_id 
            ON mdm_alerts(device_id)
        `);
        
        await pool.query(`
          CREATE INDEX IF NOT EXISTS idx_mdm_commands_device_id 
            ON mdm_commands(device_id) WHERE status = 'pending'
        `);
        
        await pool.query(`
          CREATE INDEX IF NOT EXISTS idx_mdm_device_status_device_id 
            ON mdm_device_status(device_id)
        `);
        
        await pool.query(`
          CREATE INDEX IF NOT EXISTS idx_mdm_profiles_property_id 
            ON mdm_profiles(property_id) WHERE is_active = true
        `);
        
        // Create update trigger function
        await pool.query(`
          CREATE OR REPLACE FUNCTION update_updated_at_column()
          RETURNS TRIGGER AS $$
          BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
          END;
          $$ language 'plpgsql'
        `);
        
        // Apply triggers
        await pool.query(`
          DROP TRIGGER IF EXISTS update_mdm_profiles_updated_at ON mdm_profiles;
          CREATE TRIGGER update_mdm_profiles_updated_at
            BEFORE UPDATE ON mdm_profiles
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column()
        `);
        
        await pool.query(`
          DROP TRIGGER IF EXISTS update_mdm_commands_updated_at ON mdm_commands;
          CREATE TRIGGER update_mdm_commands_updated_at
            BEFORE UPDATE ON mdm_commands
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column()
        `);
        
        await pool.query(`
          DROP TRIGGER IF EXISTS update_mdm_device_status_updated_at ON mdm_device_status;
          CREATE TRIGGER update_mdm_device_status_updated_at
            BEFORE UPDATE ON mdm_device_status
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column()
        `);
        
        // Add MDM columns to devices table
        await pool.query(`
          ALTER TABLE devices 
          ADD COLUMN IF NOT EXISTS enrollment_status VARCHAR(50) DEFAULT 'not_enrolled',
          ADD COLUMN IF NOT EXISTS enrollment_date TIMESTAMP,
          ADD COLUMN IF NOT EXISTS last_heartbeat TIMESTAMP,
          ADD COLUMN IF NOT EXISTS os_version VARCHAR(50),
          ADD COLUMN IF NOT EXISTS app_version VARCHAR(50),
          ADD COLUMN IF NOT EXISTS push_token VARCHAR(255)
        `);
        
        // Insert default profile for Chalet 20 (skip if fails)
        try {
          await pool.query(`
            INSERT INTO mdm_profiles (
              property_id,
              profile_name,
              profile_type,
              profile_data,
              is_active
            ) VALUES (
              '41059600-402d-434e-9b34-2b4821f6e3a4',
              'Default Profile',
              'standard',
              $1,
              true
            )
        `, [JSON.stringify({
          kiosk_mode: {
            enabled: false,
            mode: "relaxed",
            auto_return: true,
            timeout: 300
          },
          allowed_apps: [
            {bundleId: "com.netflix.Netflix", enabled: true},
            {bundleId: "com.google.ios.youtube", enabled: true},
            {bundleId: "com.disney.disneyplus", enabled: true}
          ],
          restrictions: {
            disable_airplay: false,
            disable_auto_lock: true,
            disable_app_removal: true
          }
        })]);
        } catch (profileError) {
          console.log('Default profile insert skipped:', profileError.message);
        }
        
        // Verify tables were created
        const tableCheck = await pool.query(`
          SELECT table_name FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name IN ('mdm_profiles', 'mdm_alerts', 'mdm_commands', 'mdm_device_status')
          ORDER BY table_name
        `);
        
        await pool.end();
        
        return res.status(200).json({
          success: true,
          message: 'MDM tables initialized successfully',
          tables: tableCheck.rows.map(row => row.table_name)
        });
      }
      
      await pool.end();
      return res.status(400).json({
        success: false,
        message: 'Invalid action'
      });
      
    } catch (error) {
      console.error('MDM initialization error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to initialize MDM tables',
        error: error.message
      });
    }
  }
  
  // MDM heartbeat endpoint - POST /api/mdm/heartbeat
  if (pathname === '/api/mdm/heartbeat' && method === 'POST') {
    const pool = createPool();
    
    try {
      const { 
        device_id, 
        identifier,
        status = 'online',
        battery_level,
        storage_available,
        storage_total,
        current_app,
        screen_status,
        kiosk_mode_active,
        network_status,
        os_version,
        app_version,
        metadata = {}
      } = req.body;
      
      if (!device_id && !identifier) {
        return res.status(400).json({
          success: false,
          message: 'Device ID or identifier is required'
        });
      }
      
      // Find device by ID or identifier
      let deviceResult;
      if (device_id) {
        deviceResult = await pool.query(
          'SELECT id, property_id FROM devices WHERE id = $1',
          [device_id]
        );
      } else {
        deviceResult = await pool.query(
          'SELECT id, property_id FROM devices WHERE identifier = $1',
          [identifier]
        );
      }
      
      if (deviceResult.rows.length === 0) {
        await pool.end();
        return res.status(404).json({
          success: false,
          message: 'Device not found'
        });
      }
      
      const device = deviceResult.rows[0];
      
      // Update device status
      await pool.query(`
        UPDATE devices SET
          device_status = $2,
          last_heartbeat = CURRENT_TIMESTAMP,
          last_seen = CURRENT_TIMESTAMP,
          is_online = true,
          os_version = COALESCE($3, os_version),
          app_version = COALESCE($4, app_version),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [device.id, status, os_version, app_version]);
      
      // Update or insert device status details
      await pool.query(`
        INSERT INTO mdm_device_status (
          device_id, property_id, last_seen, battery_level,
          storage_available, storage_total, network_status,
          current_app, screen_status, kiosk_mode_active, metadata
        ) VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (device_id) DO UPDATE SET
          last_seen = CURRENT_TIMESTAMP,
          battery_level = COALESCE($3, mdm_device_status.battery_level),
          storage_available = COALESCE($4, mdm_device_status.storage_available),
          storage_total = COALESCE($5, mdm_device_status.storage_total),
          network_status = COALESCE($6, mdm_device_status.network_status),
          current_app = COALESCE($7, mdm_device_status.current_app),
          screen_status = COALESCE($8, mdm_device_status.screen_status),
          kiosk_mode_active = COALESCE($9, mdm_device_status.kiosk_mode_active),
          metadata = COALESCE($10, mdm_device_status.metadata),
          updated_at = CURRENT_TIMESTAMP
      `, [
        device.id, device.property_id, battery_level, storage_available,
        storage_total, network_status, current_app, screen_status,
        kiosk_mode_active, metadata
      ]);
      
      // Check for pending commands
      const pendingCommands = await pool.query(`
        SELECT id, command_type, command_data
        FROM mdm_commands
        WHERE device_id = $1 AND status = 'pending'
        ORDER BY created_at ASC
        LIMIT 5
      `, [device.id]);
      
      await pool.end();
      
      return res.status(200).json({
        success: true,
        message: 'Heartbeat received',
        commands: pendingCommands.rows
      });
      
    } catch (error) {
      console.error('MDM heartbeat error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to process heartbeat',
        error: error.message
      });
    }
  }
  
  // MDM device enrollment - POST /api/mdm/enroll
  if (pathname === '/api/mdm/enroll' && method === 'POST') {
    const pool = createPool();
    
    try {
      const {
        property_id,
        device_name,
        device_type = 'apple_tv',
        identifier,
        serial_number,
        model,
        os_version,
        enrollment_token
      } = req.body;
      
      if (!identifier || !serial_number) {
        return res.status(400).json({
          success: false,
          message: 'Device identifier and serial number are required'
        });
      }
      
      // Verify enrollment token (in production, validate against Apple's servers)
      // For now, we'll accept any token for development
      if (!enrollment_token) {
        return res.status(400).json({
          success: false,
          message: 'Enrollment token is required'
        });
      }
      
      // Check if device already exists
      const existingDevice = await pool.query(
        'SELECT id FROM devices WHERE identifier = $1 OR serial_number = $2',
        [identifier, serial_number]
      );
      
      if (existingDevice.rows.length > 0) {
        // Update existing device
        const result = await pool.query(`
          UPDATE devices SET
            device_name = COALESCE($2, device_name),
            device_type = COALESCE($3, device_type),
            model = COALESCE($4, model),
            os_version = COALESCE($5, os_version),
            enrollment_status = 'enrolled',
            enrollment_date = CURRENT_TIMESTAMP,
            device_status = 'online',
            is_online = true,
            last_heartbeat = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
          RETURNING *
        `, [
          existingDevice.rows[0].id,
          device_name,
          device_type,
          model,
          os_version
        ]);
        
        await pool.end();
        return res.status(200).json({
          success: true,
          message: 'Device re-enrolled successfully',
          device: result.rows[0]
        });
      }
      
      // Create new device
      const result = await pool.query(`
        INSERT INTO devices (
          property_id, device_name, device_type, identifier,
          serial_number, model, os_version, enrollment_status,
          enrollment_date, device_status, is_online, last_heartbeat
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, 'enrolled',
          CURRENT_TIMESTAMP, 'online', true, CURRENT_TIMESTAMP
        ) RETURNING *
      `, [
        property_id, device_name, device_type, identifier,
        serial_number, model, os_version
      ]);
      
      // Create initial device status record
      await pool.query(`
        INSERT INTO mdm_device_status (
          device_id, property_id, last_seen
        ) VALUES ($1, $2, CURRENT_TIMESTAMP)
      `, [result.rows[0].id, property_id]);
      
      // Create enrollment complete alert
      await pool.query(`
        INSERT INTO mdm_alerts (
          device_id, property_id, alert_type, severity,
          title, message
        ) VALUES (
          $1, $2, 'enrollment_complete', 'info',
          'Device Enrolled Successfully',
          $3
        )
      `, [
        result.rows[0].id,
        property_id,
        `${device_name || 'New device'} has been enrolled in MDM`
      ]);
      
      await pool.end();
      
      return res.status(201).json({
        success: true,
        message: 'Device enrolled successfully',
        device: result.rows[0]
      });
      
    } catch (error) {
      console.error('MDM enrollment error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to enroll device',
        error: error.message
      });
    }
  }
  
  // MDM commands endpoint - POST /api/mdm/commands
  if (pathname === '/api/mdm/commands' && method === 'POST') {
    const pool = createPool();
    
    try {
      const {
        device_id,
        command_type,
        command_data = {},
        priority = 5
      } = req.body;
      
      if (!device_id || !command_type) {
        return res.status(400).json({
          success: false,
          message: 'Device ID and command type are required'
        });
      }
      
      // Verify device exists and get property_id
      const deviceResult = await pool.query(
        'SELECT id, property_id, device_status FROM devices WHERE id = $1',
        [device_id]
      );
      
      if (deviceResult.rows.length === 0) {
        await pool.end();
        return res.status(404).json({
          success: false,
          message: 'Device not found'
        });
      }
      
      const device = deviceResult.rows[0];
      
      // Create command
      const result = await pool.query(`
        INSERT INTO mdm_commands (
          device_id, property_id, command_type,
          command_data, status
        ) VALUES (
          $1, $2, $3, $4, 'pending'
        ) RETURNING *
      `, [
        device.id,
        device.property_id,
        command_type,
        command_data
      ]);
      
      // If device is online, mark for immediate delivery
      if (device.device_status === 'online') {
        // In production, this would trigger push notification or WebSocket message
        console.log(`Command queued for immediate delivery to device ${device_id}`);
      }
      
      await pool.end();
      
      return res.status(201).json({
        success: true,
        message: 'Command created successfully',
        command: result.rows[0],
        delivery: device.device_status === 'online' ? 'immediate' : 'queued'
      });
      
    } catch (error) {
      console.error('MDM command creation error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to create command',
        error: error.message
      });
    }
  }
  
  // MDM command status update - PUT /api/mdm/commands/:id
  const mdmCommandMatch = pathname.match(/^\/api\/mdm\/commands\/([^/]+)$/);
  if (mdmCommandMatch && method === 'PUT') {
    const commandId = mdmCommandMatch[1];
    const pool = createPool();
    
    try {
      const { status, result } = req.body;
      
      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }
      
      const updateResult = await pool.query(`
        UPDATE mdm_commands SET
          status = $2,
          result = COALESCE($3, result),
          executed_at = CASE WHEN $2 IN ('completed', 'failed') THEN CURRENT_TIMESTAMP ELSE executed_at END,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `, [commandId, status, result]);
      
      if (updateResult.rows.length === 0) {
        await pool.end();
        return res.status(404).json({
          success: false,
          message: 'Command not found'
        });
      }
      
      await pool.end();
      
      return res.status(200).json({
        success: true,
        message: 'Command status updated',
        command: updateResult.rows[0]
      });
      
    } catch (error) {
      console.error('MDM command update error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to update command',
        error: error.message
      });
    }
  }
  
  // Get MDM devices - GET /api/mdm/devices
  if (pathname === '/api/mdm/devices' && method === 'GET') {
    const pool = createPool();
    
    try {
      const { property_id } = req.query || {};
      
      let query = `
        SELECT 
          d.*,
          ds.battery_level,
          ds.storage_available,
          ds.storage_total,
          ds.network_status,
          ds.current_app,
          ds.screen_status,
          ds.kiosk_mode_active,
          ds.last_seen as status_last_seen
        FROM devices d
        LEFT JOIN mdm_device_status ds ON d.id = ds.device_id
      `;
      
      const params = [];
      if (property_id) {
        query += ' WHERE d.property_id = $1';
        params.push(property_id);
      }
      
      query += ' ORDER BY d.device_name';
      
      const result = await pool.query(query, params);
      
      // Update online status based on heartbeat
      const now = new Date();
      const devices = result.rows.map(device => {
        const lastHeartbeat = device.last_heartbeat ? new Date(device.last_heartbeat) : null;
        const minutesSinceHeartbeat = lastHeartbeat ? (now - lastHeartbeat) / 1000 / 60 : null;
        
        return {
          ...device,
          is_online: minutesSinceHeartbeat !== null && minutesSinceHeartbeat < 5,
          computed_status: minutesSinceHeartbeat === null ? 'never_connected' :
                          minutesSinceHeartbeat < 5 ? 'online' :
                          minutesSinceHeartbeat < 30 ? 'idle' : 'offline'
        };
      });
      
      await pool.end();
      
      return res.status(200).json({
        success: true,
        data: devices
      });
      
    } catch (error) {
      console.error('MDM devices fetch error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch devices',
        error: error.message
      });
    }
  }
  
  // MDM test notification endpoint - POST /api/mdm/test-notification  
  if (pathname === '/api/mdm/test-notification' && method === 'POST') {
    const pool = createPool();
    
    try {
      const { deviceId, title = 'Test Notification', message = 'This is a test notification from MDM service' } = req.body;
      
      if (!deviceId) {
        return res.status(400).json({
          success: false,
          message: 'Device ID is required'
        });
      }
      
      // Create a test alert
      await pool.query(`
        INSERT INTO mdm_alerts (device_id, property_id, alert_type, severity, title, message)
        SELECT 
          id as device_id,
          property_id,
          'test_notification' as alert_type,
          'info' as severity,
          $2 as title,
          $3 as message
        FROM devices 
        WHERE id = $1
      `, [deviceId, title, message]);
      
      await pool.end();
      
      return res.status(200).json({
        success: true,
        message: 'Test notification sent successfully'
      });
      
    } catch (error) {
      console.error('MDM test notification error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to send test notification',
        error: error.message
      });
    }
  }
  
  // Background images - GET /api/property/:id/backgrounds
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
      
      // Filter out images with invalid /uploads/ paths since they don't exist on Vercel
      const validImages = result.rows.filter(img => {
        const url = img.image_url || img.url || img.path;
        // Return images with external URLs or base64 data URLs
        return url && (
          url.startsWith('http://') || 
          url.startsWith('https://') || 
          url.startsWith('data:image/')
        );
      });
      
      return res.status(200).json({
        success: true,
        data: validImages
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

  // Upload background image with Vercel Blob Storage - POST /api/property/:id/backgrounds/upload
  const uploadBackgroundMatch = pathname.match(/^\/api\/property\/([^\/]+)\/backgrounds\/upload$/);
  if (uploadBackgroundMatch && method === 'POST') {
    const propertyId = uploadBackgroundMatch[1];
    const pool = createPool();
    
    try {
      const { put } = await import('@vercel/blob');
      const { image, filename, title, season = 'all' } = req.body || {};
      
      if (!image) {
        await pool.end();
        return res.status(400).json({
          success: false,
          message: 'No image data provided'
        });
      }
      
      // Check if BLOB_READ_WRITE_TOKEN is configured
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        console.error('BLOB_READ_WRITE_TOKEN not configured');
        // Fallback to direct URL storage if Blob Storage is not configured
        await pool.end();
        return res.status(400).json({
          success: false,
          message: 'Image hosting not configured. Please set up Vercel Blob Storage or use direct URL upload.'
        });
      }
      
      // Convert base64 to buffer
      const base64Data = image.split(',')[1] || image;
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Determine content type from data URL
      let contentType = 'image/jpeg';
      if (image.startsWith('data:')) {
        const match = image.match(/data:([^;]+);/);
        if (match) {
          contentType = match[1];
        }
      }
      
      // Generate a unique filename
      const timestamp = Date.now();
      const sanitizedFilename = (filename || 'image').replace(/[^a-zA-Z0-9.-]/g, '_');
      const blobFilename = `backgrounds/${propertyId}/${timestamp}-${sanitizedFilename}`;
      
      // Upload to Vercel Blob Storage
      const blob = await put(blobFilename, buffer, {
        access: 'public',
        contentType,
        token: process.env.BLOB_READ_WRITE_TOKEN
      });
      
      console.log('Successfully uploaded to Vercel Blob Storage:', blob.url);
      
      // Save the Vercel Blob URL to database
      const result = await pool.query(
        `INSERT INTO background_images (property_id, image_url, title, season, upload_type)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [propertyId, blob.url, title || filename || null, season, 'vercel-blob']
      );
      
      await pool.end();
      
      return res.status(201).json({
        success: true,
        data: result.rows[0],
        message: 'Image uploaded to Vercel Blob Storage successfully'
      });
      
    } catch (error) {
      console.error('Vercel Blob Storage error:', error);
      await pool.end();
      
      // Provide helpful error message
      if (error.message && error.message.includes('BLOB_READ_WRITE_TOKEN')) {
        return res.status(500).json({
          success: false,
          message: 'Vercel Blob Storage is not configured. Please add BLOB_READ_WRITE_TOKEN to your environment variables in Vercel dashboard.'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: `Failed to upload image: ${error.message}`
      });
    }
  }
  
  // Upload background image - POST /api/property/:id/backgrounds  
  if (backgroundImagesMatch && method === 'POST') {
    const propertyId = backgroundImagesMatch[1];
    const pool = createPool();
    
    try {
      // Body should already be parsed
      const body = req.body || {};
      
      // Handle JSON request (URL or base64 upload)
      const { imageUrl, title, season = 'all', uploadType = 'url' } = body;
      
      if (!imageUrl) {
        console.error('No imageUrl in body:', JSON.stringify(body).substring(0, 100));
        await pool.end();
        return res.status(400).json({
          success: false,
          message: 'Image URL is required'
        });
      }
      
      let finalImageUrl = imageUrl;
      
      // For base64 images, we need to handle the column size limitation
      if (imageUrl.startsWith('data:image/')) {
        // Check size
        if (imageUrl.length > 4 * 1024 * 1024) {
          await pool.end();
          return res.status(413).json({
            success: false,
            message: 'Image too large. Please reduce file size to under 3MB'
          });
        }
        
        // For now, return an error since the column isn't updated on production
        await pool.end();
        return res.status(400).json({
          success: false,
          message: 'File uploads are temporarily disabled. Please use the URL upload option with an external image URL (e.g., from Unsplash, Imgur, or another image hosting service).'
        });
      }
      
      console.log('Uploading external URL:', finalImageUrl);
      
      // First, try to update the column type (this might fail if already done or no permissions)
      try {
        await pool.query('ALTER TABLE background_images ALTER COLUMN image_url TYPE TEXT');
        console.log('Updated image_url column to TEXT');
      } catch (alterError) {
        // Ignore - column might already be TEXT or we don't have permissions
        console.log('Could not alter column (might already be TEXT):', alterError.message);
      }
      
      const result = await pool.query(
        `INSERT INTO background_images (property_id, image_url, title, season, upload_type)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [propertyId, finalImageUrl, title || null, season, uploadType]
      );
      
      await pool.end();
      
      console.log('Successfully uploaded background image:', result.rows[0].id);
      
      return res.status(201).json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Background image upload error:', error);
      console.error('Error code:', error.code);
      console.error('Error detail:', error.detail);
      
      // Check if it's a string length error
      if (error.code === '22001' || error.message.includes('character varying') || error.message.includes('too long')) {
        await pool.end();
        return res.status(400).json({
          success: false,
          message: 'Image URL is too long. Please use a shorter URL or use an external image hosting service.'
        });
      }
      
      await pool.end();
      return res.status(500).json({
        success: false,
        message: `Failed to upload background image: ${error.message}`
      });
    }
  }

  // Delete background image - DELETE /api/property/:id/backgrounds/:imageId
  const deleteBackgroundMatch = pathname.match(/^\/api\/property\/([^\/]+)\/backgrounds\/([^\/]+)$/);
  if (deleteBackgroundMatch && method === 'DELETE') {
    const [, propertyId, imageId] = deleteBackgroundMatch;
    const pool = createPool();
    
    try {
      const result = await pool.query(
        'DELETE FROM background_images WHERE id = $1 AND property_id = $2 RETURNING *',
        [imageId, propertyId]
      );
      
      if (result.rows.length === 0) {
        await pool.end();
        return res.status(404).json({
          success: false,
          message: 'Background image not found'
        });
      }
      
      await pool.end();
      
      return res.status(200).json({
        success: true,
        message: 'Background image deleted successfully'
      });
    } catch (error) {
      console.error('Background image delete error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to delete background image'
      });
    }
  }
  
  // Cleanup invalid background images - POST /api/property/:id/backgrounds/cleanup
  const cleanupBackgroundMatch = pathname.match(/^\/api\/property\/([^\/]+)\/backgrounds\/cleanup$/);
  if (cleanupBackgroundMatch && method === 'POST') {
    const propertyId = cleanupBackgroundMatch[1];
    const pool = createPool();
    
    try {
      // Delete all images with /uploads/ paths since they don't exist on Vercel
      // Keep base64 data URLs and external URLs
      const result = await pool.query(
        `DELETE FROM background_images 
         WHERE property_id = $1 
         AND image_url LIKE '/uploads/%'
         RETURNING *`,
        [propertyId]
      );
      
      await pool.end();
      
      return res.status(200).json({
        success: true,
        message: `Cleaned up ${result.rows.length} invalid background images`,
        deletedCount: result.rows.length
      });
    } catch (error) {
      console.error('Background image cleanup error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to cleanup background images'
      });
    }
  }

  // Return 404 for /uploads/* paths - these don't exist on Vercel
  if (pathname.startsWith('/uploads/') && method === 'GET') {
    return res.status(404).json({
      success: false,
      message: 'File uploads are not supported on Vercel serverless functions. Please use external image URLs instead.'
    });
  }
  
  // Property Information endpoints - GET /api/properties/:id/information
  const propertyInfoMatch = pathname.match(/^\/api\/properties\/([^\/]+)\/information$/);
  if (propertyInfoMatch && method === 'GET') {
    const propertyId = propertyInfoMatch[1];
    const pool = createPool();
    
    try {
      const result = await pool.query(
        'SELECT * FROM property_information WHERE property_id = $1 ORDER BY display_order, created_at',
        [propertyId]
      );
      await pool.end();
      
      return res.status(200).json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Property information fetch error:', error);
      await pool.end();
      
      // If table doesn't exist, return empty array
      if (error.code === '42P01') {
        return res.status(200).json({
          success: true,
          data: []
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch property information'
      });
    }
  }
  
  // Create property information - POST /api/properties/:id/information
  if (propertyInfoMatch && method === 'POST') {
    const propertyId = propertyInfoMatch[1];
    const pool = createPool();
    
    try {
      const {
        category = 'amenity',
        type,
        title,
        description,
        instructions,
        icon = 'info',
        url,
        display_order = 0,
        is_active = true,
        metadata = {}
      } = req.body;
      
      const result = await pool.query(
        `INSERT INTO property_information 
         (property_id, category, type, title, description, instructions, icon, url, display_order, is_active, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [propertyId, category, type, title, description, instructions, icon, url, display_order, is_active, metadata]
      );
      
      await pool.end();
      
      return res.status(201).json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Property information create error:', error);
      await pool.end();
      
      // Create table if it doesn't exist
      if (error.code === '42P01') {
        const createPool2 = createPool();
        try {
          await createPool2.query(`
            CREATE TABLE property_information (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              property_id UUID NOT NULL,
              category VARCHAR(50) NOT NULL,
              type VARCHAR(50),
              title VARCHAR(255) NOT NULL,
              description TEXT,
              instructions TEXT,
              icon VARCHAR(50),
              url VARCHAR(500),
              display_order INTEGER DEFAULT 0,
              is_active BOOLEAN DEFAULT true,
              metadata JSONB DEFAULT '{}',
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `);
          
          // Try insert again
          const result = await createPool2.query(
            `INSERT INTO property_information 
             (property_id, category, type, title, description, instructions, icon, url, display_order, is_active, metadata)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
             RETURNING *`,
            [propertyId, category, type, title, description, instructions, icon, url, display_order, is_active, metadata]
          );
          
          await createPool2.end();
          
          return res.status(201).json({
            success: true,
            data: result.rows[0]
          });
        } catch (createError) {
          console.error('Table creation error:', createError);
          await createPool2.end();
        }
      }
      
      return res.status(500).json({
        success: false,
        message: 'Failed to create property information'
      });
    }
  }
  
  // Update property information - PUT /api/property-info/:id
  const updatePropertyInfoMatch = pathname.match(/^\/api\/property-info\/([^\/]+)$/);
  if (updatePropertyInfoMatch && method === 'PUT') {
    const infoId = updatePropertyInfoMatch[1];
    const pool = createPool();
    
    try {
      const {
        category,
        type,
        title,
        description,
        instructions,
        icon,
        url,
        display_order,
        is_active,
        metadata
      } = req.body;
      
      const result = await pool.query(
        `UPDATE property_information 
         SET category = $1, type = $2, title = $3, description = $4, instructions = $5,
             icon = $6, url = $7, display_order = $8, is_active = $9, metadata = $10,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $11
         RETURNING *`,
        [category, type, title, description, instructions, icon, url, display_order, is_active, metadata, infoId]
      );
      
      await pool.end();
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Property information not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Property information update error:', error);
      await pool.end();
      
      return res.status(500).json({
        success: false,
        message: 'Failed to update property information'
      });
    }
  }
  
  // Delete property information - DELETE /api/property-info/:id
  if (updatePropertyInfoMatch && method === 'DELETE') {
    const infoId = updatePropertyInfoMatch[1];
    const pool = createPool();
    
    try {
      const result = await pool.query(
        'DELETE FROM property_information WHERE id = $1 RETURNING *',
        [infoId]
      );
      
      await pool.end();
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Property information not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Property information deleted successfully'
      });
    } catch (error) {
      console.error('Property information delete error:', error);
      await pool.end();
      
      return res.status(500).json({
        success: false,
        message: 'Failed to delete property information'
      });
    }
  }
  
  // Update property information order - PUT /api/property-info/order
  if (pathname === '/api/property-info/order' && method === 'PUT') {
    const pool = createPool();
    
    try {
      const { items } = req.body;
      
      if (!items || !Array.isArray(items)) {
        await pool.end();
        return res.status(400).json({
          success: false,
          message: 'Items array is required'
        });
      }
      
      // Update each item's display_order
      for (let i = 0; i < items.length; i++) {
        await pool.query(
          'UPDATE property_information SET display_order = $1 WHERE id = $2',
          [i, items[i].id]
        );
      }
      
      await pool.end();
      
      return res.status(200).json({
        success: true,
        message: 'Order updated successfully'
      });
    } catch (error) {
      console.error('Property information order update error:', error);
      await pool.end();
      
      return res.status(500).json({
        success: false,
        message: 'Failed to update order'
      });
    }
  }
  
  // Test device notification - POST /api/notifications/devices/:id/test-notify
  const testNotifyMatch = pathname.match(/^\/api\/notifications\/devices\/([^\/]+)\/test-notify$/);
  if (testNotifyMatch && method === 'POST') {
    const deviceId = testNotifyMatch[1];
    const pool = createPool();
    
    try {
      // Get device details
      const deviceResult = await pool.query(
        'SELECT * FROM devices WHERE id = $1',
        [deviceId]
      );
      
      if (deviceResult.rows.length === 0) {
        await pool.end();
        return res.status(404).json({
          success: false,
          message: 'Device not found'
        });
      }
      
      const device = deviceResult.rows[0];
      
      // Create a test notification/alert
      await pool.query(`
        INSERT INTO mdm_alerts (
          device_id, property_id, alert_type, severity, 
          title, message, is_resolved, created_at
        ) VALUES (
          $1, $2, 'test_notification', 'info',
          'Test Notification', 
          'This is a test notification sent from MDM Dashboard',
          false, CURRENT_TIMESTAMP
        )
      `, [deviceId, device.property_id]);
      
      // Here you would normally send an actual push notification
      // For now, we'll just simulate success
      
      await pool.end();
      
      return res.status(200).json({
        success: true,
        message: 'Test notification sent successfully',
        device: {
          id: device.id,
          name: device.device_name,
          type: device.device_type
        }
      });
      
    } catch (error) {
      console.error('Test notification error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Failed to send test notification',
        error: error.message
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
  
  // Proxy endpoint for fetching external images - /api/proxy/image
  if (pathname === '/api/proxy/image' && method === 'GET') {
    try {
      const authHeader = req.headers['authorization'];
      if (!authHeader) {
        return res.status(401).json({
          success: false,
          message: 'No token provided'
        });
      }
      
      const token = authHeader.replace('Bearer ', '');
      
      try {
        jwt.verify(token, process.env.JWT_SECRET || 'default-secret-for-dev');
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      }
      
      const { url } = req.query;
      
      if (!url) {
        return res.status(400).json({
          success: false,
          message: 'URL parameter is required'
        });
      }
      
      // Validate URL format
      try {
        new URL(url);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid URL format'
        });
      }
      
      // Log the URL being fetched
      console.log('Proxying image from:', url);
      
      // Fetch the image from the external URL with better headers
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
          'Referer': 'https://hospitalityapp.chaletmoments.com/'
        },
        redirect: 'follow'
      });
      
      if (!response.ok) {
        console.error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        console.error('URL:', url);
        return res.status(response.status).json({
          success: false,
          message: `Failed to fetch image: ${response.status} ${response.statusText}`,
          url: url
        });
      }
      
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);
      
      // Validate that it's an image (be more permissive)
      if (contentType && !contentType.startsWith('image/') && !contentType.includes('octet-stream')) {
        console.error('Invalid content type:', contentType);
        return res.status(400).json({
          success: false,
          message: 'URL does not point to an image',
          contentType: contentType
        });
      }
      
      // Get the image buffer
      const buffer = await response.arrayBuffer();
      
      // Set appropriate headers
      res.setHeader('Content-Type', contentType || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
      res.setHeader('Access-Control-Allow-Origin', '*');
      
      // Send the image
      return res.send(Buffer.from(buffer));
      
    } catch (error) {
      console.error('Error proxying image:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch image',
        error: error.message
      });
    }
  }
  
  // Check image endpoint - /api/check-image
  if (pathname === '/api/check-image' && method === 'POST') {
    try {
      const authHeader = req.headers['authorization'];
      if (!authHeader) {
        return res.status(401).json({
          success: false,
          message: 'No token provided'
        });
      }
      
      const token = authHeader.replace('Bearer ', '');
      
      try {
        jwt.verify(token, process.env.JWT_SECRET || 'default-secret-for-dev');
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      }
      
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({
          success: false,
          message: 'URL is required'
        });
      }
      
      // Validate URL format
      try {
        new URL(url);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid URL format'
        });
      }
      
      // Try to fetch the image headers
      const response = await fetch(url, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; VacationRentalBot/1.0)',
        },
        timeout: 5000, // 5 second timeout
      });
      
      const contentType = response.headers.get('content-type');
      const isImage = contentType && contentType.startsWith('image/');
      
      return res.json({
        success: true,
        data: {
          accessible: response.ok,
          isImage: isImage,
          contentType: contentType,
          statusCode: response.status,
          proxiedUrl: response.ok && isImage ? `/api/proxy/image?url=${encodeURIComponent(url)}` : null
        }
      });
      
    } catch (error) {
      console.error('Error checking image:', error);
      return res.json({
        success: false,
        data: {
          accessible: false,
          isImage: false,
          error: error.message
        }
      });
    }
  }
  
  // Default 404
  return res.status(404).json({
    success: false,
    message: `Not Found - ${pathname}`
  });
  } catch (error) {
    console.error('Handler error:', error);
    // Ensure CORS headers are set even on error
    if (!res.headersSent) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
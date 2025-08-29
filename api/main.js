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

// Vercel configuration for body parsing
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4.5mb',
    },
  },
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
      version: '2.0.0'
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
      
      console.log('Uploaded to Vercel Blob:', blob.url);
      
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
      
      // Fetch the image from the external URL
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; VacationRentalBot/1.0)',
        },
        timeout: 10000, // 10 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      
      // Validate that it's an image
      if (!contentType || !contentType.startsWith('image/')) {
        return res.status(400).json({
          success: false,
          message: 'URL does not point to an image'
        });
      }
      
      // Get the image buffer
      const buffer = await response.arrayBuffer();
      
      // Set appropriate headers
      res.setHeader('Content-Type', contentType);
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
}
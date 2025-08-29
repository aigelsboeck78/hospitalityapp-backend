import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import pg from 'pg';

const { Pool } = pg;

// CORS headers
const setCorsHeaders = (res, origin) => {
  const allowedOrigins = [
    'https://hospitalityapp.chaletmoments.com',
    'https://hospitalityapp-frontend.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ];
  
  if (origin && allowedOrigins.some(allowed => origin.startsWith(allowed))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
};

// Database connection
const createPool = () => {
  const connectionString = process.env.POSTGRES_PRISMA_URL || 
                           process.env.POSTGRES_URL || 
                           process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('Database configuration error');
  }
  
  const isSupabase = connectionString && connectionString.includes('supabase.com');
  let sslConfig = false;
  
  if (isSupabase || connectionString.includes('sslmode=require') || process.env.NODE_ENV === 'production') {
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
    max: 1
  });
};

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'default-secret-for-dev', {
    expiresIn: '24h'
  });
};

export default async function handler(req, res) {
  const { url, method } = req;
  const origin = req.headers.origin || req.headers.Origin;
  
  // Set CORS headers immediately
  setCorsHeaders(res, origin);
  
  // Handle OPTIONS
  if (method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const pathname = url.split('?')[0];
  const authPath = pathname.replace('/api/auth/', '');
  
  // Login endpoint
  if (authPath === 'login' && method === 'POST') {
    const pool = createPool();
    
    try {
      const { username, password, email } = req.body;
      
      // Allow login with either username or email
      let query;
      let params;
      
      if (email) {
        query = 'SELECT * FROM users WHERE email = $1';
        params = [email];
      } else {
        query = 'SELECT * FROM users WHERE username = $1';
        params = [username];
      }
      
      const result = await pool.query(query, params);
      await pool.end();
      
      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
      
      const user = result.rows[0];
      
      // Check password
      const validPassword = await bcrypt.compare(password, user.password_hash);
      
      if (!validPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
      
      // Generate token
      const token = generateToken({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      });
      
      // Return user data without password
      delete user.password_hash;
      
      return res.status(200).json({
        success: true,
        token,
        user
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
  
  // Register endpoint
  if (authPath === 'register' && method === 'POST') {
    const pool = createPool();
    
    try {
      const { username, email, password, role = 'guest' } = req.body;
      
      // Check if user already exists
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE username = $1 OR email = $2',
        [username, email]
      );
      
      if (existingUser.rows.length > 0) {
        await pool.end();
        return res.status(400).json({
          success: false,
          message: 'User already exists'
        });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const result = await pool.query(
        `INSERT INTO users (username, email, password_hash, role) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, username, email, role, created_at`,
        [username, email, hashedPassword, role]
      );
      
      await pool.end();
      
      const user = result.rows[0];
      
      // Generate token
      const token = generateToken({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      });
      
      return res.status(201).json({
        success: true,
        token,
        user
      });
    } catch (error) {
      console.error('Registration error:', error);
      await pool.end();
      return res.status(500).json({
        success: false,
        message: 'Registration failed'
      });
    }
  }
  
  // Verify endpoint
  if (authPath === 'verify' && method === 'GET') {
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
        user: decoded
      });
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  }
  
  // Default 404
  return res.status(404).json({
    success: false,
    message: `Auth endpoint not found: ${authPath}`
  });
}
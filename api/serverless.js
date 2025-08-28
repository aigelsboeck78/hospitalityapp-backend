import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import pg from 'pg';

// Load environment variables
dotenv.config();

const app = express();

// Database pool configuration
const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
const allowedOrigins = [
  'https://hospitalityapp.chaletmoments.com',
  'https://hospitalityapp-frontend.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173'
];

app.use(cors({
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
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Helper function to generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '2.0.0'
  });
});

// Auth login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Simple hardcoded admin credentials for demo
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const token = generateToken({
        id: 'admin',
        username: ADMIN_USERNAME,
        role: 'admin'
      });
      
      res.json({
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
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Properties endpoint
app.get('/api/properties', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM properties ORDER BY created_at DESC');
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Properties fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch properties'
    });
  }
});

// Guests endpoint
app.get('/api/guests', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM guests ORDER BY created_at DESC');
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Guests fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch guests'
    });
  }
});

// Activities endpoint
app.get('/api/activities', async (req, res) => {
  try {
    const { property_id } = req.query;
    let query = 'SELECT * FROM activities';
    let params = [];
    
    if (property_id) {
      query += ' WHERE property_id = $1';
      params.push(property_id);
    }
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Activities fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities'
    });
  }
});

// Events endpoint
app.get('/api/events', async (req, res) => {
  try {
    const { property_id } = req.query;
    let query = 'SELECT * FROM events';
    let params = [];
    
    if (property_id) {
      query += ' WHERE property_id = $1';
      params.push(property_id);
    }
    query += ' ORDER BY date DESC';
    
    const result = await pool.query(query, params);
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Events fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events'
    });
  }
});

// Dining endpoint
app.get('/api/dining', async (req, res) => {
  try {
    const { property_id } = req.query;
    let query = 'SELECT * FROM dining';
    let params = [];
    
    if (property_id) {
      query += ' WHERE property_id = $1';
      params.push(property_id);
    }
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Dining fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dining'
    });
  }
});

// Shop products endpoint
app.get('/api/shop/products', async (req, res) => {
  try {
    const { property_id } = req.query;
    let query = 'SELECT * FROM shop_products';
    let params = [];
    
    if (property_id) {
      query += ' WHERE property_id = $1';
      params.push(property_id);
    }
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Shop products fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shop products'
    });
  }
});

// Streaming services endpoint
app.get('/api/streaming-services', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM streaming_services ORDER BY name');
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Streaming services fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch streaming services'
    });
  }
});

// Settings endpoint
app.get('/api/settings', async (req, res) => {
  try {
    const { property_id } = req.query;
    
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
    
    res.json({
      success: true,
      data: result.rows[0] || {}
    });
  } catch (error) {
    console.error('Settings fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings'
    });
  }
});

// Root endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Hospitality App Backend API',
    version: '2.0.0',
    endpoints: [
      '/api/health',
      '/api/auth',
      '/api/properties',
      '/api/guests',
      '/api/activities',
      '/api/dining',
      '/api/events',
      '/api/streaming-services',
      '/api/shop',
      '/api/settings'
    ]
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Not Found - ${req.originalUrl}`
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Export for Vercel
export default app;
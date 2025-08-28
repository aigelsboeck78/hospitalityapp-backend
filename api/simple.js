// Minimal API endpoint using CommonJS for Vercel
const cors = require('cors');

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

module.exports = (req, res) => {
  // Apply CORS
  corsMiddleware(req, res, () => {
    // Parse URL
    const url = req.url;
    
    // Health check
    if (url === '/api/health') {
      return res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '2.0.0'
      });
    }
    
    // Login endpoint
    if (url === '/api/auth/login' && req.method === 'POST') {
      const { username, password } = req.body || {};
      
      const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
      const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
      
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Simple token generation without JWT for now
        const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
        
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
    }
    
    // Root API endpoint
    if (url === '/api' || url === '/api/') {
      return res.status(200).json({
        name: 'Hospitality App Backend API',
        version: '2.0.0',
        endpoints: ['/api/health', '/api/auth/login']
      });
    }
    
    // 404
    res.status(404).json({
      success: false,
      message: `Not Found - ${url}`
    });
  });
};
import express from 'express';
import jwt from 'jsonwebtoken';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

// Simple admin login endpoint
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Simple hardcoded admin credentials for demo
  // In production, use proper user authentication with hashed passwords
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
});

// Token verification endpoint
router.get('/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({
      success: true,
      data: decoded
    });
  } catch (error) {
    res.status(403).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

export default router;
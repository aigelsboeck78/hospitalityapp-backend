import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import routes
import authRoutes from '../src/routes/auth.js';
import propertyRoutes from '../src/routes/properties.js';
import guestRoutes from '../src/routes/guests.js';
import activityRoutes from '../src/routes/activities.js';
import streamingRoutes from '../src/routes/streaming.js';
import mediaRoutes from '../src/routes/media.js';
import settingsRoutes from '../src/routes/settings.js';
import recommendationsRoutes from '../src/routes/recommendations.js';
import shopRoutes from '../src/routes/shop.js';
import tvosRoutes from '../src/routes/tvos.js';
import eventRoutes from '../src/routes/events.js';
import diningRoutes from '../src/routes/dining.js';
import propertyInfoRoutes from '../src/routes/propertyInfo.js';
import deviceRoutes from '../src/routes/devices.js';
import mdmRoutes from '../src/routes/mdmRoutes.js';
import configurationProfileRoutes from '../src/routes/configurationProfiles.js';
import pushNotificationRoutes from '../src/routes/pushNotifications.js';
import kioskPresetRoutes from '../src/routes/kioskPresets.js';
import scoringRoutes from '../src/routes/scoring.js';

// Import middleware
import { errorHandler, notFound } from '../src/middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ["http://localhost:3000"];

app.use(cors({
  origin: corsOrigins,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '2.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/streaming', streamingRoutes);
app.use('/api/streaming-services', streamingRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/tvos', tvosRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/dining', diningRoutes);
app.use('/api/property-info', propertyInfoRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/mdm', mdmRoutes);
app.use('/api/configuration-profiles', configurationProfileRoutes);
app.use('/api/push-notifications', pushNotificationRoutes);
app.use('/api/kiosk-presets', kioskPresetRoutes);
app.use('/api/scoring', scoringRoutes);

// Cleanup endpoint (manual trigger for Vercel)
app.post('/api/cleanup/trigger', async (req, res) => {
  // Note: Cleanup service runs as scheduled function in Vercel
  res.json({ message: 'Cleanup triggered via scheduled function' });
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
      '/api/streaming',
      '/api/shop',
      '/api/tvos'
    ]
  });
});

// 404 handler
app.use(notFound);

// Error handling
app.use(errorHandler);

// Export for Vercel
export default app;
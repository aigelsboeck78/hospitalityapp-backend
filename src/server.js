import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.js';
import propertyRoutes from './routes/properties.js';
import guestRoutes from './routes/guests.js';
import activityRoutes from './routes/activities.js';
import streamingRoutes from './routes/streaming.js';
import mediaRoutes from './routes/media.js';
import settingsRoutes from './routes/settings.js';
import recommendationsRoutes from './routes/recommendations.js';
import shopRoutes from './routes/shop.js';
import tvosRoutes from './routes/tvos.js';
import eventRoutes from './routes/events.js';
import diningRoutes from './routes/dining.js';
import propertyInfoRoutes from './routes/propertyInfo.js';
import deviceRoutes from './routes/devices.js';
import mdmRoutes from './routes/mdmRoutes.js';
import configurationProfileRoutes from './routes/configurationProfiles.js';
import pushNotificationRoutes from './routes/pushNotifications.js';
import kioskPresetRoutes from './routes/kioskPresets.js';
import scoringRoutes from './routes/scoring.js';

// Import middleware
import { errorHandler, notFound, logger } from './middleware/errorHandler.js';

// Import services
import cleanupService from './services/cleanupService.js';
import cronService from './services/cronService.js';
import mdmService from './services/mdmService.js';
import pushNotificationService from './services/pushNotificationService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// CORS origins configuration (needed early for Socket.IO)
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ["http://localhost:3000"];

const allowedOrigins = [
  ...corsOrigins,
  'https://hospitalityapp.chaletmoments.com',
  'https://hospitalityapp-frontend.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173'
];

const uniqueOrigins = [...new Set(allowedOrigins)];

// Initialize Socket.IO
export const io = new Server(server, {
  cors: {
    origin: uniqueOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Security middleware with relaxed CSP for images
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      fontSrc: ["'self'", "https:", "data:"],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
      imgSrc: ["'self'", "data:", "http://localhost:3001", "http://localhost:3000", "http://localhost:3004"],
      objectSrc: ["'none'"],
      scriptSrc: ["'self'"],
      scriptSrcAttr: ["'none'"],
      styleSrc: ["'self'", "https:", "'unsafe-inline'"],
      upgradeInsecureRequests: [],
    },
  },
}));

// CORS middleware using pre-defined origins
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (uniqueOrigins.some(allowed => origin.startsWith(allowed))) {
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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Static file serving for uploads with CORS headers
app.use('/uploads', (req, res, next) => {
  const origin = req.get('Origin');
  if (corsOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(uploadsDir));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    cleanup_service: cleanupService.getStatus()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/streaming-services', streamingRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/dining', diningRoutes);
app.use('/api', propertyInfoRoutes);
app.use('/api', deviceRoutes);
app.use('/api', mediaRoutes);
app.use('/api/mdm', mdmRoutes);
app.use('/api/mdm', configurationProfileRoutes);
app.use('/api/mdm/kiosk', kioskPresetRoutes);
app.use('/api/notifications', pushNotificationRoutes);
app.use('/api/scoring', scoringRoutes);

// tvOS API routes (with API key authentication)
app.use('/api/tvos', tvosRoutes);

// Cleanup service control endpoints (for testing/admin)
app.get('/api/cleanup/status', (req, res) => {
  res.json({
    success: true,
    data: cleanupService.getStatus()
  });
});

app.post('/api/cleanup/force', async (req, res) => {
  try {
    await cleanupService.forceCleanup();
    res.json({
      success: true,
      message: 'Cleanup forced successfully'
    });
  } catch (error) {
    logger.error('Force cleanup failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to force cleanup',
      error: error.message
    });
  }
});

app.post('/api/cleanup/manual/:guestId?', async (req, res) => {
  try {
    const { guestId } = req.params;
    const result = await cleanupService.runManualCleanup(guestId);
    res.json({
      success: true,
      data: result,
      message: 'Manual cleanup completed successfully'
    });
  } catch (error) {
    logger.error('Manual cleanup failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to run manual cleanup',
      error: error.message
    });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  // Join property-specific room
  socket.on('join_property', (propertyId) => {
    socket.join(`property:${propertyId}`);
    logger.info(`Client ${socket.id} joined property room: ${propertyId}`);
    
    socket.emit('joined_property', {
      propertyId,
      timestamp: new Date().toISOString()
    });
  });
  
  // Leave property room
  socket.on('leave_property', (propertyId) => {
    socket.leave(`property:${propertyId}`);
    logger.info(`Client ${socket.id} left property room: ${propertyId}`);
  });
  
  // Device registration (for tvOS apps)
  socket.on('register_device', async (data) => {
    const { propertyId, deviceId, deviceType, deviceIdentifier } = data;
    socket.join(`property:${propertyId}`);
    socket.join(`device:${deviceId}`);
    if (deviceIdentifier) {
      socket.join(`device:${deviceIdentifier}`);
    }
    
    logger.info(`Device registered: ${deviceId} for property ${propertyId}`);
    
    // Register WebSocket connection for push notifications
    if (deviceId) {
      pushNotificationService.registerDeviceConnection(deviceId, socket);
    }
    
    socket.emit('device_registered', {
      deviceId,
      propertyId,
      timestamp: new Date().toISOString()
    });
  });
  
  // Handle device heartbeat
  socket.on('heartbeat', (data) => {
    socket.emit('heartbeat_ack', {
      timestamp: new Date().toISOString()
    });
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
    
    // Unregister from push notification service
    // Note: In production, you'd want to track which device this socket belongs to
    // For now, we'll just log it
  });
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`CORS Origin: ${process.env.CORS_ORIGIN}`);
  
  // Start services
  cleanupService.start();
  
  // Start MDM service
  mdmService.setSocketIO(io);
  mdmService.startCommandProcessor(5000); // Process commands every 5 seconds
  
  // Start cron jobs
  cronService.startEventScrapingJob();
  cronService.startAllJobs();
  
  // Start MDM monitoring (every 5 minutes)
  setInterval(() => {
    mdmService.monitorDeviceHealth();
  }, 5 * 60 * 1000);
  
  // Clean up old MDM data daily
  setInterval(() => {
    mdmService.cleanupOldData(30);
    pushNotificationService.cleanupOldNotifications(7);
  }, 24 * 60 * 60 * 1000);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  cronService.stopAllJobs();
  mdmService.stopCommandProcessor();
  server.close(() => {
    logger.info('Process terminated');
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  cronService.stopAllJobs();
  mdmService.stopCommandProcessor();
  server.close(() => {
    logger.info('Process terminated');
  });
});

export default app;
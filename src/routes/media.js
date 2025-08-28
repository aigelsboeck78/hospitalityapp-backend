import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import { authenticateToken } from '../middleware/auth.js';
import { logger } from '../middleware/errorHandler.js';
import pool from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Upload single image
router.post('/upload/image', authenticateToken, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    
    logger.info(`Image uploaded: ${req.file.filename}`);
    
    res.json({
      success: true,
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        url: imageUrl,
        size: req.file.size
      }
    });
  } catch (error) {
    logger.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message
    });
  }
});

// Get all background images for property
router.get('/property/:propertyId/backgrounds', authenticateToken, async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { season } = req.query;
    
    // Fetch from database
    let query = `
      SELECT 
        id,
        filename,
        COALESCE(image_url, file_path, '/uploads/backgrounds/' || property_id || '/' || filename) as url,
        title,
        description,
        season,
        display_order,
        upload_date as uploadedAt,
        is_active
      FROM background_images 
      WHERE property_id = $1 
      AND is_active = true
    `;
    
    const queryParams = [propertyId];
    
    if (season) {
      query += ` AND (season = $2 OR season = 'all')`;
      queryParams.push(season);
    }
    
    query += ` ORDER BY display_order ASC, upload_date DESC`;
    
    const result = await pool.query(query, queryParams);
    
    // Get the host from request headers
    const protocol = req.protocol || 'http';
    const host = req.get('host') || 'localhost:3001';
    const baseUrl = `${protocol}://${host}`;
    
    res.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        filename: row.filename,
        url: row.url.startsWith('http') ? row.url : `${baseUrl}${row.url}`,
        title: row.title,
        description: row.description,
        season: row.season || 'all',
        displayOrder: row.display_order,
        uploadedAt: row.uploadedat
      }))
    });
  } catch (error) {
    logger.error('Error fetching background images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch background images',
      error: error.message
    });
  }
});

// Upload background image for property
router.post('/property/:propertyId/backgrounds', authenticateToken, (req, res) => {
  const { propertyId } = req.params;
  const backgroundsDir = path.join(__dirname, '../../uploads/backgrounds', propertyId);
  
  if (!fs.existsSync(backgroundsDir)) {
    fs.mkdirSync(backgroundsDir, { recursive: true });
  }
  
  const backgroundStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, backgroundsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'bg-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
  
  const backgroundUpload = multer({
    storage: backgroundStorage,
    limits: {
      fileSize: 15 * 1024 * 1024 // 15MB limit for background images
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    }
  });
  
  backgroundUpload.single('background')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No background image file provided'
      });
    }
    
    try {
      const imageUrl = `/uploads/backgrounds/${propertyId}/${req.file.filename}`;
      const season = req.body.season || 'all';
      
      // Save to database
      const insertQuery = `
        INSERT INTO background_images (property_id, filename, file_path, image_url, season, upload_type, is_active)
        VALUES ($1, $2, $3, $4, $5, 'upload', true)
        RETURNING id, filename, image_url as url, season, upload_date as uploadedAt
      `;
      
      const result = await pool.query(insertQuery, [
        propertyId,
        req.file.filename,
        imageUrl,
        imageUrl,
        season
      ]);
      
      logger.info(`Background image uploaded for property ${propertyId}: ${req.file.filename} (season: ${season})`);
      
      res.json({
        success: true,
        data: {
          id: result.rows[0].id,
          filename: result.rows[0].filename,
          originalName: req.file.originalname,
          url: result.rows[0].url,
          season: result.rows[0].season,
          uploadedAt: result.rows[0].uploadedat,
          size: req.file.size
        }
      });
    } catch (error) {
      logger.error('Error saving background image to database:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to save background image',
        error: error.message
      });
    }
  });
});

// Update background image season
router.patch('/property/:propertyId/backgrounds/:imageId/season', authenticateToken, async (req, res) => {
  try {
    const { propertyId, imageId } = req.params;
    const { season } = req.body;
    
    const updateQuery = `
      UPDATE background_images 
      SET season = $1, updated_at = NOW()
      WHERE id = $2 AND property_id = $3
      RETURNING id, season
    `;
    
    const result = await pool.query(updateQuery, [season, imageId, propertyId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Background image not found'
      });
    }
    
    logger.info(`Background image season updated for property ${propertyId}: image ${imageId} to ${season}`);
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error updating background image season:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update background image season',
      error: error.message
    });
  }
});

// Delete background image
router.delete('/property/:propertyId/backgrounds/:filename', authenticateToken, async (req, res) => {
  try {
    const { propertyId, filename } = req.params;
    
    // First, delete from database
    const deleteQuery = `
      DELETE FROM background_images 
      WHERE property_id = $1 AND filename = $2
      RETURNING id, upload_type
    `;
    
    const result = await pool.query(deleteQuery, [propertyId, filename]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Background image not found in database'
      });
    }
    
    // If it was an uploaded file (not URL), try to delete the physical file
    if (result.rows[0].upload_type === 'upload') {
      const filePath = path.join(__dirname, '../../uploads/backgrounds', propertyId, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger.info(`Background image file deleted: ${filename} for property ${propertyId}`);
      }
    } else {
      logger.info(`Background image URL entry deleted: ${filename} for property ${propertyId}`);
    }
    
    res.json({
      success: true,
      message: 'Background image deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting background image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete background image',
      error: error.message
    });
  }
});

// Proxy endpoint for fetching external images
router.get('/proxy/image', authenticateToken, async (req, res) => {
  try {
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
    
    logger.info(`Proxying image request for: ${url}`);
    
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
    const buffer = await response.buffer();
    
    // Set appropriate headers
    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    res.set('Access-Control-Allow-Origin', '*');
    
    // Send the image
    res.send(buffer);
    
  } catch (error) {
    logger.error('Error proxying image:', error);
    
    // Return a generic error response
    res.status(500).json({
      success: false,
      message: 'Failed to fetch image',
      error: error.message
    });
  }
});

// Check if an external image is accessible
router.post('/check-image', authenticateToken, async (req, res) => {
  try {
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
    
    res.json({
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
    logger.error('Error checking image:', error);
    res.json({
      success: false,
      data: {
        accessible: false,
        isImage: false,
        error: error.message
      }
    });
  }
});

export default router;
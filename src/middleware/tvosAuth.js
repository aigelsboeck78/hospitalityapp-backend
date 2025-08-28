import { logger } from './errorHandler.js';

// Simple middleware to validate tvOS API key
export const validateTVOSKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization'];
  
  // For now, we'll accept any request from tvOS
  // In production, you should validate against a real API key
  if (!apiKey) {
    logger.warn('tvOS request without API key');
    // Allow anyway for development
  }
  
  next();
};

export default validateTVOSKey;
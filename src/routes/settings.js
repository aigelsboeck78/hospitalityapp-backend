import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { logger } from '../middleware/errorHandler.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Default settings
const defaultSettings = {
  // Branding Settings
  company_name: 'ChaletMoments',
  logo_url: '',
  brand_color_primary: '#2563eb',
  brand_color_secondary: '#1e40af',
  brand_color_accent: '#3b82f6',
  default_background_url: '',
  
  // TV App Settings
  tv_app_name: 'Hospitality Hub',
  tv_app_tagline: 'Welcome to your digital concierge',
  show_weather: true,
  show_local_time: true,
  weather_location: 'Schladming, Austria',
  timezone: 'Europe/Vienna',
  
  // Display Settings
  screen_timeout_minutes: 30,
  auto_return_home_minutes: 5,
  theme_mode: 'auto',
  font_size: 'medium',
  
  // Feature Settings
  enable_activities: true,
  enable_streaming: true,
  enable_room_service: false,
  enable_concierge_chat: false,
  enable_local_recommendations: true,
  enable_weather_widget: true,
  
  // Guest Privacy Settings
  require_guest_registration: false,
  collect_guest_preferences: true,
  data_retention_days: 30,
  
  // Notification Settings
  enable_push_notifications: true,
  welcome_message_enabled: true,
  checkout_reminder_hours: 2,
  maintenance_notifications: true,
  
  // Contact Information
  property_phone: '',
  property_email: '',
  emergency_contact: '',
  front_desk_hours: '24/7',
  
  // Integration Settings
  google_analytics_id: '',
  custom_css: '',
  api_rate_limit: 1000
};

// Settings file path
const settingsPath = path.join(__dirname, '../../data/settings.json');

// Ensure data directory exists
const dataDir = path.dirname(settingsPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Load settings from file
const loadSettings = () => {
  try {
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      return { ...defaultSettings, ...JSON.parse(data) };
    }
    return defaultSettings;
  } catch (error) {
    logger.error('Error loading settings:', error);
    return defaultSettings;
  }
};

// Save settings to file
const saveSettings = (settings) => {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    return true;
  } catch (error) {
    logger.error('Error saving settings:', error);
    return false;
  }
};

// Get all settings
router.get('/', authenticateToken, (req, res) => {
  try {
    const settings = loadSettings();
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    logger.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
      error: error.message
    });
  }
});

// Update settings
router.put('/', authenticateToken, (req, res) => {
  try {
    const currentSettings = loadSettings();
    const updatedSettings = { ...currentSettings, ...req.body };
    
    // Validate certain settings
    if (updatedSettings.screen_timeout_minutes < 5 || updatedSettings.screen_timeout_minutes > 120) {
      return res.status(400).json({
        success: false,
        message: 'Screen timeout must be between 5 and 120 minutes'
      });
    }
    
    if (updatedSettings.auto_return_home_minutes < 1 || updatedSettings.auto_return_home_minutes > 30) {
      return res.status(400).json({
        success: false,
        message: 'Auto return home timeout must be between 1 and 30 minutes'
      });
    }
    
    if (updatedSettings.data_retention_days < 7 || updatedSettings.data_retention_days > 365) {
      return res.status(400).json({
        success: false,
        message: 'Data retention period must be between 7 and 365 days'
      });
    }
    
    // Save settings
    const success = saveSettings(updatedSettings);
    
    if (success) {
      logger.info('Settings updated successfully');
      
      res.json({
        success: true,
        data: updatedSettings,
        message: 'Settings updated successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to save settings'
      });
    }
  } catch (error) {
    logger.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: error.message
    });
  }
});

// Get specific setting
router.get('/:key', authenticateToken, (req, res) => {
  try {
    const { key } = req.params;
    const settings = loadSettings();
    
    if (key in settings) {
      res.json({
        success: true,
        data: {
          key,
          value: settings[key]
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }
  } catch (error) {
    logger.error('Error fetching setting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch setting',
      error: error.message
    });
  }
});

// Update specific setting
router.put('/:key', authenticateToken, (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    const currentSettings = loadSettings();
    
    if (!(key in defaultSettings)) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }
    
    currentSettings[key] = value;
    
    const success = saveSettings(currentSettings);
    
    if (success) {
      logger.info(`Setting ${key} updated successfully`);
      
      res.json({
        success: true,
        data: {
          key,
          value: currentSettings[key]
        },
        message: 'Setting updated successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to save setting'
      });
    }
  } catch (error) {
    logger.error('Error updating setting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update setting',
      error: error.message
    });
  }
});

// Reset settings to defaults
router.post('/reset', authenticateToken, (req, res) => {
  try {
    const success = saveSettings(defaultSettings);
    
    if (success) {
      logger.info('Settings reset to defaults');
      
      res.json({
        success: true,
        data: defaultSettings,
        message: 'Settings reset to defaults successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to reset settings'
      });
    }
  } catch (error) {
    logger.error('Error resetting settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset settings',
      error: error.message
    });
  }
});

// Export settings as JSON
router.get('/export/json', authenticateToken, (req, res) => {
  try {
    const settings = loadSettings();
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="hospitality-settings-${new Date().toISOString().split('T')[0]}.json"`);
    
    res.json(settings);
  } catch (error) {
    logger.error('Error exporting settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export settings',
      error: error.message
    });
  }
});

// Import settings from JSON
router.post('/import/json', authenticateToken, (req, res) => {
  try {
    const importedSettings = req.body;
    
    // Validate imported settings structure
    const validKeys = Object.keys(defaultSettings);
    const importedKeys = Object.keys(importedSettings);
    
    const invalidKeys = importedKeys.filter(key => !validKeys.includes(key));
    if (invalidKeys.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid settings keys: ${invalidKeys.join(', ')}`
      });
    }
    
    // Merge with current settings
    const currentSettings = loadSettings();
    const mergedSettings = { ...currentSettings, ...importedSettings };
    
    const success = saveSettings(mergedSettings);
    
    if (success) {
      logger.info('Settings imported successfully');
      
      res.json({
        success: true,
        data: mergedSettings,
        message: 'Settings imported successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to save imported settings'
      });
    }
  } catch (error) {
    logger.error('Error importing settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import settings',
      error: error.message
    });
  }
});

export default router;
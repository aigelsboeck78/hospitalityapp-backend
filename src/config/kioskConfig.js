// Centralized Kiosk Mode Configuration
// This file defines the default settings for kiosk mode across the system

export const KIOSK_CONFIG = {
    // The main app that serves as the home screen in kiosk mode
    // This is the app users return to after timeout or when pressing home
    HOME_APP: {
        bundleId: 'com.chaletmoments.hospitality',
        name: 'Chalet Moments Hospitality',
        description: 'Main hospitality app for guest services'
    },

    // Alternative home apps for different deployment scenarios
    ALTERNATE_HOME_APPS: {
        tvos: 'com.chaletmoments.hospitality',
        web: 'com.chaletmoments.web',
        test: 'com.apple.TVAppStore'  // For testing with App Store app
    },

    // Default kiosk mode settings
    DEFAULT_SETTINGS: {
        mode: 'autonomous',  // 'autonomous' or 'single'
        autoReturn: true,
        returnTimeout: 1800,  // 30 minutes in seconds
        disableHomeButton: false,
        disableVolumeButtons: false,
        disableSleepWakeButton: true
    },

    // Kiosk mode types
    MODES: {
        // Single App Mode - Only the home app is accessible
        SINGLE: {
            type: 'single',
            description: 'Locks device to single app only',
            allowedApps: []  // Only home app
        },

        // Autonomous Single App Mode - Home app plus allowed apps
        AUTONOMOUS: {
            type: 'autonomous',
            description: 'Home app with ability to open allowed apps',
            allowedApps: 'configurable'  // Set per device/property
        }
    },

    // tvOS specific MDM payload types
    PAYLOAD_TYPES: {
        SINGLE_APP: 'com.apple.tvos.singleappmode',
        AUTONOMOUS: 'com.apple.tvos.autonomoussingleappmode',
        APP_LOCK: 'com.apple.tvos.applock'
    }
};

// Helper function to get the appropriate home app
export function getHomeApp(platform = 'tvos') {
    if (platform === 'tvos') {
        return KIOSK_CONFIG.HOME_APP.bundleId;
    }
    return KIOSK_CONFIG.ALTERNATE_HOME_APPS[platform] || KIOSK_CONFIG.HOME_APP.bundleId;
}

// Helper function to check if an app is the home app
export function isHomeApp(bundleId) {
    return bundleId === KIOSK_CONFIG.HOME_APP.bundleId ||
           Object.values(KIOSK_CONFIG.ALTERNATE_HOME_APPS).includes(bundleId);
}

export default KIOSK_CONFIG;
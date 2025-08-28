import PropertyDevice from '../models/PropertyDevice.js';

export const getPropertyDevices = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const devices = await PropertyDevice.findByProperty(propertyId);

        res.json({
            success: true,
            data: devices
        });
    } catch (error) {
        console.error('Error fetching property devices:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch property devices'
        });
    }
};

export const getDevice = async (req, res) => {
    try {
        const { id } = req.params;
        const device = await PropertyDevice.findById(id);

        if (!device) {
            return res.status(404).json({
                success: false,
                error: 'Device not found'
            });
        }

        res.json({
            success: true,
            data: device
        });
    } catch (error) {
        console.error('Error fetching device:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch device'
        });
    }
};

export const createDevice = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const deviceData = {
            ...req.body,
            property_id: propertyId
        };

        const device = await PropertyDevice.create(deviceData);

        res.status(201).json({
            success: true,
            data: device
        });
    } catch (error) {
        console.error('Error creating device:', error);
        
        // Handle unique constraint violation
        if (error.code === '23505') {
            return res.status(409).json({
                success: false,
                error: 'A device with this identifier already exists'
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Failed to create device'
        });
    }
};

export const updateDevice = async (req, res) => {
    try {
        const { id } = req.params;
        const device = await PropertyDevice.update(id, req.body);

        if (!device) {
            return res.status(404).json({
                success: false,
                error: 'Device not found'
            });
        }

        res.json({
            success: true,
            data: device
        });
    } catch (error) {
        console.error('Error updating device:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update device'
        });
    }
};

export const deleteDevice = async (req, res) => {
    try {
        const { id } = req.params;
        const device = await PropertyDevice.delete(id);

        if (!device) {
            return res.status(404).json({
                success: false,
                error: 'Device not found'
            });
        }

        res.json({
            success: true,
            message: 'Device deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting device:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete device'
        });
    }
};

export const toggleDeviceActive = async (req, res) => {
    try {
        const { id } = req.params;
        const device = await PropertyDevice.toggleActive(id);

        if (!device) {
            return res.status(404).json({
                success: false,
                error: 'Device not found'
            });
        }

        res.json({
            success: true,
            data: device
        });
    } catch (error) {
        console.error('Error toggling device status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to toggle device status'
        });
    }
};

export const setPrimaryDevice = async (req, res) => {
    try {
        const { propertyId, deviceId } = req.params;
        const device = await PropertyDevice.setPrimary(propertyId, deviceId);

        if (!device) {
            return res.status(404).json({
                success: false,
                error: 'Device not found'
            });
        }

        res.json({
            success: true,
            data: device
        });
    } catch (error) {
        console.error('Error setting primary device:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to set primary device'
        });
    }
};

export const getDeviceHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 50 } = req.query;
        
        const history = await PropertyDevice.getConnectionHistory(id, parseInt(limit));

        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        console.error('Error fetching device history:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch device history'
        });
    }
};

// tvOS specific endpoints
export const registerDevice = async (req, res) => {
    try {
        const {
            property_id,
            identifier,
            device_name,
            serial_number,
            model,
            os_version,
            app_version,
            metadata
        } = req.body;

        if (!property_id || !identifier) {
            return res.status(400).json({
                success: false,
                error: 'property_id and identifier are required'
            });
        }

        const ipAddress = req.ip || req.connection.remoteAddress;
        
        const device = await PropertyDevice.registerDevice({
            property_id,
            identifier,
            device_name: device_name || 'Apple TV',
            serial_number,
            model,
            os_version,
            app_version,
            metadata
        }, ipAddress);

        res.json({
            success: true,
            data: device,
            message: 'Device registered successfully'
        });
    } catch (error) {
        console.error('Error registering device:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to register device'
        });
    }
};

export const validateDevice = async (req, res) => {
    try {
        const { identifier, propertyId } = req.params;
        
        const device = await PropertyDevice.validateDevice(identifier, propertyId);

        if (!device) {
            return res.status(404).json({
                success: false,
                error: 'Device not found or not authorized for this property'
            });
        }

        res.json({
            success: true,
            data: device,
            valid: true
        });
    } catch (error) {
        console.error('Error validating device:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to validate device'
        });
    }
};

export const heartbeat = async (req, res) => {
    try {
        const { identifier } = req.params;
        const { app_version, os_version } = req.body;
        
        const ipAddress = req.ip || req.connection.remoteAddress;
        
        const device = await PropertyDevice.updateConnection(
            identifier,
            ipAddress,
            app_version,
            os_version
        );

        if (!device) {
            return res.status(404).json({
                success: false,
                error: 'Device not found'
            });
        }

        res.json({
            success: true,
            data: {
                device_id: device.id,
                property_id: device.property_id,
                last_connected: device.last_connected
            }
        });
    } catch (error) {
        console.error('Error updating device heartbeat:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update device heartbeat'
        });
    }
};
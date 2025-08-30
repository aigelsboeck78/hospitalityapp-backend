#!/usr/bin/env node

/**
 * Cleanup Test Devices
 * Removes all test devices except the actual Apple TV
 */

import fetch from 'node-fetch';

const API_BASE_URL = 'https://hospitalityapp-backend.vercel.app';
const PROPERTY_ID = '41059600-402d-434e-9b34-2b4821f6e3a4';
const ACTUAL_DEVICE_ID = '00008110-000439023C63801E'; // Your actual Apple TV

async function cleanupTestDevices() {
    console.log('🧹 Cleaning up test devices...');
    console.log('═'.repeat(50));
    
    try {
        // Get all devices
        const response = await fetch(`${API_BASE_URL}/api/mdm/devices?property_id=${PROPERTY_ID}`);
        const result = await response.json();
        
        if (!result.success || !result.data) {
            console.error('Failed to fetch devices');
            return;
        }
        
        const devices = result.data;
        console.log(`\n📱 Found ${devices.length} total devices`);
        
        // Identify devices to delete
        const devicesToDelete = devices.filter(device => 
            device.identifier !== ACTUAL_DEVICE_ID
        );
        
        const actualDevice = devices.find(device => 
            device.identifier === ACTUAL_DEVICE_ID
        );
        
        console.log(`\n✅ Keeping actual Apple TV:`);
        if (actualDevice) {
            console.log(`   - ${actualDevice.device_name} (${actualDevice.identifier})`);
            console.log(`   - Serial: ${actualDevice.serial_number}`);
            console.log(`   - Status: ${actualDevice.computed_status}`);
        }
        
        console.log(`\n🗑️  Deleting ${devicesToDelete.length} test devices:`);
        
        for (const device of devicesToDelete) {
            console.log(`   - ${device.device_name} (${device.identifier})`);
            
            // Delete the device
            const deleteResponse = await fetch(`${API_BASE_URL}/api/devices/${device.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (deleteResponse.ok) {
                console.log(`     ✅ Deleted`);
            } else {
                console.log(`     ❌ Failed to delete`);
            }
        }
        
        // Verify cleanup
        console.log('\n🔍 Verifying cleanup...');
        const verifyResponse = await fetch(`${API_BASE_URL}/api/mdm/devices?property_id=${PROPERTY_ID}`);
        const verifyResult = await verifyResponse.json();
        
        if (verifyResult.success && verifyResult.data) {
            const remainingDevices = verifyResult.data;
            console.log(`\n📊 Remaining devices: ${remainingDevices.length}`);
            
            remainingDevices.forEach(device => {
                console.log(`   - ${device.device_name} (${device.identifier})`);
                console.log(`     Serial: ${device.serial_number}`);
                console.log(`     Status: ${device.computed_status}`);
            });
        }
        
        console.log('\n' + '═'.repeat(50));
        console.log('✨ Cleanup complete!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run cleanup
cleanupTestDevices().catch(console.error);
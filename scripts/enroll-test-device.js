#!/usr/bin/env node

/**
 * Device Enrollment Test Script
 * Enrolls a test Apple TV device in the MDM system
 */

import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';

const API_BASE_URL = 'https://hospitalityapp-backend.vercel.app';
const PROPERTY_ID = '41059600-402d-434e-9b34-2b4821f6e3a4'; // Chalet 20

async function enrollDevice() {
    console.log('🎯 Enrolling Test Apple TV Device...');
    console.log('═'.repeat(50));
    
    // Generate unique device identifiers
    const deviceId = uuidv4();
    const serialNumber = `TEST-${Date.now()}`;
    const enrollmentToken = uuidv4();
    
    const deviceData = {
        identifier: deviceId,
        property_id: PROPERTY_ID,
        device_name: 'Living Room Apple TV',
        device_type: 'apple_tv',
        model: 'Apple TV 4K (3rd generation)',
        os_version: '17.0',
        enrollment_token: enrollmentToken,
        serial_number: serialNumber
    };
    
    console.log('\n📱 Device Details:');
    console.log(`   Device ID: ${deviceId}`);
    console.log(`   Serial: ${serialNumber}`);
    console.log(`   Property: Chalet 20`);
    console.log(`   Model: ${deviceData.model}`);
    
    try {
        // Step 1: Enroll the device
        console.log('\n🔄 Enrolling device...');
        const enrollResponse = await fetch(`${API_BASE_URL}/api/mdm/enroll`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(deviceData)
        });
        
        const enrollResult = await enrollResponse.json();
        
        if (!enrollResponse.ok || !enrollResult.success) {
            throw new Error(enrollResult.message || 'Enrollment failed');
        }
        
        console.log('✅ Device enrolled successfully!');
        console.log(`   Device ID: ${enrollResult.device?.id || deviceId}`);
        
        // Step 2: Send initial heartbeat
        console.log('\n💓 Sending initial heartbeat...');
        const heartbeatData = {
            device_id: enrollResult.device?.id || deviceId,
            identifier: deviceId,
            status: 'online',
            battery_level: 100,
            storage_available: 10000000000, // 10GB
            storage_total: 32000000000, // 32GB
            current_app: 'com.chaletmoments.tvos',
            screen_status: 'on',
            kiosk_mode_active: false,
            network_status: 'wifi_connected',
            os_version: '17.0',
            app_version: '1.0.0',
            metadata: {
                enrolled_at: new Date().toISOString(),
                test_device: true
            }
        };
        
        const heartbeatResponse = await fetch(`${API_BASE_URL}/api/mdm/heartbeat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(heartbeatData)
        });
        
        const heartbeatResult = await heartbeatResponse.json();
        
        if (heartbeatResponse.ok && heartbeatResult.success) {
            console.log('✅ Heartbeat sent successfully!');
            
            // Check for any pending commands
            if (heartbeatResult.commands && heartbeatResult.commands.length > 0) {
                console.log(`📋 ${heartbeatResult.commands.length} pending command(s) received`);
            }
        } else {
            console.log('⚠️  Heartbeat failed:', heartbeatResult.message);
        }
        
        // Step 3: Verify enrollment
        console.log('\n🔍 Verifying enrollment...');
        const devicesResponse = await fetch(`${API_BASE_URL}/api/mdm/devices?property_id=${PROPERTY_ID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const devicesResult = await devicesResponse.json();
        
        if (devicesResponse.ok && devicesResult.success) {
            const enrolledDevice = devicesResult.data?.find(d => d.identifier === deviceId);
            if (enrolledDevice) {
                console.log('✅ Device verified in system!');
                console.log(`   Status: ${enrolledDevice.computed_status || enrolledDevice.device_status}`);
                console.log(`   Online: ${enrolledDevice.is_online ? 'Yes' : 'No'}`);
            }
        }
        
        console.log('\n' + '═'.repeat(50));
        console.log('🎉 Device Enrollment Complete!');
        console.log('\n📝 Next Steps:');
        console.log('1. Check device in admin dashboard:');
        console.log(`   https://hospitalityapp.chaletmoments.com/properties/${PROPERTY_ID}/devices`);
        console.log('\n2. To simulate the device in tvOS app:');
        console.log('   - Open the tvOS app in Xcode');
        console.log('   - The app will auto-enroll with this Device ID:');
        console.log(`   ${deviceId}`);
        console.log('\n3. To send commands to this device:');
        console.log('   - Use the admin dashboard');
        console.log('   - Or run: node scripts/send-test-command.js');
        
        // Save device info for later use
        const fs = await import('fs');
        const deviceInfo = {
            deviceId,
            identifier: deviceId,
            serialNumber,
            propertyId: PROPERTY_ID,
            enrolledAt: new Date().toISOString()
        };
        
        await fs.promises.writeFile(
            'test-device-info.json',
            JSON.stringify(deviceInfo, null, 2)
        );
        
        console.log('\n💾 Device info saved to: test-device-info.json');
        
    } catch (error) {
        console.error('\n❌ Enrollment failed:', error.message);
        console.error('Details:', error);
        process.exit(1);
    }
}

// Run enrollment
enrollDevice().catch(console.error);
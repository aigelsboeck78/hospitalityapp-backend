#!/usr/bin/env node

/**
 * Send Test Command to MDM Device
 * Tests the command queue system
 */

import fetch from 'node-fetch';
import fs from 'fs/promises';

const API_BASE_URL = 'https://hospitalityapp-backend.vercel.app';

async function sendTestCommand() {
    console.log('📡 Sending Test Command to Device...');
    console.log('═'.repeat(50));
    
    try {
        // Read the test device info
        const deviceInfo = JSON.parse(
            await fs.readFile('test-device-info.json', 'utf8')
        );
        
        console.log('\n📱 Target Device:');
        console.log(`   Device ID: ${deviceInfo.deviceId}`);
        console.log(`   Serial: ${deviceInfo.serialNumber}`);
        
        // Send different commands to test
        const commands = [
            {
                command_type: 'refresh_content',
                command_data: {
                    source: 'test_script',
                    timestamp: new Date().toISOString()
                }
            },
            {
                command_type: 'enable_kiosk_mode',
                command_data: {
                    mode: 'relaxed',
                    auto_return: true,
                    timeout: 300
                }
            },
            {
                command_type: 'show_message',
                command_data: {
                    title: 'MDM Test',
                    message: 'This is a test message from the MDM system',
                    type: 'info'
                }
            }
        ];
        
        for (const command of commands) {
            console.log(`\n🔧 Sending command: ${command.command_type}`);
            
            const response = await fetch(`${API_BASE_URL}/api/mdm/commands`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    device_id: '0dc11b61-8a49-4a5d-864a-d9e272146c98', // Use the actual DB device ID
                    ...command
                })
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                console.log(`✅ Command queued successfully!`);
                console.log(`   Command ID: ${result.command?.id || 'N/A'}`);
            } else {
                console.log(`⚠️ Failed to queue command: ${result.message}`);
            }
        }
        
        // Check pending commands
        console.log('\n📋 Checking pending commands...');
        const pendingResponse = await fetch(
            `${API_BASE_URL}/api/mdm/commands/pending?device_id=0dc11b61-8a49-4a5d-864a-d9e272146c98`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );
        
        const pendingResult = await pendingResponse.json();
        
        if (pendingResponse.ok && pendingResult.success) {
            console.log(`\n📦 Pending commands: ${pendingResult.data?.length || 0}`);
            if (pendingResult.data && pendingResult.data.length > 0) {
                pendingResult.data.forEach(cmd => {
                    console.log(`   - ${cmd.command_type} (${cmd.status})`);
                });
            }
        }
        
        console.log('\n' + '═'.repeat(50));
        console.log('🎉 Test Commands Sent!');
        console.log('\nNext steps:');
        console.log('1. The device will receive commands on next heartbeat');
        console.log('2. Check command execution in the admin dashboard');
        console.log('3. Monitor device logs in tvOS app console');
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        if (error.message.includes('ENOENT')) {
            console.log('\n⚠️ No test device found. Run enrollment first:');
            console.log('   node scripts/enroll-test-device.js');
        }
    }
}

// Run the command sender
sendTestCommand().catch(console.error);
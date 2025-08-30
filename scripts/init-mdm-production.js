#!/usr/bin/env node

/**
 * Initialize MDM Tables in Production
 * This script creates the necessary MDM tables in the production database
 */

import fetch from 'node-fetch';

const API_BASE_URL = 'https://hospitalityapp-backend.vercel.app';

async function initializeMDMTables() {
    console.log('🚀 Initializing MDM Tables in Production...');
    console.log('═'.repeat(50));
    
    try {
        // Call a special initialization endpoint
        console.log('\n📋 Creating MDM tables...');
        const response = await fetch(`${API_BASE_URL}/api/mdm/init`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'initialize_tables',
                adminKey: 'mdm-init-2025' // Security key
            })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            console.log('✅ MDM tables initialized successfully!');
            console.log('\nTables created:');
            if (result.tables) {
                result.tables.forEach(table => {
                    console.log(`  - ${table}`);
                });
            }
        } else {
            console.error('❌ Failed to initialize tables:', result.message || 'Unknown error');
            
            // If the endpoint doesn't exist, provide manual instructions
            if (response.status === 404) {
                console.log('\n📝 Manual Setup Required:');
                console.log('Since the initialization endpoint is not available,');
                console.log('you need to run the SQL script manually in your production database.');
                console.log('\nSteps:');
                console.log('1. Go to your Vercel/Supabase dashboard');
                console.log('2. Open the SQL editor for your production database');
                console.log('3. Copy and run the contents of: scripts/init-production-mdm.sql');
                console.log('4. Verify the tables were created successfully');
                console.log('\nRequired tables:');
                console.log('  - mdm_profiles');
                console.log('  - mdm_alerts');
                console.log('  - mdm_commands');
                console.log('  - mdm_device_status');
            }
        }
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        
        console.log('\n📝 Manual Setup Instructions:');
        console.log('═'.repeat(50));
        console.log('\nTo initialize MDM tables in production:');
        console.log('\n1. Go to your database provider (Vercel/Supabase)');
        console.log('2. Open the SQL query editor');
        console.log('3. Copy the entire contents of:');
        console.log('   backend/scripts/init-production-mdm.sql');
        console.log('4. Paste and execute the SQL script');
        console.log('5. Verify the following tables were created:');
        console.log('   - mdm_profiles');
        console.log('   - mdm_alerts');
        console.log('   - mdm_commands');
        console.log('   - mdm_device_status');
        console.log('\n6. Also verify these columns were added to devices table:');
        console.log('   - enrollment_status');
        console.log('   - enrollment_date');
        console.log('   - last_heartbeat');
        console.log('   - os_version');
        console.log('   - app_version');
        console.log('   - push_token');
        console.log('\n7. After tables are created, run:');
        console.log('   node scripts/enroll-test-device.js');
        console.log('\n═'.repeat(50));
    }
}

// Run initialization
initializeMDMTables().catch(console.error);
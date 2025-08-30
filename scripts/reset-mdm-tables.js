#!/usr/bin/env node

/**
 * Reset MDM Tables in Production
 * Drops and recreates MDM tables with correct structure
 */

import fetch from 'node-fetch';

const API_BASE_URL = 'https://hospitalityapp-backend.vercel.app';

async function resetMDMTables() {
    console.log('🔄 Resetting MDM Tables in Production...');
    console.log('═'.repeat(50));
    
    try {
        console.log('\n📋 Dropping and recreating MDM tables...');
        const response = await fetch(`${API_BASE_URL}/api/mdm/reset`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'reset_tables',
                adminKey: 'mdm-init-2025'
            })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            console.log('✅ MDM tables reset successfully!');
            console.log('\nTables recreated:');
            if (result.tables) {
                result.tables.forEach(table => {
                    console.log(`  - ${table}`);
                });
            }
        } else {
            console.error('❌ Failed to reset tables:', result.message || 'Unknown error');
        }
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
    }
}

// Run reset
resetMDMTables().catch(console.error);
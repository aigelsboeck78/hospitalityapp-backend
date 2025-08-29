#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

/**
 * MDM Certificate Setup Script
 * 
 * This script helps you set up the necessary certificates for MDM functionality.
 * You'll need an Apple Developer Enterprise account to obtain these certificates.
 * 
 * Required certificates:
 * 1. MDM Push Certificate (from Apple Push Certificates Portal)
 * 2. APNS Certificate (from Apple Developer Portal)
 * 3. MDM Signing Certificate (from Apple Developer Portal)
 */

class MDMCertificateSetup {
  constructor() {
    this.certsDir = path.join(__dirname, '../certificates');
    this.configPath = path.join(__dirname, '../.env.mdm');
  }

  async setup() {
    console.log('🔐 MDM Certificate Setup');
    console.log('═'.repeat(60));
    console.log();
    
    // Check current status
    this.checkCurrentStatus();
    
    // Create certificates directory if it doesn't exist
    this.ensureCertificatesDirectory();
    
    // Generate configuration template
    this.generateConfigurationTemplate();
    
    // Provide setup instructions
    this.printSetupInstructions();
  }

  checkCurrentStatus() {
    console.log('📋 Current Certificate Status:');
    console.log('─'.repeat(40));
    
    const certificates = [
      {
        name: 'MDM Push Certificate',
        envVar: 'MDM_PUSH_CERT_PATH',
        file: 'mdm-push-cert.pem',
        required: true
      },
      {
        name: 'MDM Push Private Key',
        envVar: 'MDM_PUSH_KEY_PATH',
        file: 'mdm-push-key.pem',
        required: true
      },
      {
        name: 'APNS Certificate',
        envVar: 'APNS_CERT_PATH',
        file: 'apns-cert.p12',
        required: true
      },
      {
        name: 'APNS Auth Key',
        envVar: 'APNS_KEY_PATH',
        file: 'apns-auth-key.p8',
        required: false
      },
      {
        name: 'MDM Signing Certificate',
        envVar: 'MDM_SIGNING_CERT_PATH',
        file: 'mdm-signing-cert.p12',
        required: true
      }
    ];
    
    let hasAllRequired = true;
    
    for (const cert of certificates) {
      const envValue = process.env[cert.envVar];
      const defaultPath = path.join(this.certsDir, cert.file);
      const exists = envValue ? fs.existsSync(envValue) : fs.existsSync(defaultPath);
      
      const status = exists ? '✅' : (cert.required ? '❌' : '⚠️');
      const label = cert.required ? '(Required)' : '(Optional)';
      
      console.log(`${status} ${cert.name} ${label}`);
      
      if (exists) {
        console.log(`   Path: ${envValue || defaultPath}`);
      } else {
        console.log(`   Missing: Set ${cert.envVar} or place in ${cert.file}`);
        if (cert.required) hasAllRequired = false;
      }
      console.log();
    }
    
    if (hasAllRequired) {
      console.log('✅ All required certificates are configured');
    } else {
      console.log('❌ Missing required certificates');
    }
    console.log();
  }

  ensureCertificatesDirectory() {
    if (!fs.existsSync(this.certsDir)) {
      fs.mkdirSync(this.certsDir, { recursive: true });
      console.log(`📁 Created certificates directory: ${this.certsDir}`);
      
      // Create .gitignore to prevent certificates from being committed
      const gitignorePath = path.join(this.certsDir, '.gitignore');
      fs.writeFileSync(gitignorePath, '# Ignore all certificate files\n*\n!.gitignore\n!README.md\n');
      console.log('📝 Created .gitignore to protect certificates');
    }
    
    // Create README for the certificates directory
    const readmePath = path.join(this.certsDir, 'README.md');
    if (!fs.existsSync(readmePath)) {
      const readme = `# MDM Certificates Directory

This directory contains sensitive MDM certificates and keys.

## Required Files

1. **mdm-push-cert.pem** - MDM Push Certificate from Apple
2. **mdm-push-key.pem** - Private key for MDM Push Certificate
3. **apns-cert.p12** - APNS Certificate for push notifications
4. **mdm-signing-cert.p12** - Certificate for signing MDM profiles

## Security Notes

- **NEVER** commit these files to version control
- Keep backups in a secure location
- Rotate certificates before expiration
- Use strong passwords for .p12 files

## Obtaining Certificates

1. Get Apple Developer Enterprise Account ($299/year)
2. Go to Apple Developer Portal
3. Generate required certificates
4. Export and place in this directory

For detailed instructions, run:
\`\`\`bash
npm run setup:mdm-certificates
\`\`\`
`;
      fs.writeFileSync(readmePath, readme);
      console.log('📄 Created README.md with certificate information');
    }
  }

  generateConfigurationTemplate() {
    if (!fs.existsSync(this.configPath)) {
      const template = `# MDM Certificate Configuration
# Copy this file to .env and fill in the values

# Apple Developer Configuration
APPLE_TEAM_ID=YOUR_TEAM_ID
APPLE_BUNDLE_ID=com.chaletmoments.mdm

# MDM Push Certificate (from Apple Push Certificates Portal)
MDM_PUSH_CERT_PATH=./certificates/mdm-push-cert.pem
MDM_PUSH_KEY_PATH=./certificates/mdm-push-key.pem
MDM_PUSH_TOPIC=com.apple.mgmt.External.YOUR_UUID

# APNS Configuration (for push notifications)
APNS_CERT_PATH=./certificates/apns-cert.p12
APNS_CERT_PASSPHRASE=YOUR_PASSPHRASE
# OR use Auth Key (recommended)
APNS_KEY_PATH=./certificates/apns-auth-key.p8
APNS_KEY_ID=YOUR_KEY_ID
APNS_TEAM_ID=YOUR_TEAM_ID
APNS_BUNDLE_ID=com.chaletmoments.mdm

# MDM Signing Certificate
MDM_SIGNING_CERT_PATH=./certificates/mdm-signing-cert.p12
MDM_SIGNING_CERT_PASSPHRASE=YOUR_PASSPHRASE

# MDM Server Configuration
MDM_SERVER_URL=https://hospitalityapp-backend.vercel.app/mdm
MDM_CHECKIN_URL=https://hospitalityapp-backend.vercel.app/mdm/checkin
MDM_ENROLLMENT_URL=https://hospitalityapp-backend.vercel.app/mdm/enroll

# Device Enrollment Program (DEP)
DEP_SERVER_TOKEN=YOUR_DEP_TOKEN
DEP_RESELLER_ID=YOUR_RESELLER_ID

# Push Magic String (generated UUID)
MDM_PUSH_MAGIC=${crypto.randomUUID()}
`;
      fs.writeFileSync(this.configPath, template);
      console.log(`📋 Generated configuration template: ${this.configPath}`);
    }
  }

  printSetupInstructions() {
    console.log('📚 Setup Instructions');
    console.log('═'.repeat(60));
    console.log();
    console.log('Step 1: Get Apple Developer Enterprise Account');
    console.log('─'.repeat(40));
    console.log('1. Go to: https://developer.apple.com/programs/enterprise/');
    console.log('2. Enroll in the Apple Developer Enterprise Program ($299/year)');
    console.log('3. Wait for approval (may take several days)');
    console.log();
    
    console.log('Step 2: Generate MDM Push Certificate');
    console.log('─'.repeat(40));
    console.log('1. Create a Certificate Signing Request (CSR):');
    console.log('   openssl req -new -key mdm-push-key.pem -out mdm-push.csr');
    console.log('2. Go to: https://identity.apple.com/pushcert/');
    console.log('3. Upload your CSR');
    console.log('4. Download the certificate');
    console.log('5. Save as: certificates/mdm-push-cert.pem');
    console.log();
    
    console.log('Step 3: Generate APNS Certificate');
    console.log('─'.repeat(40));
    console.log('1. Go to Apple Developer Portal');
    console.log('2. Navigate to Certificates, Identifiers & Profiles');
    console.log('3. Create a new Push Notification certificate');
    console.log('4. Download and export as .p12');
    console.log('5. Save as: certificates/apns-cert.p12');
    console.log();
    
    console.log('Step 4: Generate MDM Signing Certificate');
    console.log('─'.repeat(40));
    console.log('1. In Apple Developer Portal');
    console.log('2. Create a new MDM CSR signing certificate');
    console.log('3. Download and export as .p12');
    console.log('4. Save as: certificates/mdm-signing-cert.p12');
    console.log();
    
    console.log('Step 5: Configure Environment');
    console.log('─'.repeat(40));
    console.log('1. Copy .env.mdm to .env');
    console.log('2. Fill in all required values');
    console.log('3. Set certificate passwords');
    console.log('4. Update server URLs');
    console.log();
    
    console.log('Step 6: Test Configuration');
    console.log('─'.repeat(40));
    console.log('Run: npm run test:mdm-certificates');
    console.log();
    
    console.log('🔗 Helpful Links:');
    console.log('─'.repeat(40));
    console.log('• Apple Developer Portal: https://developer.apple.com');
    console.log('• Push Certificates Portal: https://identity.apple.com/pushcert/');
    console.log('• MDM Protocol Reference: https://developer.apple.com/documentation/devicemanagement');
    console.log('• Configuration Profile Reference: https://developer.apple.com/business/documentation/Configuration-Profile-Reference.pdf');
    console.log();
    
    console.log('⚠️  Important Notes:');
    console.log('─'.repeat(40));
    console.log('• Certificates expire annually and must be renewed');
    console.log('• Keep certificate passwords secure');
    console.log('• Never commit certificates to version control');
    console.log('• Test in development before production deployment');
    console.log('• Implement certificate rotation before expiration');
    console.log();
  }
}

// Run setup
const setup = new MDMCertificateSetup();
setup.setup().catch(console.error);
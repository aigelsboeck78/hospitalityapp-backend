import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

async function resetAdminPassword() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
  });

  try {
    // Generate secure random password
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let tempPassword = '';
    for (let i = 0; i < 16; i++) {
      tempPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    // Update admin password
    const result = await pool.query(
      `UPDATE users 
       SET password_hash = $1, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE username = $2
       RETURNING id, email`,
      [hashedPassword, 'admin']
    );

    if (result.rows.length > 0) {
      console.log('✅ Admin password reset successfully');
      console.log('');
      console.log('========================================');
      console.log('🔐 IMPORTANT: Save these credentials!');
      console.log('========================================');
      console.log(`Username: admin`);
      console.log(`Email: ${result.rows[0].email}`);
      console.log(`Temporary Password: ${tempPassword}`);
      console.log('========================================');
      console.log('⚠️  Please change this password immediately after first login!');
      console.log('');
    } else {
      console.error('❌ Admin user not found');
    }

  } catch (error) {
    console.error('❌ Error resetting password:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run reset
resetAdminPassword();
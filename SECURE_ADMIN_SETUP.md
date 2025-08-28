# Secure Admin Setup for Production

## ⚠️ IMPORTANT: Production Security

The application now uses proper database-backed user authentication. The hardcoded admin/admin123 credentials have been removed.

## Initial Setup

### 1. Create Admin User

The system has created an initial admin user with a secure temporary password. 

**IMPORTANT**: You must change this password immediately after first login!

### 2. First Login Steps

1. Go to https://hospitalityapp.chaletmoments.com
2. Login with the admin credentials provided by the setup script
3. Immediately change your password using the profile settings

### 3. Password Requirements

For security, passwords should:
- Be at least 12 characters long
- Include uppercase and lowercase letters
- Include numbers
- Include special characters
- Not be a common password or dictionary word

### 4. Creating Additional Users

As an admin, you can create additional users:

1. Login as admin
2. Go to User Management
3. Create new users with appropriate roles:
   - `admin` - Full system access
   - `manager` - Property management access
   - `user` - Basic access

### 5. Security Best Practices

1. **Never share passwords** - Each user should have their own account
2. **Use strong passwords** - Follow the password requirements above
3. **Regular password changes** - Change passwords every 90 days
4. **Monitor audit logs** - Check login attempts and user activities
5. **Deactivate unused accounts** - Disable accounts that are no longer needed
6. **Use HTTPS only** - Always access via https://hospitalityapp.chaletmoments.com

### 6. API Endpoints

The following secure endpoints are now available:

- `POST /api/auth/login` - User login (email or username)
- `GET /api/auth/verify` - Verify JWT token
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/change-password` - Change user password
- `GET /api/users` - List all users (admin only)
- `POST /api/users` - Create new user (admin only)

### 7. Environment Variables

Ensure these are set in Vercel:

```env
JWT_SECRET=<secure-random-string-at-least-32-chars>
REFRESH_TOKEN_SECRET=<different-secure-random-string>
```

### 8. Database Tables

The following tables have been created:

- `users` - User accounts
- `refresh_tokens` - JWT refresh tokens
- `user_sessions` - Active user sessions
- `audit_logs` - Security audit trail

### 9. Monitoring

Monitor the audit_logs table for:
- Failed login attempts
- Password changes
- User creation/deletion
- Suspicious activities

### 10. Emergency Access

If you lose admin access:

1. Connect to the database directly
2. Run: `UPDATE users SET password_hash = '$2b$10$...' WHERE username = 'admin';`
3. Use bcrypt to generate a new password hash
4. Update the password_hash field
5. Login and immediately change the password

## Security Checklist

- [ ] Changed default admin password
- [ ] Set strong JWT secrets in environment variables
- [ ] Enabled HTTPS only access
- [ ] Created individual user accounts for team members
- [ ] Documented password policy
- [ ] Set up regular audit log reviews
- [ ] Tested password change functionality
- [ ] Verified role-based access control

## Support

For security issues or questions, contact your system administrator immediately.
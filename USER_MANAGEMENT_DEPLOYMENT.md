# User Management System Deployment Guide

## Overview
The hospitality application now uses a secure database-backed user authentication system with JWT tokens, replacing the previous hardcoded credentials.

## What Has Been Implemented

### 1. Backend Authentication System
- **Database tables**: users, refresh_tokens, user_sessions, audit_logs
- **Password security**: Bcrypt hashing with salt rounds
- **Token management**: JWT access tokens (15 min) and refresh tokens (7 days)
- **Role-based access control**: admin, manager, user roles
- **Audit logging**: All authentication events are logged

### 2. API Endpoints
- `POST /api/auth/login` - Accepts username or email + password
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/verify` - Verify current token
- `POST /api/auth/change-password` - Change user password
- `GET /api/users` - List all users (admin only)
- `POST /api/users` - Create new user (admin only)

### 3. Frontend Updates
- Removed hardcoded admin/admin123 display
- Added email/username toggle for login
- Implemented automatic token refresh
- Added "Forgot password?" link

## Deployment Steps

### Step 1: Set Environment Variables in Vercel

Add these to your Backend Vercel project settings:

```env
JWT_SECRET=your-secure-32-char-string-here
REFRESH_TOKEN_SECRET=another-secure-32-char-string-here
NODE_ENV=production
```

Generate secure secrets with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 2: Run Database Setup

After deployment, run the setup script to create tables and initial admin:

```bash
npm run setup-users
```

This will:
1. Create all authentication tables
2. Generate a secure temporary password for admin
3. Display the credentials (SAVE THESE!)

### Step 3: Update Frontend API URL

Ensure the web-admin project has the correct backend URL:

```env
VITE_API_URL=https://hospitalityapp-backend.vercel.app
```

### Step 4: First Login

1. Navigate to https://hospitalityapp.chaletmoments.com
2. Login with the admin credentials from Step 2
3. **IMMEDIATELY** change the password

### Step 5: Create Additional Users

As admin, you can now:
1. Go to User Management (when implemented in UI)
2. Create users with appropriate roles
3. Each user gets their own secure credentials

## Security Checklist

- [ ] Generated and set secure JWT secrets
- [ ] Run setup-users script
- [ ] Saved initial admin credentials securely
- [ ] Changed admin password after first login
- [ ] Removed any references to old hardcoded credentials
- [ ] Verified HTTPS is enforced
- [ ] Tested login with new credentials

## Troubleshooting

### Can't login after deployment
1. Check backend logs in Vercel
2. Verify JWT_SECRET is set in environment
3. Ensure database tables were created

### Forgot admin password
1. Connect to database directly
2. Generate new password hash: `bcrypt.hash('newpassword', 10)`
3. Update admin user: `UPDATE users SET password_hash = 'hash' WHERE username = 'admin'`

### Token expired errors
- Tokens expire after 15 minutes
- Frontend should automatically refresh using refresh token
- If issues persist, clear localStorage and login again

## Next Steps

1. Implement UI for user management
2. Add password reset via email
3. Implement session management UI
4. Add two-factor authentication
5. Set up regular security audits

## Support

For issues, check:
- Backend logs: Vercel Function logs
- Database: Supabase dashboard
- Browser console for frontend errors
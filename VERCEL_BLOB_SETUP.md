# Setting Up Vercel Blob Storage

To enable image uploads, you need to set up Vercel Blob Storage:

## Steps:

1. **Go to your Vercel Dashboard**
   - Navigate to: https://vercel.com/dashboard
   - Select your `hospitalityapp-backend` project

2. **Enable Blob Storage**
   - Go to the "Storage" tab
   - Click "Create Database"
   - Select "Blob" 
   - Choose a name (e.g., "hospitality-images")
   - Select your preferred region
   - Click "Create"

3. **Get the Token**
   - After creation, you'll see environment variables
   - Copy the `BLOB_READ_WRITE_TOKEN` value

4. **Add to Environment Variables**
   - Go to Settings → Environment Variables
   - Add: `BLOB_READ_WRITE_TOKEN` with the token value
   - Click "Save"

5. **Redeploy**
   - Go to Deployments
   - Click "..." on the latest deployment
   - Select "Redeploy"

## Features:
- ✅ 1GB free storage
- ✅ Automatic CDN distribution
- ✅ Fast global access
- ✅ No third-party dependencies
- ✅ Integrated with Vercel

## Pricing:
- Free tier: 1GB storage + 1GB bandwidth/month
- Pay as you grow for additional storage

Once configured, file uploads will automatically use Vercel Blob Storage!
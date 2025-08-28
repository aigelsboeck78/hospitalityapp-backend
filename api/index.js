// Simple health check endpoint for Vercel
export default function handler(req, res) {
  res.status(200).json({ 
    message: 'Backend API is running',
    endpoint: '/api',
    timestamp: new Date().toISOString()
  });
}
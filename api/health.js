/**
 * Vercel Serverless API Route: /api/health
 * Health check endpoint for monitoring
 */

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  res.status(200).json({
    ok: true,
    message: 'Rivertrade API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    supabaseConfigured: !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY)
  });
}

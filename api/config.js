/**
 * Vercel Serverless API Route: /api/config
 * Returns client-side configuration including Supabase credentials
 */

export default function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Check if Supabase is configured
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(200).json({
      configured: false,
      message: 'Supabase not configured. Running in demo mode.'
    });
  }

  // Return the configuration (anon key is safe to expose)
  res.status(200).json({
    configured: true,
    supabaseUrl,
    supabaseAnonKey,
    environment: process.env.NODE_ENV || 'production'
  });
}

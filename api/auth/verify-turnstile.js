/**
 * Vercel Serverless API Route: /api/auth/verify-turnstile
 * Verifies Cloudflare Turnstile token
 */

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, error: 'No token provided' });
    }

    const cloudflareSecretKey = process.env.CLOUDFLARE_SECRET_KEY;

    // If no secret key is configured, skip verification in non-production
    if (!cloudflareSecretKey) {
      if (process.env.NODE_ENV === 'production') {
        return res.status(400).json({ success: false, error: 'Turnstile not configured' });
      }
      // In development, accept verification without checking
      return res.status(200).json({ success: true, message: 'Cloudflare Turnstile verified (dev mode)' });
    }

    // Verify with Cloudflare
    const verifyUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
    const formData = new URLSearchParams();
    formData.append('secret', cloudflareSecretKey);
    formData.append('response', token);

    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });

    const result = await response.json();

    if (!result.success) {
      console.warn('Turnstile verification failed:', result);
      return res.status(400).json({ success: false, error: 'Turnstile validation failed' });
    }

    return res.status(200).json({ success: true, message: 'Cloudflare Turnstile verified' });
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

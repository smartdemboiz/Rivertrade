/**
 * Vercel Serverless API Route: /api/auth/register
 * Handles user registration with Supabase backend
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
    const { firstName, lastName, email, password, country, countryCode, phone, currency, referralCode, wantsBonus } = req.body;

    // Validate required fields
    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    if (!password || String(password).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    if (!country || !countryCode || !phone) {
      return res.status(400).json({ error: 'Country, country code, and phone are required' });
    }

    // TODO: Integrate with Supabase Authentication
    // For now, return a mock response
    // Replace this with actual Supabase call when credentials are configured

    const mockUserId = Math.random().toString(36).substring(7);

    return res.status(201).json({
      message: 'Registration successful',
      token: `demo-token-${mockUserId}`,
      user: {
        id: mockUserId,
        firstName,
        lastName,
        email,
        country,
        countryCode,
        phone,
        currency: currency || 'USD',
        referralCode: referralCode || null,
        wantsBonus: wantsBonus || false
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

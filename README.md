# RiverTrade

RiverTrade is a Next.js investment platform for crypto and market portfolio experiences.

## Stack

- Next.js 16
- React 19
- Lucide icons
- ESLint + Next.js config

## Local development

```bash
npm install
npm run dev
```

Then open:

- http://localhost:3000

## Production environment variables

Create a `.env.local` file from `.env.example` and populate it:

```bash
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-api-domain.com

# Optional direct Across fallback (server-only; never use NEXT_PUBLIC_)
ACROSS_API_KEY=your-across-api-key
ACROSS_INTEGRATOR_ID=0xdead
```

The direct Across quote fallback is used for supported EVM cross-chain pairs only when LI.FI returns no live route. Get the API key and integrator ID from Across and keep the key server-side.

## Production checks

```bash
npm run build
npm run start
```

## Notes

- The app currently uses client-side mock responses for authentication and admin data when no API is configured.
- For real production deployment, replace the mock auth/admin endpoints with your live backend or Supabase service.
- The app is ready for static deployment on Vercel and compatible with a serverless/API layer for live market and admin features.

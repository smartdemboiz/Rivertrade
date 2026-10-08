# Supabase setup for RiverTrade

1. Create a Supabase project.
2. Open the SQL editor and run `schema.sql`.
3. Set the following environment variables in your Vercel or local env file:

SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

4. Ensure the auth users have a `role` claim set to `admin` for admin access.
5. Test login and admin routes against the live database.

Notes:
- The app keeps a fallback in place when Supabase is not configured.
- The live Supabase path is now the default when env vars are present.
- Email-confirmed customers can submit identity documents from Dashboard → KYC verification. The first submission creates a private `kyc-documents` Storage bucket using the service-role key; administrators receive expiring signed links in KYC management.
- KYC submissions use the existing `kyc` table. Its `notes` field stores the submitted name, issuing country, and private document path; do not make the Storage bucket public.
- Contact form support requests are saved to `public.support_tickets`. Run `migrations/20261008120000_support_contact_tickets.sql` in the Supabase SQL Editor before deploying the contact form changes. The server uses the service-role key for inserts; do not add anonymous insert access to the table.
- Optional support-ticket email alerts use `RESEND_API_KEY`, `EMAIL_FROM`, and `SUPPORT_EMAIL` (or the existing `EMAIL_TO`). Set `REDIS_URL` for contact form rate limiting in production.

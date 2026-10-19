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
- Dashboard deposit submissions are saved as pending rows in `public.deposits`. Run `migrations/20261016110000_deposit_requests.sql` in the Supabase SQL Editor before deploying; it adds the payment network and reference fields. The server validates the signed-in customer and enabled deposit method. This records manual requests only; it does not process or verify payments or credit customer balances.
- Run `migrations/20261016120000_manual_usd_deposit_credits.sql`, `migrations/20261016130000_currency_specific_deposit_balances.sql`, and then `migrations/20261017160000_account_currency_deposit_conversion.sql` in the SQL Editor to enable admin-confirmed deposits converted to the customer's account currency. The live exchange rate and quote time are stored with the deposit, and the database function atomically confirms the deposit and creates one transaction and one available-funds ledger row in the converted currency.
- Run `migrations/20261016140000_funded_investments.sql` after the deposit migrations to enable customer investments. Active plans and available customer balances load from Supabase. Investment funding uses an expiring live USD quote; the customer confirms the exact crypto amount/rate, and a database function atomically records the pending investment, crypto debit, and transaction. This is an internal investment-accounting conversion, not an on-chain swap. Admin cancellation refunds a still-pending investment in its original funding currency; activated investments cannot be cancelled through that refund action.
- Run `migrations/20261018120000_manual_withdrawal_receipts.sql` to enable withdrawal requests and receipts. Requests reserve the requested amount against the account's available currency balance, but funds are not deducted until an admin confirms that the manual payout was sent. The migration stores payout destination details for admin processing and makes payout transactions/ledger entries idempotent.
- Run `migrations/20261019120000_admin_profit_credits.sql` to enable audited admin profit credits. The Profit history admin section lets an admin select a customer and amount; a service-only database function atomically records the settled profit and credits the same amount in that customer's account currency to available funds and transaction history. Settling an existing pending profit uses an idempotent database function as well.
- Optional support-ticket email alerts use `RESEND_API_KEY`, `EMAIL_FROM`, and `SUPPORT_EMAIL` (or the existing `EMAIL_TO`). Set `REDIS_URL` for contact form rate limiting in production.

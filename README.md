# AllGamersMarket

AllGamersMarket is a Next.js App Router marketplace for gaming accounts, items, and services. Supabase provides authentication, data storage, realtime chat, and protected marketplace records. Razorpay provides hosted checkout.

## Local development

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3000`. Run the project checks before deployment:

```bash
npm run lint
npm run build
npm run start
```

## Environment variables

Browser-safe variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- `NEXT_PUBLIC_SITE_URL` — the deployed origin, for example `https://allgamersmarket.com`

Server-only secrets:

- `SUPABASE_SERVICE_ROLE_KEY`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`

Never expose a server secret with a `NEXT_PUBLIC_` prefix, and never commit `.env.local`.

## Supabase authentication

Add the production `/auth/callback` URL (and its local equivalent) to the Supabase redirect allowlist. The current admin flow is `/admin` → `/login?next=/admin` → `/admin`; normal login returns to `/`. Email/password login, signup, password reset and Google OAuth remain handled by Supabase.

## Razorpay setup

1. Begin with Razorpay Test Mode keys.
2. Enable automatic capture so fulfillment happens only after a captured payment.
3. Create a webhook for `https://allgamersmarket.com/webhook`.
4. Subscribe the webhook to `payment.captured`.
5. Set the same secret in `RAZORPAY_WEBHOOK_SECRET` on the deployment platform.
6. Complete a full test purchase and verify the order appears in **My orders** before switching to Live Mode.

The checkout price is read server-side from the approved listing. Payment callback and webhook signatures are verified before the purchase-finalization database function is called.

## Deployment

Deploy the repository to a platform that supports Next.js App Router and Node.js route handlers, and configure all environment variables separately for Preview and Production. The production custom domains are:

- `allgamersmarket.com`
- `www.allgamersmarket.com`

Cloudflare Workers deployment uses `@opennextjs/cloudflare` through the repository's `build:cloudflare`, `preview`, and `deploy` scripts. Keep Cloudflare DNS, HTTPS and DNSSEC enabled.

# AllGamersMarket

AllGamersMarket is a React and Cloudflare Pages marketplace for gaming accounts, items, and services. Supabase provides authentication, data storage, realtime chat, and protected marketplace records. Razorpay provides hosted checkout.

## Local development

```bash
npm install
npm run dev
```

Run the project checks before deployment:

```bash
npm run lint
npm run build
```

## Environment variables

Public Vite build variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Cloudflare Pages Function variables and encrypted secrets:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — encrypted secret; never expose with a `VITE_` prefix
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET` — encrypted secret
- `RAZORPAY_WEBHOOK_SECRET` — encrypted secret

Never commit `.env.local` or any live secret.

## Razorpay setup

1. Begin with Razorpay Test Mode keys.
2. Enable automatic capture so fulfillment happens only after a captured payment.
3. Create a webhook for `https://allgamersmarket.com/webhook`.
4. Subscribe the webhook to `payment.captured`.
5. Use the same webhook secret in `RAZORPAY_WEBHOOK_SECRET` on Cloudflare Pages.
6. Complete a full test purchase and verify the order appears in **My orders** before switching to Live Mode.

The checkout price is read server-side from the approved listing. Payment callback and webhook signatures are verified before the purchase finalization database function is called.

## Deployment

Cloudflare Pages deploys the connected Git repository. The production custom domains are:

- `allgamersmarket.com`
- `www.allgamersmarket.com`

Keep Cloudflare DNS, HTTPS, and DNSSEC enabled. Configure secrets separately for Preview and Production when testing both environments.

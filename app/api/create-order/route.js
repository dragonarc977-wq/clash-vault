import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TERMS_VERSION = '2026-09-15';

const json = (body, status = 200) => Response.json(body, {
  status,
  headers: { 'cache-control': 'no-store' },
});

export async function POST(request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!supabaseUrl || !supabaseAnonKey || !razorpayKeyId || !razorpayKeySecret) {
    return json({ error: 'Payment service is not configured.' }, 503);
  }

  const authorization = request.headers.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token) return json({ error: 'Please sign in before purchasing.' }, 401);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }

  if (!body.accountId) return json({ error: 'Listing is required.' }, 400);
  if (body.termsAccepted !== true || body.termsVersion !== TERMS_VERSION) {
    return json({ error: 'Accept the current Terms, Refund Policy and transfer-risk disclosure before paying.' }, 400);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return json({ error: 'Your session has expired. Please sign in again.' }, 401);

  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .select('id,title,price,status,moderation_status')
    .eq('id', body.accountId)
    .maybeSingle();

  if (
    accountError
    || !account
    || account.status !== 'available'
    || (account.moderation_status && account.moderation_status !== 'approved')
  ) {
    return json({ error: 'This listing is no longer available.' }, 409);
  }

  const amount = Math.round(Number(account.price) * 100);
  if (!Number.isSafeInteger(amount) || amount < 100) {
    return json({ error: 'This listing has an invalid price.' }, 400);
  }

  const receipt = `agm_${account.id.replaceAll('-', '').slice(0, 12)}_${Date.now().toString(36)}`;
  const credentials = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64');
  const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount,
      currency: 'INR',
      receipt,
      notes: {
        account_id: account.id,
        buyer_id: user.id,
        buyer_email: user.email || '',
        terms_version: TERMS_VERSION,
        terms_accepted_at: new Date().toISOString(),
      },
    }),
    cache: 'no-store',
  });
  const order = await razorpayResponse.json();

  if (!razorpayResponse.ok || !order.id) {
    console.error('Razorpay order creation failed', {
      status: razorpayResponse.status,
      reason: order.error?.description,
    });
    return json({ error: 'The payment service could not create an order. Please try again.' }, 502);
  }

  return json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: razorpayKeyId,
  });
}

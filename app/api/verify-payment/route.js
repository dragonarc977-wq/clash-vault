import { createHmac, timingSafeEqual } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const json = (body, status = 200) => Response.json(body, {
  status,
  headers: { 'cache-control': 'no-store' },
});

function signaturesMatch(value, receivedSignature, secret) {
  const expected = createHmac('sha256', secret).update(value).digest('hex');
  const received = Buffer.from(receivedSignature || '', 'utf8');
  const trusted = Buffer.from(expected, 'utf8');
  return received.length === trusted.length && timingSafeEqual(received, trusted);
}

export async function POST(request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey || !razorpayKeyId || !razorpayKeySecret) {
    return json({ error: 'Payment verification is not configured.' }, 503);
  }

  const authorization = request.headers.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: { user }, error: authError } = await authClient.auth.getUser(token);
  if (authError || !user) return json({ error: 'Your session has expired.' }, 401);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid payment response.' }, 400);
  }

  const orderId = body.razorpay_order_id;
  const paymentId = body.razorpay_payment_id;
  const receivedSignature = body.razorpay_signature;
  if (!orderId || !paymentId || !receivedSignature) {
    return json({ error: 'Incomplete payment response.' }, 400);
  }

  if (!signaturesMatch(`${orderId}|${paymentId}`, receivedSignature, razorpayKeySecret)) {
    return json({ error: 'Payment signature verification failed.' }, 400);
  }

  const credentials = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64');
  const paymentResponse = await fetch(
    `https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`,
    { headers: { Authorization: `Basic ${credentials}` }, cache: 'no-store' },
  );
  const payment = await paymentResponse.json();
  if (!paymentResponse.ok || payment.order_id !== orderId) {
    return json({ error: 'Payment could not be confirmed.' }, 400);
  }

  const notes = payment.notes || {};
  if (!notes.account_id || notes.buyer_id !== user.id) {
    return json({ error: 'Payment ownership could not be confirmed.' }, 403);
  }
  if (payment.status !== 'captured') {
    return json({ verified: true, fulfilled: false, pending: true });
  }

  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: result, error } = await serviceClient.rpc('finalize_account_purchase', {
    p_account_id: notes.account_id,
    p_buyer_id: user.id,
    p_buyer_email: user.email || notes.buyer_email || '',
    p_payment_id: payment.id,
  });

  if (error) {
    console.error('Immediate purchase finalization failed', {
      paymentId,
      accountId: notes.account_id,
      error: error.message,
    });
    return json({ verified: true, fulfilled: false, pending: true });
  }
  if (!result?.success) {
    return json({ verified: true, fulfilled: false, conflict: true });
  }

  return json({ verified: true, fulfilled: true, orderId: result.order_id });
}

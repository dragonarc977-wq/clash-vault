import { createClient } from '@supabase/supabase-js';

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});

async function hmacHex(value, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function constantTimeEqual(left, right) {
  if (!left || !right || left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
}

export async function onRequestPost({ request, env }) {
  if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY || !env.SUPABASE_SERVICE_ROLE_KEY || !env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    return json({ error: 'Payment verification is not configured.' }, 503);
  }

  const authorization = request.headers.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  const authClient = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: { user }, error: authError } = await authClient.auth.getUser(token);
  if (authError || !user) return json({ error: 'Your session has expired.' }, 401);

  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid payment response.' }, 400); }
  const orderId = body.razorpay_order_id;
  const paymentId = body.razorpay_payment_id;
  const receivedSignature = body.razorpay_signature;
  if (!orderId || !paymentId || !receivedSignature) return json({ error: 'Incomplete payment response.' }, 400);

  const expectedSignature = await hmacHex(`${orderId}|${paymentId}`, env.RAZORPAY_KEY_SECRET);
  if (!constantTimeEqual(expectedSignature, receivedSignature)) return json({ error: 'Payment signature verification failed.' }, 400);

  const credentials = btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`);
  const paymentResponse = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, { headers: { Authorization: `Basic ${credentials}` } });
  const payment = await paymentResponse.json();
  if (!paymentResponse.ok || payment.order_id !== orderId) return json({ error: 'Payment could not be confirmed.' }, 400);

  const notes = payment.notes || {};
  if (!notes.account_id || notes.buyer_id !== user.id) return json({ error: 'Payment ownership could not be confirmed.' }, 403);
  if (payment.status !== 'captured') return json({ verified: true, fulfilled: false, pending: true });

  const serviceClient = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: result, error } = await serviceClient.rpc('finalize_account_purchase', {
    p_account_id: notes.account_id,
    p_buyer_id: user.id,
    p_buyer_email: user.email || notes.buyer_email || '',
    p_payment_id: payment.id,
  });
  if (error) {
    console.error('Immediate purchase finalization failed', { paymentId, accountId: notes.account_id, error: error.message });
    return json({ verified: true, fulfilled: false, pending: true });
  }
  if (!result?.success) return json({ verified: true, fulfilled: false, conflict: true });
  return json({ verified: true, fulfilled: true, orderId: result.order_id });
}

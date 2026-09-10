import { createClient } from '@supabase/supabase-js';

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

async function verifyRazorpaySignature(rawBody, signature, secret) {
  if (!signature || !secret) return false;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody));
  const expected = [...new Uint8Array(signatureBuffer)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  if (signature.length !== expected.length) return false;

  let difference = 0;
  for (let index = 0; index < expected.length; index += 1) {
    difference |= signature.charCodeAt(index) ^ expected.charCodeAt(index);
  }
  return difference === 0;
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const rawBody = await request.text();
  const signature = request.headers.get('x-razorpay-signature');

  if (!await verifyRazorpaySignature(rawBody, signature, env.RAZORPAY_WEBHOOK_SECRET)) {
    return jsonResponse({ error: 'Invalid signature' }, 400);
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ error: 'Invalid JSON payload' }, 400);
  }

  // Only a captured payment can own a listing. Authorized payments are not final.
  if (payload.event !== 'payment.captured') {
    return jsonResponse({ received: true, ignored: true });
  }

  if (!env.VITE_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase webhook credentials');
    return jsonResponse({ error: 'Webhook configuration error' }, 500);
  }

  const payment = payload.payload?.payment?.entity;
  const orderNotes = payload.payload?.order?.entity?.notes;
  const notes = payment?.notes || orderNotes || {};
  const accountId = notes.account_id;
  const buyerId = notes.buyer_id;
  const buyerEmail = notes.buyer_email || payment?.email || '';
  const paymentId = payment?.id;

  if (!accountId || !buyerId || !paymentId) {
    console.error('Missing trusted purchase identifiers in Razorpay notes', { paymentId, accountId, buyerId });
    return jsonResponse({ error: 'Missing purchase information' }, 400);
  }

  const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // The database function locks the listing, marks it sold, and creates the
  // order in one transaction. A second buyer cannot receive the same account.
  const { data: result, error } = await supabase.rpc('finalize_account_purchase', {
    p_account_id: accountId,
    p_buyer_id: buyerId,
    p_buyer_email: buyerEmail,
    p_payment_id: paymentId,
  });

  if (error) {
    console.error('Atomic purchase finalization failed', { paymentId, accountId, error: error.message });
    return jsonResponse({ error: 'Purchase finalization failed' }, 500);
  }

  if (!result?.success) {
    // Returning 200 prevents duplicate retries. Review/refund this payment in Razorpay.
    console.error('PAID LISTING CONFLICT — REFUND REQUIRED', { paymentId, accountId, buyerId });
    return jsonResponse({ received: true, fulfilled: false, reason: result?.reason || 'listing_unavailable' });
  }

  console.log('Purchase finalized', { orderId: result.order_id, accountId: result.account_id, paymentId, idempotent: result.idempotent });
  return jsonResponse({ received: true, fulfilled: true, order_id: result.order_id });
}

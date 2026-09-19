import { createHmac, timingSafeEqual } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function json(body, status = 200) {
  return Response.json(body, { status });
}

function verifyRazorpaySignature(rawBody, signature, secret) {
  if (!signature || !secret) return false;
  const expected = Buffer.from(createHmac('sha256', secret).update(rawBody).digest('hex'));
  const received = Buffer.from(signature);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export async function POST(request) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-razorpay-signature');
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!verifyRazorpaySignature(rawBody, signature, webhookSecret)) {
    return json({ error: 'Invalid signature' }, 400);
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return json({ error: 'Invalid JSON payload' }, 400);
  }

  if (payload.event !== 'payment.captured') {
    return json({ received: true, ignored: true });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase webhook credentials');
    return json({ error: 'Webhook configuration error' }, 500);
  }

  const payment = payload.payload?.payment?.entity;
  const orderNotes = payload.payload?.order?.entity?.notes;
  const notes = { ...(orderNotes || {}), ...(payment?.notes || {}) };
  const accountId = notes.account_id;
  const buyerId = notes.buyer_id;
  const buyerEmail = notes.buyer_email || payment?.email || '';
  const paymentId = payment?.id;

  if (!accountId || !buyerId || !paymentId) {
    console.error('Missing trusted purchase identifiers in Razorpay notes', {
      paymentId,
      accountId,
      buyerId,
    });
    return json({ error: 'Missing purchase information' }, 400);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: result, error } = await supabase.rpc('finalize_account_purchase', {
    p_account_id: accountId,
    p_buyer_id: buyerId,
    p_buyer_email: buyerEmail,
    p_payment_id: paymentId,
  });

  if (error) {
    console.error('Atomic purchase finalization failed', {
      paymentId,
      accountId,
      error: error.message,
    });
    return json({ error: 'Purchase finalization failed' }, 500);
  }

  if (!result?.success) {
    console.error('PAID LISTING CONFLICT — REFUND REQUIRED', {
      paymentId,
      accountId,
      buyerId,
    });
    return json({
      received: true,
      fulfilled: false,
      reason: result?.reason || 'listing_unavailable',
    });
  }

  console.log('Purchase finalized', {
    orderId: result.order_id,
    accountId: result.account_id,
    paymentId,
    idempotent: result.idempotent,
  });
  return json({ received: true, fulfilled: true, order_id: result.order_id });
}

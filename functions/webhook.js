import { createClient } from '@supabase/supabase-js';

export async function onRequestPost(context) {
  const { request, env } = context;
  const rawBody = await request.text();
  const headers = request.headers;

  if (headers.get('x-razorpay-signature')) {
    const signature = headers.get('x-razorpay-signature');
    const secret = env.RAZORPAY_WEBHOOK_SECRET;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody));
    const expectedSignature = [...new Uint8Array(signatureBuffer)].map(b => b.toString(16).padStart(2, '0')).join('');

    if (signature !== expectedSignature) {
      return new Response('Invalid Signature', { status: 400 });
    }

    const payload = JSON.parse(rawBody);

    if (payload.event === 'payment.captured' || payload.event === 'payment.authorized') {
      const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

      const notes = payload.payload.payment?.entity?.notes || payload.payload.order?.entity?.notes;
      const accountId = notes?.account_id;
      const buyerId = notes?.buyer_id;

      if (accountId && buyerId) {
        // 1. Fetch the account details (to deliver to the buyer)
        const { data: accountData } = await supabase.from('accounts').select('*').eq('id', accountId).single();

        if (accountData) {
          // 2. Create the order for the buyer (Delivered status)
          await supabase.from('orders').insert({
            buyer_id: buyerId,
            account_id: accountId,
            payment_id: payload.payload.payment.entity.id,
            status: 'delivered',
          });

          // 3. Delete the account from the store
          await supabase.from('accounts').delete().eq('id', accountId);

          console.log('Order created for buyer:', buyerId, 'Account:', accountId);
        }
      } else {
        console.log('Missing account_id or buyer_id in notes');
      }
    }
    return new Response('OK', { status: 200 });
  }
  return new Response('Unknown Provider', { status: 400 });
}
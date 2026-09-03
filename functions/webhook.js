import { createClient } from '@supabase/supabase-js';

export async function onRequestPost(context) {
  const { request, env } = context;
  const rawBody = await request.text();
  const headers = request.headers;

  // 1. Verify Signature
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

    // 2. Handle Payment Captured
    if (payload.event === 'payment.captured') {
      const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
      
      // CRITICAL FIX: Check the ORDER notes first, then the PAYMENT notes!
      const accountId = payload.payload.order?.entity?.notes?.account_id || payload.payload.payment?.entity?.notes?.account_id;

      if (accountId) {
        const { error } = await supabase.from('accounts').delete().eq('id', accountId);
        if (error) {
          console.error('Delete Error:', error.message);
        } else {
          console.log('Account deleted successfully:', accountId);
        }
      } else {
        console.log('No Account ID found in notes');
      }
    }
    return new Response('OK', { status: 200 });
  }
  return new Response('Unknown Provider', { status: 400 });
}
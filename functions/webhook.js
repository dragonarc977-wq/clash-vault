import { createClient } from '@supabase/supabase-js';

export async function onRequestPost(context) {
  const { request, env } = context;
  const rawBody = await request.text();
  const headers = request.headers;

  // 1. Verify Razorpay Signature (Security check)
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

    // 2. Handle the "Payment Captured" event
    if (payload.event === 'payment.captured') {
      // Create a SuperAdmin client using your Secret Key
      const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
      
      // Read the account ID from the notes we will send from App.jsx
      const accountId = payload.payload.payment.entity.notes?.account_id;

      if (accountId) {
        // Delete the account from the database!
        await supabase.from('accounts').delete().eq('id', accountId);
        console.log('Account deleted:', accountId);
      }
    }
    return new Response('OK', { status: 200 });
  }
  return new Response('Unknown Provider', { status: 400 });
}
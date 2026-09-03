export async function onRequestPost(context) {
  const { request, env } = context;
  const body = await request.text();
  const headers = request.headers;

  // Simple check to see if it's from Razorpay
  if (headers.get('x-razorpay-signature')) {
    // We will add the signature verification in the next step
    return new Response('Razorpay Webhook Received', { status: 200 });
  }

  // Simple check to see if it's from NOWPayments
  if (headers.get('x-nowpayments-sig')) {
    // We will add the signature verification in the next step
    return new Response('NOWPayments Webhook Received', { status: 200 });
  }

  return new Response('Unknown Provider', { status: 400 });
}
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../src/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getSafeDestination(value) {
  if (!value?.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
    return '/';
  }

  return value;
}

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const destination = getSafeDestination(requestUrl.searchParams.get('next'));

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(destination, requestUrl.origin));
    }
  }

  const loginUrl = new URL('/login', requestUrl.origin);
  loginUrl.searchParams.set('error', 'Unable to complete authentication. Please try again.');
  return NextResponse.redirect(loginUrl);
}

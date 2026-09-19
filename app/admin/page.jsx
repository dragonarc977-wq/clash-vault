import { redirect } from 'next/navigation';
import Admin from '../../src/Admin';
import { createSupabaseServerClient } from '../../src/lib/supabase/server';

export const metadata = { title: 'Administration', robots: { index: false, follow: false } };

export default async function Page() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/admin');
  }

  const { data: isAdmin, error: roleError } = await supabase.rpc('is_admin');

  if (roleError || !isAdmin) {
    return <Admin initialAuthorized={false} />;
  }

  return (
    <Admin
      initialAdmin={{ id: user.id, email: user.email }}
      initialAuthorized
    />
  );
}

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const COOKIE = 'adminToken';

export default async function AdminIndexPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;

  if (token) {
    redirect('/admin/events');
  }

  redirect('/admin/login');
}

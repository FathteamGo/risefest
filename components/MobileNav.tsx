'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileNav() {
  const pathname = usePathname();

  const isAdminRoute = pathname?.startsWith('/admin');

  const isEventDetailOrRegister =
    !!pathname && /^\/events\/[^/]+(\/register.*)?$/.test(pathname);

  if (isAdminRoute || isEventDetailOrRegister) {
    return null;
  }

  const isActive = (path: string) => {
    if (pathname === path) return true;
    if (path === '/events' && pathname?.startsWith('/events/')) return true;
    if (path === '/my-events' && pathname?.startsWith('/ticket/')) return true;
    if (path === '/my-events' && pathname === '/my-events') return true;
    return false;
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[999] border-t border-gray-200 bg-white">
      <div className="container flex px-0">

      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  
  const isAdminRoute = pathname?.startsWith('/admin');
  
  return (
    <header className="bg-white bg-opacity-50 backdrop-filter shadow-sm border-b border-gray-200 z-40 sticky top-0">
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center h-16">
          <div className="flex items-center">
            <Link href={isAdminRoute ? "/admin/events" : "/"} className="text-xl font-bold text-primary">
              {isAdminRoute ? "MJFest Admin" : "MJFest"}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
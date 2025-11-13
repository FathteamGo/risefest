'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

export default function Header() {
  const [isClient, setIsClient] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isAdmin = pathname?.startsWith('/admin');
  const isRegisterPage =
    pathname?.startsWith('/events/') && pathname?.includes('/register');
  const showSearch = !isAdmin && !isRegisterPage;

  useEffect(() => {
    setIsClient(true);
    try {
      const cookieAuthed = document.cookie
        .split('; ')
        .some((c) => c.startsWith('adminToken='));
      setIsAuthed(cookieAuthed);
    } catch {
      setIsAuthed(false);
    }
  }, [pathname]);

  const handleLogout = () => {
    document.cookie = `adminToken=; Path=/; Max-Age=0; SameSite=Lax`;
    try {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminId');
      localStorage.removeItem('adminName');
    } catch {}
    router.replace('/admin/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/85 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          <Link
            href={isAdmin ? '/admin/events' : '/'}
            className="inline-flex items-center gap-3"
            aria-label={isAdmin ? 'Go to admin events' : 'Go to homepage'}
          >
            <span className="relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-md ring-1 ring-slate-200 shadow-sm">
              <Image
                src="/icons/placeholder.jpg"
                alt="RISEfest Logo"
                width={80}
                height={80}
                className="object-contain"
              />
            </span>
            <div className="leading-tight">
              <p className="text-[15px] font-semibold tracking-tight text-slate-900">
                {isAdmin ? 'RISEfest Admin' : 'RISEfest'}
              </p>
              {isAdmin ? (
                <p className="text-[11px] text-slate-500">Admin Console</p>
              ) : null}
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {showSearch && (
              <Link
                href="/transactions/search"
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
                aria-label="Search transactions"
                title="Search transactions"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
                  />
                </svg>
                <span className="hidden sm:inline">Cari</span>
              </Link>
            )}

            {isClient && isAdmin && isAuthed ? (
              <button
                onClick={handleLogout}
                className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
                aria-label="Sign out"
              >
                Logout
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

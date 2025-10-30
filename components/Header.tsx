'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

export default function Header() {
  // -------------------------------
  // State untuk menghindari hydration mismatch
  // -------------------------------
  const [isClient, setIsClient] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = pathname?.startsWith('/admin');

  useEffect(() => {
    // Aman dibaca di client saja
    setIsClient(true);
    try {
      const token = localStorage.getItem('adminToken');
      setIsAuthed(!!token);
    } catch {
      setIsAuthed(false);
    }
  }, []);

  // -------------------------------
  // Aksi keluar admin (demo)
  // -------------------------------
  const handleLogout = () => {
    try {
      localStorage.removeItem('adminToken');
    } catch {}
    router.replace('/admin/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/85 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Kiri: Logo + judul */}
          <Link
            href={isAdmin ? '/admin/events' : '/'}
            className="inline-flex items-center gap-3"
            aria-label={isAdmin ? 'Ke halaman acara admin' : 'Ke beranda'}
          >
            {/* Ikon: pakai /public/icons/placeholder.jpg; */}
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
                <p className="text-[11px] text-slate-500">Konsol Admin</p>
              ) : null}
            </div>
          </Link>

          {/* Kanan: tombol keluar hanya di /admin & saat sudah login (dibaca di client) */}
          {isClient && isAdmin && isAuthed ? (
            <button
              onClick={handleLogout}
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
              aria-label="Keluar dari konsol admin"
            >
              Keluar
            </button>
          ) : (
            // Jika bukan admin / belum login, kosongkan ruang agar layout stabil (opsional)
            <div className="h-6 w-0 md:w-0" aria-hidden="true" />
          )}
        </div>
      </div>
    </header>
  );
}

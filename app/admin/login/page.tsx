'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
const COOKIE = 'adminToken';

export default function AdminLoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get('next') || '/admin/events';

  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function goAfterLogin() {
    const fallback = '/admin/events';
    const target = next && next.startsWith('/') ? next : fallback;

    if (typeof window !== 'undefined') {
      window.location.href = target;
    } else {
      router.replace(target);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');

    try {
      const r = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!r.ok) throw new Error('invalid');

      const j = (await r.json().catch(() => ({}))) as any;
      const token = j?.token || j?.access_token || j?.data?.token;
      if (!token) throw new Error('invalid');

      const user = j?.user || j?.data?.user || j?.data || {};
      const uid = Number(user?.id || user?.user_id || 0);
      const name = String(
        user?.name || user?.full_name || user?.username || '',
      ).trim();

      const maxAge = remember ? 60 * 60 * 24 : 60 * 60 * 4;
      document.cookie = `${COOKIE}=${encodeURIComponent(
        token,
      )}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;

      try {
        localStorage.setItem('adminToken', token);
        if (uid) localStorage.setItem('adminId', String(uid));
        if (name) localStorage.setItem('adminName', name);
      } catch {}

      goAfterLogin();
    } catch {
      setError('Email atau kata sandi salah.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="bg-white">
      <section className="mx-auto w-full max-w-6xl px-4">
        <div className="flex min-h-[calc(100svh-240px)] items-center justify-center py-6 sm:min-h-[calc(100svh-200px)] sm:py-8">
          <Card className="mx-auto w-full max-w-[380px] rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center overflow-hidden rounded-md ring-1 ring-slate-200">
                <img
                  src="/icons/placeholder.jpg"
                  alt="Logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-base font-semibold leading-tight">
                  RISEfest Admin
                </h1>
                <p className="text-xs text-slate-500">
                  Masuk untuk mengakses dasbor
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Alamat Email
                </label>
                <div className="relative mt-1">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    required
                    autoComplete="username"
                    className="h-11 pl-9"
                  />
                  <span className="pointer-events-none absolute inset-y-0 left-3 grid w-6 place-items-center text-slate-400">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M4 6h16v12H4z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      />
                      <path
                        d="M4 7l8 6 8-6"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      />
                    </svg>
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Kata Sandi
                </label>
                <div className="relative mt-1">
                  <Input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="h-11 pl-9 pr-10"
                  />
                  <span className="pointer-events-none absolute inset-y-0 left-3 grid w-6 place-items-center text-slate-400">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <rect
                        x="5"
                        y="11"
                        width="14"
                        height="8"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      />
                      <path
                        d="M8 11V8a4 4 0 118 0v3"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      />
                    </svg>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute inset-y-0 right-1 grid w-9 place-items-center rounded-md text-slate-500 hover:bg-slate-100"
                    aria-label={showPass ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                  >
                    {showPass ? (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M3 3l18 18"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        />
                        <path
                          d="M2 12s4-7 10-7c3.3 0 6 1.8 8 4"
                          stroke="currentColor"
                          strokeWidth="1.6"
                        />
                        <path
                          d="M22 12s-4 7-10 7c-3.3 0-6-1.8-8-4"
                          stroke="currentColor"
                          strokeWidth="1.6"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"
                          stroke="currentColor"
                          strokeWidth="1.6"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="3"
                          stroke="currentColor"
                          strokeWidth="1.6"
                        />
                      </svg>
                    )}
                  </button>
                </div>

                <div className="mt-2 flex items-center justify-start">
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    Ingat saya
                  </label>
                </div>
              </div>

              <Button
                disabled={busy}
                type="submit"
                className="mt-1.5 h-11 w-full rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-80"
              >
                {busy ? 'Memproses…' : 'Masuk'}
              </Button>

              <p className="text-center text-sm text-slate-500">
                Bukan admin?{' '}
                <Link href="/" className="text-indigo-600 hover:underline">
                  Ke beranda
                </Link>
              </p>
            </form>

            <p className="mt-5 text-center text-xs text-slate-400">
              © {new Date().getFullYear()} RISEfest • Konsol Admin
            </p>
          </Card>
        </div>
      </section>
    </main>
  );
}

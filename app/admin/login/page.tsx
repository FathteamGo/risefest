'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { admins } from '@/lib/dummy-data';
import Container from '@/components/ui/Container';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // jika sudah login, lempar ke /admin/events
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('adminToken');
    if (token) router.replace('/admin/events');
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // EXPECT: admins = [{ id: 1, name: 'Admin Booth', email: '...', password: '...' }, ...]
    const admin = admins.find((a: any) => a.email === email /* && a.password === password */);

    if (admin) {
      localStorage.setItem('adminToken', 'dummy-token');
      localStorage.setItem('adminId', String(admin.id || 1));
      localStorage.setItem('adminName', String(admin.name || 'Admin Booth'));
      router.push('/admin/events');
    } else {
      setError('Email atau kata sandi tidak valid');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Container className="py-16">
        <div className="mx-auto w-full max-w-md">
          <Card className="border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mb-6 flex flex-col items-center">
              {/* ganti ke <Image> kalau mau */}
              <img src="/icons/placeholder.jpg" alt="Logo" className="mb-3 h-12 w-12 rounded-md object-cover" />
              <h1 className="text-center text-2xl font-bold">RISEfest Admin</h1>
              <p className="text-center text-sm text-muted-foreground">Masuk untuk mengakses dasbor</p>
            </div>

            {error ? (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-1 block text-sm font-medium">Alamat Email</label>
                <Input type="email" value={email} placeholder="admin@example.com" onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Kata Sandi</label>
                <Input type="password" value={password} placeholder="••••••••" onChange={(e) => setPassword(e.target.value)} required />
                <div className="mt-2 flex items-center justify-between">
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    Ingat saya
                  </label>
                  <a href="#" className="text-sm text-primary hover:underline">Lupa kata sandi?</a>
                </div>
              </div>

              <Button type="submit" className="mt-2 w-full bg-blue-500 text-white hover:bg-blue-600">
                Masuk
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Bukan admin?{' '}
              <Link href="/" className="text-primary hover:underline">
                Ke beranda
              </Link>
            </div>
          </Card>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} RISEfest • Konsol Admin
          </p>
        </div>
      </Container>
    </div>
  );
}

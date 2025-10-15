'use client';

import { useState } from 'react';
import { admins } from '@/lib/dummy-data';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Container from '@/components/ui/Container';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Find admin by email
    const admin = admins.find((a: any) => a.email === email);
    
    // In a real app, you would hash and compare passwords
    // For this demo, we'll just check if the admin exists
    if (admin) {
      // Simulate successful login
      // In a real app, you would store the token in localStorage or a cookie
      localStorage.setItem('adminToken', 'dummy-token');
      router.push('/admin/events');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <Container>
        <div className="max-w-md w-full mx-auto">
          <Card className="p-8">
            <div className="text-center mb-8">
              <div className="mx-auto bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Login</h1>
              <p className="text-gray-600">Sign in to access the admin dashboard</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-6">
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Forgot your password?
                  </a>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full font-medium"
              >
                Sign in
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Not an admin?{' '}
                <Link href="/" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Go to homepage
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </Container>
    </div>
  );
}
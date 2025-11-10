import './globals.css';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import Layout from '@/components/Layout';
// import { AnalyticsProvider } from '@/components/AnalyticsProvider';

export const metadata: Metadata = {
  title: 'RISEfest - Muda Juara Festival',
  description: 'Event booking and ticketing system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* <Suspense fallback={null}>
          <AnalyticsProvider />
        </Suspense> */}

        <Suspense fallback={null}>
          <Layout>{children}</Layout>
        </Suspense>
      </body>
    </html>
  );
}

import './globals.css';
import type { Metadata } from 'next';
import Layout from '@/components/Layout';
import { AnalyticsProvider } from '@/components/AnalyticsProvider';

export const metadata: Metadata = {
  title: 'MJFest - Muda Juara Festival',
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
        <AnalyticsProvider />
        <Layout>
          {children}
        </Layout>
      </body>
    </html>
  );
}
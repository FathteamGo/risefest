import './globals.css';
import type { Metadata } from 'next';
import Layout from '../components/Layout';

export const metadata: Metadata = {
  title: 'Event Ticketing System',
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
        <Layout>
          {children}
        </Layout>
      </body>
    </html>
  );
}
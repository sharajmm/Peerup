import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from '@/components/ui/toaster';
import Navbar from '@/components/layout/navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PeerUp - Peer-to-Peer Learning Platform',
  description: 'Connect with peers to learn and teach skills in a collaborative environment.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900`}>
        <AuthProvider>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <Navbar />
            <main className="relative">
              {children}
            </main>
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
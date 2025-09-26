import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/layout/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PeerUp - Peer-to-Peer Learning Platform",
  description:
    "Connect with peers to learn and teach skills in a collaborative environment.",
  keywords: [
    "peer learning",
    "peer-to-peer learning",
    "peerup",
    "peerupedu",
    "peerup education",
    "peer to peer",
    "study group",
    "learn online",
    "teach online",
    "learning platform",
    "mentorship",
    "collaborative learning",
    "sharaj",
  ],
  authors: [
    { name: "PeerUp", url: "https://peerupedu.vercel.app" },
    { name: "Sharaj", url: "https://peerupedu.vercel.app" },
  ],
  openGraph: {
    title: "PeerUp - Peer-to-Peer Learning Platform",
    description:
      "Connect with peers to learn and teach skills in a collaborative environment.",
    siteName: "PeerUp",
    type: "website",
    url: "https://peerupedu.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "PeerUp - Peer-to-Peer Learning Platform",
    description:
      "Connect with peers to learn and teach skills in a collaborative environment.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Base URL used to resolve absolute URLs for open graph / twitter images and canonicals
// Note: metadataBase export removed for compatibility with the project's Next.js types.
// If you upgrade Next.js and want proper OG image resolution at build time, we can add
// `export const metadataBase = new URL('https://peerupedu.vercel.app')` later.

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900`}
      >
        <AuthProvider>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <Navbar />
            <main className="relative">{children}</main>
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}

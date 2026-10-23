import { siteConfig } from './lib/siteConfig';
import { getSiteUrl } from './lib/siteUrl';
import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Analytics } from '@vercel/analytics/react';

const siteUrl = getSiteUrl();

// Global SEO Metadata
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: `Tech, AI & Machine Learning Jobs | ${siteConfig.name}`,
  description:
    "Browse AI, machine learning and engineering jobs at leading tech companies. Search by role or location and filter for remote positions.",
  openGraph: {
    url: '/',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: `${siteConfig.name}: AI, machine learning and tech jobs` }],
    title: `Tech, AI & Machine Learning Jobs | ${siteConfig.name}`,
    description:
      "Browse AI, machine learning and engineering jobs at leading tech companies. Search by role or location and filter for remote positions.",
    siteName: siteConfig.name,
    type: 'website',
  },
  twitter: { card: 'summary_large_image', images: ['/og-default.png'] },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased min-h-screen flex flex-col font-sans">

        <Header />

        {/* This renders whatever page the user is currently on (e.g. page.tsx) */}
        <div className="flex-grow">
          {children}
        </div>

        <Footer />

        {/* Vercel Web Analytics */}
        <Analytics />

      </body>
    </html>
  );
}

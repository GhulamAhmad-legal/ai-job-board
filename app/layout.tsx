import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Analytics } from '@vercel/analytics/react';

// Global SEO Metadata
export const metadata: Metadata = {
  title: "AI Job Board | Find Remote Artificial Intelligence Jobs",
  description: "The premier B2B platform for AI professionals. Find the latest remote jobs in Machine Learning, Prompt Engineering, and AI Safety.",
  keywords: ["AI jobs", "remote artificial intelligence jobs", "machine learning jobs", "US remote AI"],
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
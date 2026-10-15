import type { ReactNode } from 'react';
import { siteConfig } from '../lib/siteConfig';

export default function LegalPage({
  title,
  showUpdated = true,
  children,
}: {
  title: string;
  showUpdated?: boolean;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#F5F6F8] font-sans pb-20">
      <div className="max-w-[800px] mx-auto px-4 mt-10">
        <article className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 md:p-12 text-[16px] leading-relaxed text-gray-700 [&_h2]:text-[20px] [&_h2]:font-extrabold [&_h2]:text-gray-900 [&_h2]:mt-8 [&_h2]:mb-3 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_li]:mb-1.5 [&_a]:text-blue-600 [&_a]:underline">
          <h1 className="text-[32px] md:text-[40px] font-extrabold text-gray-900 tracking-tight mb-2">
            {title}
          </h1>
          {showUpdated && (
            <p className="text-[14px] text-gray-500 mb-6">
              Last updated: {siteConfig.lastUpdated}
            </p>
          )}
          {children}
        </article>
      </div>
    </main>
  );
}

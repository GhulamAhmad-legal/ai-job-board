'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

// A "Back" link that returns to the page the visitor came from (company page, landing page, home...).
// If they arrived some other way (Google, a shared link, a new tab) it goes to `fallbackHref`.
// Without JavaScript, or with ctrl/cmd-click, it is a normal link to `fallbackHref`.
export default function BackLink({
  fallbackHref = '/',
  className,
  children,
}: {
  fallbackHref?: string;
  className?: string;
  children: ReactNode;
}) {
  const router = useRouter();

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    try {
      const cameFromThisSite = !!sessionStorage.getItem('nav:prev');
      if (cameFromThisSite && window.history.length > 1) {
        e.preventDefault();
        router.back();
      }
    } catch {
      // storage blocked: fall through to the normal link
    }
  };

  return (
    <Link href={fallbackHref} onClick={onClick} className={className}>
      {children}
    </Link>
  );
}

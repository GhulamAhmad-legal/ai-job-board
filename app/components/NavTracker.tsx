'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

// Remembers the page the visitor was on before the current one (within this browser tab), so the
// "Back" link on a job page can return to where they came from: a company page, a landing page,
// the home page. Nothing is sent anywhere; it only uses this tab's sessionStorage.
export default function NavTracker() {
  const pathname = usePathname();
  const firstLoad = useRef(true);

  useEffect(() => {
    try {
      const last = sessionStorage.getItem('nav:last');

      if (firstLoad.current) {
        firstLoad.current = false;
        // A fresh page load: only trust the stored history if the visitor came from this site.
        let cameFromThisSite = false;
        try {
          cameFromThisSite = !!document.referrer && new URL(document.referrer).origin === window.location.origin;
        } catch {}
        if (!cameFromThisSite) sessionStorage.removeItem('nav:prev');
        else if (last && last !== pathname) sessionStorage.setItem('nav:prev', last);
        sessionStorage.setItem('nav:last', pathname);
        return;
      }

      if (last !== pathname) {
        if (last) sessionStorage.setItem('nav:prev', last);
        sessionStorage.setItem('nav:last', pathname);
      }
    } catch {
      // storage can be blocked (private mode): the back link then just uses its fallback
    }
  }, [pathname]);

  return null;
}

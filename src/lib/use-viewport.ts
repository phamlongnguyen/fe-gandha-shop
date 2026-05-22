import { useEffect, useState } from 'react';

const MOBILE_QUERY = '(max-width: 640px)';
const PREFER_DESKTOP_KEY = 'gandha-prefer-desktop';

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}

export function preferDesktop(): boolean {
  return typeof window !== 'undefined' && localStorage.getItem(PREFER_DESKTOP_KEY) === '1';
}

export function setPreferDesktop(v: boolean) {
  if (v) localStorage.setItem(PREFER_DESKTOP_KEY, '1');
  else localStorage.removeItem(PREFER_DESKTOP_KEY);
}

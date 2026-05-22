import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';

interface MPanelProps {
  onClose: () => void;
  title: string;
  sub?: string;
  right?: ReactNode;
  accent?: boolean;
  children: ReactNode;
}

export default function MPanel({ onClose, children, title, sub, right, accent = false }: MPanelProps) {
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const phone = document.querySelector<HTMLElement>('.m-app') ?? document.body;
    setHost(phone);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!host) return null;

  const node = (
    <div className="m-panel">
      <div className={`m-header ${accent ? 'accent' : ''}`}>
        <button className="m-header-btn" onClick={onClose} aria-label="Đóng" type="button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5m0 0 7-7m-7 7 7 7" />
          </svg>
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1>{title}</h1>
          {sub && <div className="sub">{sub}</div>}
        </div>
        {right}
      </div>
      {children}
    </div>
  );

  return createPortal(node, host);
}
